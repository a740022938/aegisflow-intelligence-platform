# Community Contribution Guide

## Scope
This repository is the public Community Edition baseline of AIP.
Please keep changes focused, testable, and free of private data.

## Before you submit
1. Run basic checks:
- `pnpm install`
- `pnpm --dir apps/local-api build`
- `pnpm --dir apps/web-ui build`
2. Confirm no secrets are committed:
- no real token/api key
- no `.env` / private config
- no local database snapshots / logs / private datasets
3. Keep PR scope small and explain what changed.

## Reporting bugs
Please include at least:
1. what you did
2. expected result
3. actual result
4. reproduction steps
5. logs or screenshots (sanitized)
6. environment (OS, Node, pnpm, browser)

## Feature requests
- describe problem first
- explain why current behavior is insufficient
- propose minimal acceptable behavior

## Security and privacy
- Never commit real tokens, private model assets, or customer data.
- If you discover a sensitive leak, open a private report to maintainers first.
