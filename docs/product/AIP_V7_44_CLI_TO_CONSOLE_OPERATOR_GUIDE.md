# AIP v7.44 — CLI-to-Console Operator Guide

**Status:** P2 Documentation
**Date:** 2026-05-20
**Baseline:** AIP v7.43 Final Seal

---

## 1. Purpose

This guide helps operators navigate between CLI commands and Web Console pages. It answers: "What do I type in the terminal, and what do I see in the browser?"

## 2. Starting Point

Open PowerShell and navigate to the project root:

```powershell
PS C:\Users\74002> Set-Location E:\AIP
PS E:\AIP>
```

## 3. CLI Commands

### Main Entry
```powershell
PS E:\AIP> aip
```
Output: Color-coded Command Center listing all available subcommands.

### Phase Context
```powershell
PS E:\AIP> aip where
```
Output: Current branch (main), HEAD commit hash, working tree status.

### Safety State
```powershell
PS E:\AIP> aip safe-status
```
Output: Stage C status (disabled), feature flag state (off), boundary status.

### Encoding Diagnostics
```powershell
PS E:\AIP> aip doctor encoding
```
Output: Shell type, codepage, color support, unicode support, language.

### Repair Plan
```powershell
PS E:\AIP> aip repair plan
```
Output: JSON+MD repair plan report. No file modification.

### Receipt Template
```powershell
PS E:\AIP> aip receipt template
```
Output: Standard receipt format for phase documentation.

## 4. Web Console Pages

| Route | Page | When to Open |
|-------|------|-------------|
| `/operator-runtime-readiness-console-preview` | Runtime Readiness Console | After `aip safe-status` for detailed view |
| `/stage-c-authorization-review-pack-preview` | Auth Review Pack | Before any Stage C discussion |
| `/operator-end-to-end-flow-preview` | E2E Flow Preview | To understand the complete operator path |
| `/aip-memory-knowledge-preview` | Memory Knowledge | To review memory baseline |

## 5. CLI to Console Mapping

| CLI Output | Console Section |
|------------|----------------|
| Stage C disabled | Safety Snapshot → Stage C |
| Feature flag off | Safety Snapshot → Feature Flag |
| POST blocked | Safety Snapshot → POST Runtime |
| DB write blocked | Safety Snapshot → DB Write |
| Repair plan-only | Repair Plan-only Status |
| Memory baseline | Memory Baseline Status |

## 6. Safety

All CLI commands in this guide are readonly. No command modifies files, enables Stage C, or executes runtime operations.
