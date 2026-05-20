# AIP Repair Command Blueprint

**生成日期**: 2026-05-20

---

## 设计原则

所有 repair 命令只生成计划（plan-only），不修改任何文件。

## 命令集

| 命令 | 行为 | 安全等级 |
|---|---|---|
| `aip repair` | 默认 = `aip repair plan` | safe |
| `aip repair check` | 检查可修复项 | safe |
| `aip repair plan` | 生成修复计划 | safe |
| `aip repair command-pack --plan` | 修复命令包（仅计划） | safe |
| `aip repair restore-point` | 查看可用恢复点 | safe |
| `aip repair source --plan` | 源码恢复计划 | warning |

## 中文别名

```powershell
aip 修复
```

若中文别名出现编码风险，提示用户使用 `aip repair`。

## 检查范围

- Git branch/head/status
- Project root
- AIP CLI availability
- npm scripts availability
- Command pack docs availability
- Restore point folder existence
- Stage C status (if API reachable)
- Feature flag status (if API reachable)

## 输出路径

```
E:\_AIP_REPORTS\AIP_repair_plan_YYYYMMDD_HHMMSS.json
E:\_AIP_REPORTS\AIP_repair_plan_YYYYMMDD_HHMMSS.md
```

## 禁止事项

1. 禁止真实 restore
2. 禁止覆盖源码
3. 禁止删除文件
4. 禁止 git reset --hard
5. 禁止自动恢复 DB
6. 禁止执行 full restore
7. 禁止 taskkill/restart
