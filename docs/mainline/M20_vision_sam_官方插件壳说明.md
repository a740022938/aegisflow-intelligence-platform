# M20 vision-sam 官方插件壳说明

## 本轮范围
1. 仅接入 vision-sam 官方插件壳。
2. 不接入 vision-yolo 插件壳。
3. 不新增其他能力。
4. 不修改 workflow/index.ts 与 task-execute/*。

## 插件壳结构
1. `plugins/builtin/vision-sam/manifest.json`
2. `plugins/builtin/vision-sam/dist/index.js`

## manifest 关键字段
1. `plugin_id=vision-sam`
2. `capabilities=["vision"]`
3. `risk_level=MEDIUM`
4. `permissions=["db:read"]`
5. `source_type=official_plugin_shell`
6. `managed_by=local-api-core`

## 链路行为
1. discovery：可发现 vision-sam 插件壳。
2. registry：记录为 `source=official_plugin_shell`。
3. status：通过 `/api/plugins` 与 `/api/plugins/status` 可观测。
4. catalog：`/api/vision/catalog` 可看到对应壳状态映射。

## 边界声明
1. 本轮是“插件壳接入”，不是“执行实现迁移”。
2. SAM 实际执行仍在主程序 dry-run 试点逻辑中。
3. execute 范围保持 M17/M18/M19 基线不变。
