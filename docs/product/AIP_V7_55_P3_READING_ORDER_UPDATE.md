# AIP v7.55-P3 Reading Order Update

**Date:** 2026-05-21
**Phase:** P3

---

## 1. Before

`README.md` had a section titled "Operator Documentation Index" that listed
v7.45 series docs as "still current" with no explicit reading order or
distinction between current baseline and historical references.

---

## 2. After

`README.md` now has a "Reading Order" section with three tiers:

### Tier 1: Current baseline (v7.55)
Steps 1–8 form the primary reading path:
1. `START_HERE.md`
2. `README.md`
3. `AIP_V7_55_D1_ROADMAP.md`
4. `AIP_V7_55_P1_*` (fresh install result)
5. `AIP_V7_55_P2_*` (restore artifact result)
6–8. v7.55 D1 hardening plans

### Tier 2: Design-system reference (v7.51–v7.54)
Datasets shell pilot docs — kept as design-system reference.

### Tier 3: Historical operator guides (v7.45 series)
Marked as "superseded by v7.55 docs for install/restore/release gate workflows"
but remain valid as design-system and operator references.

---

## 3. Files Changed

- `README.md` — "Operator Documentation Index" replaced with "Reading Order"

---

## 4. Verdict

v7.55 is now the explicit primary reading path. v7.45 docs are reclassified as
historical. No docs were removed. No v7.52 untracked docs were touched.
