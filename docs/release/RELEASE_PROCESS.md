# AIP Release Process

## Version Numbering

- `v7.2.0-stable` — sealed stable baseline
- `v7.2.1-responsive-hotfix` — minor patch with clear scope
- `v7.3.0` — feature release

## Release Checklist

Before creating a release, ensure:

### 1. Pass All Checks

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run db:doctor
```

### 2. Update Version Numbers

```bash
# Update in:
package.json                          # root version
apps/local-api/package.json           # API version
apps/web-ui/package.json              # Web UI version
apps/aip-cli/package.json             # CLI version
apps/web-ui/src/constants/appVersion.ts  # BUILD_DATE
apps/web-ui/src/constants/appMeta.ts     # releaseUrl
```

### 3. Update Documentation

- Update CHANGELOG.md with release notes
- Update README.md version badge and build date
- Update docs/release/RELEASE_PROCESS.md if process changed

### 4. Commit and Tag

```bash
git add .
git commit -m "chore: seal AIP vX.Y.Z stable baseline"
git tag -a vX.Y.Z-stable -m "AIP vX.Y.Z stable sealed baseline"
git push origin main
git push origin vX.Y.Z-stable
```

### 5. Create GitHub Release

Go to GitHub Releases page and create a new release from the tag.
Include: version, changelog, verification results, backup paths.

## What NOT to Commit

- `.env` / `.env.local` / `.env.*` (except `.env.example`)
- `node_modules/`
- `dist/`
- `logs/`
- `*.db` / `*.db-shm` / `*.db-wal`
- `*.pt` / `*.pth` / `*.onnx` / `*.safetensors`
- `*.mp4` / `*.zip`
- `datasets/` / `models/` / `runs/` / `backups/`
- `_AIP_BACKUPS/` / `_AIP_REPORTS/`
- Desktop backup directories
- API keys, tokens, secrets, passwords
