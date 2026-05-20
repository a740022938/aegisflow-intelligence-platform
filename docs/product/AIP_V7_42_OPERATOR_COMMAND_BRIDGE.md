# AIP v7.42 — Operator Command Bridge

**生成日期**: 2026-05-20
**Stage C**: DISABLED

---

## 目的

建立 CLI 命令与 Operator Runtime Readiness Console 之间的概念桥接，方便操作者从总控台快速定位到对应 CLI 命令。

## 桥接表

| 总控台区域 | CLI 命令 | 输出路径 |
|-----------|----------|----------|
| Baseline | `aip`, `aip where`, `git rev-parse HEAD` | 终端 |
| Safe Status | `aip safe-status` | 终端 |
| Stage C Gate | `aip stage-c status`, `aip doctor stage-c` | 终端 |
| Feature Flag | `aip stage-c status` | 终端 |
| Repair | `aip repair`, `aip repair check`, `aip repair plan` | `E:\_AIP_REPORTS\` |
| Memory | `aip help` (P4 preview route) | `/aip-memory-knowledge-preview` |
| Encoding | `aip doctor encoding`, `aip doctor env`, `aip doctor ports` | 终端 |
| Validation | `aip check`, `aip check full`, `aip smoke` | 终端 + 报告 |
| Safety Boundary | `aip doctor stage-c` | 终端 |
| Operator Decision | `aip seal status` | 终端 |

## 安全约束

- Stage C remains disabled.
- Feature flag remains off.
- No POST runtime.
- No DB write.
- No executor.
- No external control.
- No connector action.
- No restart.
- No tag/release.
- No runtime memory mutation.
