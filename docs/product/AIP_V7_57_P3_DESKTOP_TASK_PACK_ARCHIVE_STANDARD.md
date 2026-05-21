# AIP v7.57-P3 Desktop Task Pack Archive Standard

**Date:** 2026-05-21
**Phase:** P3
**Status:** Standard — mandatory for all future task packs

---

## 1. Mandatory Phase -1

Every future task pack **must** include the following section as Phase -1:

```text
Phase -1 — Local Task Pack Archive

Before doing any project work, save this full task pack to:
C:\Users\74002\Desktop\AIP_TASK_PACKS\<TASK_FILE_NAME>.txt

Rules:
1. Create C:\Users\74002\Desktop\AIP_TASK_PACKS if missing.
2. Save the full task pack before modifying any project file.
3. If the file exists, create a timestamped copy instead of overwriting.
4. Mention the saved desktop task pack path in the final receipt.
5. Do not commit the desktop task pack into git.
```

---

## 2. File Naming Convention

```
AIP_v<MAJOR>.<MINOR>_<PHASE>_<DESCRIPTIVE_NAME>_Task_Pack.txt
```

Examples:
- `AIP_v7.57_D1_Post_Readiness_Product_Hardening_Plan_Task_Pack.txt`
- `AIP_v7.57_P1_Repo_Hygiene_Decision_Task_Pack.txt`
- `AIP_v7.57_P2_Build_Warning_Evidence_Review_Task_Pack.txt`

---

## 3. Receipt Requirement

Every phase receipt must include the desktop task pack path field:

```
Desktop task pack saved path: C:\Users\74002\Desktop\AIP_TASK_PACKS\<...>.txt
```

---

## 4. When to Create a New Ledger

Generate a work ledger after:
- Every D-phase (decision/planning phase)
- Every seal or recheck (P5)
- Every release/restore decision change
- Whenever ChatGPT context becomes long
- Whenever the user asks "what have we done?"

---

## 5. Recovery from ChatGPT Download Failure

If the task pack file cannot be downloaded from ChatGPT to `E:\`:

1. The execution assistant must reconstruct the full task pack content
   from the conversation and save it to the desktop archive path.
2. If the source file is missing (`Get-Content` fails), fall back to
   writing the task pack content directly from the conversation text.
3. The receipt must note if content was reconstructed rather than
   sourced from a file download.
4. The desktop archive is the authoritative local copy regardless
   of source method.

---

## 6. Anti-Commit Rule

The desktop task pack archive must never be:
- Staged via `git add`
- Committed to the repository
- Placed inside `E:\AIP\` unless the task explicitly requires a repo doc

Files in `C:\Users\74002\Desktop\AIP_TASK_PACKS\` are outside the repo
and safe from accidental staging.
