# OPENAIP_V8_NEXT_12_PHASES_ROADMAP

## P2A Identity Kernel hardening
- target: strengthen resolver/help/test contracts
- files likely affected: apps/aip-cli/src/**, apps/aip-cli/tests/**
- risk: low
- expected duration: 0.5-1 day
- verification: cli build + tests + manual from external cwd
- stop conditions: any runtime mutation requirement

## P2B Runtime Kernel readonly
## P2C Registry Kernel readonly
## P3A Agent Center readonly
## P3B Provider Manager readonly
## P3C Integration Center readonly
## P3D Local Apps Center readonly
## P4A Task Center draft
## P4B Receipt Intake draft
## P4C Audit Center readonly
## P5A Policy Center readonly
## P5B Execution Gateway dry-run only

For each remaining phase:
- target: readonly contract expansion
- files likely affected: docs/product/* and aip-cli readonly command surfaces
- risk: low-medium
- expected duration: 0.5-1 day each
- verification: no mutation checks + tests + receipts
- stop conditions: requires Gate opening, Stage C enablement, runtime restart, DB writes
