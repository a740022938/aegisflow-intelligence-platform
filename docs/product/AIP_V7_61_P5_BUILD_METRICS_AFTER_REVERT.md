# AIP v7.61-P5 Build Metrics After Revert

**Status:** RESTORED TO BASELINE

---

## GovernanceCenter Chunk Size

| Metric | Pre-Revert (P2/P3/P4) | Post-Revert | Delta |
|---|---|---|---|
| Raw size | 931.39 kB | 930.88 kB | -0.51 kB |
| Gzip size | 68.84 kB | 68.67 kB | -0.17 kB |
| Chunk filename | `GovernanceCenter-oWw0l_0x.js` | `GovernanceCenter-DWYW17e5.js` | hash restored |
| Modules | 740 | 740 | 0 |
| Warnings | 1 | 1 | 0 |

## Comparison with Original Baseline

| Metric | Pre-P2 Baseline | Post-Revert | Match? |
|---|---|---|---|
| Raw size | 930.88 kB | 930.88 kB | ✅ YES |
| Hash | `-DWYW17e5` | `-DWYW17e5` | ✅ YES |

The build output is byte-identical to the pre-P2 baseline.
