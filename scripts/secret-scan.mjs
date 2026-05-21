import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const PATTERNS = [
  { name: 'Hardcoded password', regex: /password\s*[:=]\s*['"][^'"]{4,}['"]/i },
  { name: 'Hardcoded secret', regex: /(?:secret|token|api[_-]?key)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i },
  { name: 'OpenAI/API key literal', regex: /sk-[A-Za-z0-9]{20,}/ },
  { name: 'GitHub token literal', regex: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
  { name: 'Private key block', regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'JWT literal', regex: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/ },
  { name: 'npm token literal', regex: /npm_[A-Za-z0-9]{36,}/ },
  { name: 'REDIS_PASSWORD literal', regex: /REDIS_PASSWORD\s*[:=]\s*['"][^'"]+['"]/ },
];

const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'build', '.next', 'coverage', 'logs', 'data', 'backups'];
const EXCLUDE_FILES = ['.env.example'];
const ALLOWED_HITS = [
  'apps/aip-cli/docs/ml_manual.txt:262',
  'apps/web-ui/src/pages/CostRouting.tsx:604',
  'apps/web-ui/src/pages/CostRouting.tsx:605',
  'apps/web-ui/src/components/governance/ClosureMetricsSnapshot.tsx:114',
  'apps/web-ui/src/pages/ModelGateway.tsx:59',
  'docs/product/AIP_V7_65_P1_OPENCLAW_TOKEN_AUTH_UI_IMPLEMENTATION_REPORT.md:77',
];

function shouldExclude(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return EXCLUDE_DIRS.some(d => parts.includes(d)) || EXCLUDE_FILES.some(f => filePath.endsWith(f));
}

function getTrackedFiles() {
  try {
    const out = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return out.split('\n').filter(Boolean).map(f => join(ROOT, f));
  } catch {
    console.warn('[secret-scan] Not a git repo or git unavailable; falling back to manual walk.');
    return [];
  }
}

function walkDir(dir) {
  const results = [];
  try {
    const entries = execSync(`dir /s /b "${dir}\\*"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 10000 }).split('\n').filter(Boolean);
    for (const entry of entries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;
      if (shouldExclude(trimmed)) continue;
      try {
        if (!statSync(trimmed).isDirectory()) {
          results.push(trimmed);
        }
      } catch {}
    }
  } catch {}
  return results;
}

function scanFile(filePath, patterns) {
  const hits = [];
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of patterns) {
        if (pattern.regex.test(lines[i])) {
          const trimmed = lines[i].replace(/(['"][^'"]{2,}['"])/g, (m) => {
            if (m.length > 8) return m.slice(0, 4) + '****' + m.slice(-2);
            return m;
          });
          hits.push({ file: filePath, line: i + 1, pattern: pattern.name, snippet: trimmed.trim().slice(0, 120) });
        }
      }
    }
  } catch {}
  return hits;
}

async function main() {
  console.log('=== Secret Scan ===\n');
  let files = getTrackedFiles();
  if (files.length === 0) {
    console.log('[secret-scan] No git-tracked files found; scanning source directories...');
    files = walkDir(join(ROOT, 'apps'));
  }

  const textFiles = files.filter(f => /\.(ts|tsx|js|mjs|json|yaml|yml|toml|ini|cfg|conf|env|md|txt|bat|ps1|sh|mjs|cjs)$/i.test(f));
  let totalHits = 0;
  const allHits = [];

  for (const file of textFiles) {
    const hits = scanFile(file, PATTERNS);
    if (hits.length > 0) {
      const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');
      const filtered = hits.filter(h => !ALLOWED_HITS.includes(`${rel(h.file)}:${h.line}`));
      if (filtered.length > 0) {
        allHits.push(...filtered);
        totalHits += filtered.length;
      }
    }
  }

  if (totalHits === 0) {
    console.log('PASS: No secrets detected in tracked source files.\n');
    process.exit(0);
  }

  console.log(`FAIL: ${totalHits} potential secret(s) detected:\n`);
  for (const hit of allHits) {
    const rel = relative(ROOT, hit.file).replace(/\\/g, '/');
    console.log(`  [${hit.pattern}] ${rel}:${hit.line}`);
    console.log(`    ${hit.snippet}\n`);
  }
  console.log('Review each hit above. If false positive, add to ALLOWED_HITS in scripts/secret-scan.mjs or adjust patterns.\n');
  process.exit(1);
}

main().catch(e => {
  console.error('[secret-scan] Error:', e.message);
  process.exit(1);
});
