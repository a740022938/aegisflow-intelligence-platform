import sqlite3
import json
from datetime import datetime

db_path = r'E:\AIP\packages\db\agi_factory.db'
db = sqlite3.connect(db_path)

existing = db.execute("SELECT id FROM templates WHERE id = 'tpl-yolo-real-inference'").fetchone()
if existing:
    db.execute("DELETE FROM templates WHERE id = 'tpl-yolo-real-inference'")

now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')

template = {
    'id': 'tpl-yolo-real-inference',
    'code': 'yolo_real_inference',
    'name': 'YOLO 真实推理 - 麻将检测',
    'category': 'vision_pipeline',
    'version': '1.0.0',
    'status': 'active',
    'description': '使用本地 YOLO 模型对图片目录进行麻将牌目标检测',
    'definition_json': '{}',
    'input_schema_json': json.dumps({
        'type': 'object',
        'required': ['experiment_id', 'source_path'],
        'properties': {
            'experiment_id': {'type': 'string', 'title': '实验 ID'},
            'source_path': {'type': 'string', 'title': '图片路径', 'description': '图片文件或目录路径'},
            'model_name': {'type': 'string', 'title': '模型路径'},
            'conf_threshold': {'type': 'number', 'title': '置信度阈值', 'default': 0.25},
        }
    }, ensure_ascii=False),
    'default_input_json': json.dumps({
        'experiment_id': 'yolo-inference-demo',
        'source_path': 'E:\\数据集\\tupian',
        'model_name': 'E:\\_AIP_ASSETS\\models\\Model\\best.pt',
        'conf_threshold': 0.25,
    }, ensure_ascii=False),
    'workflow_steps_json': json.dumps([
        {
            'step_key': 'yolo_detect',
            'step_name': 'YOLO 麻将检测',
            'step_order': 1,
            'require_approval': False,
        }
    ]),
    'is_builtin': 1,
    'created_at': now,
    'updated_at': now,
}

cols = ['id', 'code', 'name', 'category', 'version', 'status', 'description',
        'definition_json', 'input_schema_json', 'default_input_json',
        'workflow_steps_json', 'is_builtin', 'created_at', 'updated_at']
placeholders = ','.join(['?'] * len(cols))

db.execute(f'INSERT INTO templates ({",".join(cols)}) VALUES ({placeholders})',
           [template[c] for c in cols])
db.commit()
db.close()

print('Template created successfully!')
print('ID: tpl-yolo-real-inference')
print('Name: YOLO 真实推理 - 麻将检测')
print('Steps: yolo_detect (YOLO 麻将检测)')
