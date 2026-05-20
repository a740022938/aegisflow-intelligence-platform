# AIP v7.41 Total Construction Blueprint

**生成日期**: 2026-05-20
**基线**: main @ 27c8634

---

## Scope

This blueprint defines the total construction scope for AIP v7.41.

## 阶段分解

### D1: Blueprint + Memory Normalization
- 12 blueprint documents
- Memory baseline for v7.40
- D0/D0-b conclusion formalized

### P1: CLI Command Center Help Refresh
- Upgrade `aip` default output to Command Center format
- 7 sections: Daily Control, Diagnostics, Config, Gateway & ML, Validation, Repair, Stage C Gate
- Color rules: Cyan/Green/Yellow/Red/Gray/White
- Fallback: --plain, --no-color, --ascii, --lang zh, --lang en
- No real execution capability added

### P2: Windows Encoding Doctor
- `aip doctor encoding` command
- Detect: shell, codepage, color support, unicode support, language
- No system-wide encoding changes
- Plain/ascii fallback

### P3: Repair Plan-only System
- `aip repair` = `aip repair plan` (default)
- `aip repair check`, `aip repair plan`
- `aip repair command-pack --plan`
- `aip repair restore-point`, `aip repair source --plan`
- Output: E:\_AIP_REPORTS\AIP_repair_plan_YYYYMMDD_HHMMSS.{json,md}
- No real file modification

### P4: Memory Knowledge Base Preview
- Readonly memory registry
- AIP_PROJECT_MEMORY_BASELINE_V7_41.md
- AIP_MEMORY_GAP_CONFIDENCE_MATRIX.md
- AIP_MEMORY_UPDATE_RULES.md
- Web preview at /aip-memory-knowledge-preview (hidden, not in sidebar)

### P5: Final Seal Recheck
- Verify all phases complete
- Stage C disabled, feature flag off
- POST runtime not implemented
- DB write not occurred
- Generate seal reports

## 安全边界

- Stage C: DISABLED throughout
- Feature flag: OFF throughout
- No POST runtime behavior
- No DB write
- No executor
- No external tool control
- No connector action
- No hidden sidebar pages
- No tag/release
