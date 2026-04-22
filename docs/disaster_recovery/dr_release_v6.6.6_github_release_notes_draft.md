# GitHub Releases 发布说明草稿（DR v6.6.6）

## Title

`AGI Model Factory DR Release v6.6.6 (Pre-Seal Baseline)`

## Tag

`dr-v6.6.6`

## Body（可直接粘贴）

This is the first Disaster Recovery (DR) baseline release for AGI Model Factory.

Recovery objective:
- If local machine/system/cloud disk/NAS fail, recovery remains possible using only this private GitHub DR repository and attached release assets.

Included assets:
1. Clean source snapshot (`*_clean_source.zip`)
2. Database init bundle (`*_db_init_bundle.zip`, schema + minimal seed template)
3. Restore manifest (`*_restore_manifest.json`)
4. SHA256 checksums (`*_SHA256SUMS.txt`)
5. Quickstart recovery guide (`*_recovery_quickstart.md`)

Environment baseline:
- Windows 11
- Node.js 22.x
- npm 10.x
- Python 3.11+
- SQLite 3.x

Validation status:
- Local DR drill completed on 2026-04-14
- Checksum verification: PASS
- Schema init verification: PASS
- Core table creation verification: PASS

Scope boundary:
- No business feature changes
- No UI mainline changes
- DR documentation and release organization only

Security note:
- No production secrets/token/PAT included
- No sensitive production DB snapshot included

Next action:
- Keep this release as the long-term recoverable baseline for ongoing development.
- Promote to next DR tag when version metadata moves to the next milestone.

