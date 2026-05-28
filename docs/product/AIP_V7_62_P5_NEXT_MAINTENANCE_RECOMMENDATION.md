# AIP v8.0-P5 Next Maintenance Recommendation

**Phase:** v8.0-P5
**Status:** RECOMMENDED

---

## Options

| Option | Description | Effort | Priority |
|---|---|---|---|
| A | Stop engineering and use released OpenAIP v8.0.0 | None | Immediate |
| B | Run physical touch-device QA | Low | Medium |
| C | Plan v7.63 maintenance / cleanup for dirty concurrent work | Medium | Medium |
| D | Plan broader GovernanceCenter component split | Medium | Low |
| E | Plan restore verification (requires separate authorization) | Medium | Low |
| F | Start new development branch for post-v8.0 features | Low | Future |

## Recommended Default

**A for now** — stop engineering and use released OpenAIP v8.0.0.

If continuing engineering work, **Option C** is recommended: v7.63 maintenance / cleanup of the pre-existing dirty concurrent work (ModelGateway, superpowers), not new features.

## Rationale

- The v8.0 release pipeline (P1→P5) is complete and sealed
- No new features are pending for the current release
- The pre-existing dirty working tree should be addressed before the next release cycle
- Physical touch-device QA remains optional unless the owner requires it
- Restore verification requires separate authorization
