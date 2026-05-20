import { execSync } from 'node:child_process';

function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe', cwd: 'E:\\AIP' }).trim();
  } catch {
    return 'unknown';
  }
}

export async function runReceiptTemplate() {
  const head = runGit('rev-parse --short HEAD');

  const template = `## Receipt

Phase:
pre-HEAD:
new commit: ${head}
push result:
files changed:

Validation:
- typecheck:
- tests:
- build:
- diff check:
- smoke:
- secret scan:

Safety:
- Stage C:
- feature flag:
- POST runtime:
- DB write:
- executor:
- external control:
- connector action:
- repair:
- memory:
- authorization:
- sidebar exposure:
- restart/taskkill:
- tag/release:

Reports:
Receipts:

Verdict:
`;

  console.log(template);
}
