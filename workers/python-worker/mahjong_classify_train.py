"""
mahjong_classify_train.py — 麻将34类分类器训练
将YOLO detect格式转为classify目录结构，然后启动ultralytics classify训练
"""
import os
import shutil
import json
import time
from pathlib import Path
from datetime import datetime

DATASET_ROOT = Path(r"E:\AGI_Factory\data\mahjong\clean")
CLASSIFY_ROOT = Path(r"E:\AGI_Factory\data\mahjong\classify")
RUN_PROJECT = Path(r"E:\AGI_Factory\repo\runs\classify")
DATASET_YAML = DATASET_ROOT / "dataset.yaml"
RUN_NAME = f"mahjong_cls_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

# 34类中文名 (与dataset.yaml一致)
CLASS_NAMES = [
    "一万", "二万", "三万", "四万", "五万", "六万", "七万", "八万", "九万",
    "一筒", "二筒", "三筒", "四筒", "五筒", "六筒", "七筒", "八筒", "九筒",
    "一条", "二条", "三条", "四条", "五条", "六条", "七条", "八条", "九条",
    "东风", "南风", "西风", "北风", "红中", "發财", "白板",
]


def convert_detect_to_classify():
    """将YOLO detect格式(images/labels)转为classify格式(class_dir/image)"""
    print(f"[convert] 源: {DATASET_ROOT}")
    print(f"[convert] 目标: {CLASSIFY_ROOT}")

    stats = {"train": 0, "val": 0, "test": 0, "skipped_no_label": 0, "skipped_empty_label": 0}

    for split in ["train", "val", "test"]:
        img_dir = DATASET_ROOT / "images" / split
        lbl_dir = DATASET_ROOT / "labels" / split

        if not img_dir.exists():
            print(f"[convert] {split}: images目录不存在，跳过")
            continue

        for img_file in sorted(img_dir.iterdir()):
            if img_file.suffix.lower() not in (".jpg", ".jpeg", ".png", ".bmp", ".webp"):
                continue

            # 对应标签文件
            lbl_file = lbl_dir / (img_file.stem + ".txt")
            if not lbl_file.exists():
                stats["skipped_no_label"] += 1
                continue

            # 读取标签（可能有多个目标，取第一个非空行）
            lines = []
            with open(lbl_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        parts = line.split()
                        if len(parts) >= 5:
                            lines.append(parts)

            if not lines:
                stats["skipped_empty_label"] += 1
                continue

            # 每个目标生成一个分类样本（按 class_id 分目录）
            for i, parts in enumerate(lines):
                class_id = int(parts[0])
                class_name = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else f"class_{class_id}"

                # 目标目录: classify/train/一万/
                dst_dir = CLASSIFY_ROOT / split / class_name
                dst_dir.mkdir(parents=True, exist_ok=True)

                # 文件名：原图名_第几个目标（避免重名）
                suffix = f"_{i}" if len(lines) > 1 else ""
                dst_file = dst_dir / f"{img_file.stem}{suffix}{img_file.suffix}"

                # 符号链接优先，失败则复制
                try:
                    if dst_file.exists() or dst_file.is_symlink():
                        continue
                    os.symlink(str(img_file.resolve()), str(dst_file))
                except OSError:
                    shutil.copy2(str(img_file), str(dst_file))

                stats[split] += 1

    print(f"[convert] 完成: train={stats['train']}, val={stats['val']}, test={stats['test']}")
    if stats["skipped_no_label"]:
        print(f"[convert] 跳过(无标签): {stats['skipped_no_label']}")
    if stats["skipped_empty_label"]:
        print(f"[convert] 跳过(空标签): {stats['skipped_empty_label']}")
    return stats


def run_classify_train():
    """启动ultralytics classify训练"""
    from ultralytics import YOLO

    model = YOLO("yolov8n-cls.pt")  # 分类版预训练权重

    print(f"[train] 数据集: {CLASSIFY_ROOT}")
    print(f"[train] 模型: yolov8n-cls.pt")
    print(f"[train] 输出: {RUN_PROJECT / RUN_NAME}")

    results = model.train(
        data=str(CLASSIFY_ROOT),
        epochs=50,
        imgsz=224,
        batch=32,
        device=0,
        project=str(RUN_PROJECT),
        name=RUN_NAME,
        exist_ok=True,
        plots=True,
    )
    return results


def main():
    # Step 1: 格式转换
    if not CLASSIFY_ROOT.exists():
        print("=" * 60)
        print("Step 1: YOLO detect → classify 格式转换")
        print("=" * 60)
        convert_detect_to_classify()
    else:
        print(f"[skip] classify目录已存在: {CLASSIFY_ROOT}")

    # Step 2: 统计分类目录
    print("\n" + "=" * 60)
    print("分类目录统计:")
    print("=" * 60)
    for split in ["train", "val", "test"]:
        split_dir = CLASSIFY_ROOT / split
        if split_dir.exists():
            classes = [d.name for d in split_dir.iterdir() if d.is_dir()]
            total = sum(len(list(d.iterdir())) for d in split_dir.iterdir() if d.is_dir())
            print(f"  {split}: {len(classes)}类, {total}张")
        else:
            print(f"  {split}: 不存在")

    # Step 3: 启动训练
    print("\n" + "=" * 60)
    print("Step 2: 启动分类器训练")
    print("=" * 60)
    run_classify_train()


if __name__ == "__main__":
    main()
