# AIP v7.44 — CLI-to-Console Experience Spec

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** AIP v7.43 Final Seal

---

## 1. Purpose

Document the operator experience across CLI and Web Console boundaries. Answer the question: "What does the operator type, see, and click at each step?"

## 2. CLI Command Reference

### Entry
```powershell
PS C:\Users\74002> Set-Location E:\AIP
PS E:\AIP> aip
```

Output: Color-coded Command Center with sections for available subcommands.

### Phase Context
```powershell
PS E:\AIP> aip where
```

Output: Current branch, HEAD commit, working tree state.

### Safety State
```powershell
PS E:\AIP> aip safe-status
```

Output: Stage C status, feature flag state, boundary status.

### Encoding Diagnostics
```powershell
PS E:\AIP> aip doctor encoding
```

Output: Shell type, codepage, color support, unicode, language.

### Repair Plan
```powershell
PS E:\AIP> aip repair plan
```

Output: JSON+MD repair plan. No file modification.

### Receipt Template
```powershell
PS E:\AIP> aip receipt template
```

Output: Standard receipt format for phase documentation.

## 3. Web Console Mapping

| CLI Command | Console Section |
|-------------|----------------|
| `aip` | Command Center Links (section 4) |
| `aip safe-status` | Safety Snapshot (section 2) |
| `aip repair plan` | Repair Plan-only Status (section 5) |
| `aip receipt template` | Supported in receipt workflow |
| `aip doctor encoding` | Referenced in command bridge |

## 4. Safe-Status to Console Mapping

| safe-status Field | Console Equivalent |
|-------------------|-------------------|
| Stage C enabled | Safety Snapshot → Stage C |
| Feature flag state | Safety Snapshot → Feature Flag |
| POST blocked | Safety Snapshot → POST Runtime |
| DB write blocked | Safety Snapshot → DB Write |
| Executor absent | Safety Snapshot → Executor |
| External control blocked | Safety Snapshot → External Control |
| Connector action blocked | Safety Snapshot → Connector Action |

## 5. Safety

All CLI commands in this spec are readonly. No command in this spec modifies files, enables Stage C, or executes runtime operations.
