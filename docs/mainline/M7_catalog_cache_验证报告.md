# M7 Catalog Cache 验证报告

## 验证目标
确认 `/api/vision/catalog` 在 M7 下为“缓存只读路径”：
1. 不触发请求期插件初始化
2. 使用启动期生成的 cache
3. 初始化失败时回退 builtin fallback

## 验证项与结果

## 1) 启动期初始化成功后 catalog 行为
启动后查询：
- `/api/plugins/status` -> `plugin_system_active=true`、`init_failed=false`
- `/api/vision/catalog` -> `_meta.plugin_system_active=true`

说明：catalog 读取的是启动期缓存，插件系统状态来自启动结果。

## 2) 连续请求不触发重复初始化
过程：
- 读取一次 `/api/plugins/status`，记录 `init_completed_at`
- 连续访问 `/api/vision/catalog` 5 次
- 再次读取 `/api/plugins/status`

结果：
- `init_completed_at` 前后一致（未变化）
- `init_attempted` 始终为 `true`

结论：普通请求没有触发重新初始化。

## 3) 失败熔断 + fallback 验证（独立进程）
通过 `tsx` 独立验证：
- 第一次初始化传入非法 `pluginDir`，制造失败
- 第二次初始化传入合法目录

结果：
- 第二次仍维持第一次失败状态
- `init_completed_at` 相同

结论：熔断有效，失败后不会重复初始化；catalog cache 将保持 fallback（builtin-only）。

## 4) 当前 catalog 返回逻辑
- 数据来源：`visionCatalogCache`
- cache 构成：`BUILTIN_PIPELINES + 启动期缓存的插件 pipeline`
- 失败/禁用时：`visionCatalogCache = BUILTIN_PIPELINES`

## 总结
M7 的 catalog 访问路径已满足目标：
- 启动期初始化
- 请求期只读 cache
- 失败熔断
- fallback 可用
