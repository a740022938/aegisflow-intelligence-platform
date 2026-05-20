import { execSync } from 'node:child_process';

export interface BannerOptions {
  noColor: boolean;
  plainMode: boolean;
  asciiMode: boolean;
  noBanner: boolean;
}

const BANNER_LINES = [
  '   ____  ____  _____ _   _    _    ___ ____  ',
  '  / __ \\|  _ \\| ____| \\ | |  / \\  |_ _|  _ \\ ',
  ' | |  | | |_) |  _| |  \\| | / _ \\  | || |_) |',
  ' | |__| |  __/| |___| |\\  |/ ___ \\ | ||  __/ ',
  '  \\____/|_|   |_____|_| \\_/_/   \\_\\___|_|    ',
  '                                              ',
  '              O P E N A I P                   ',
];

const GRADIENT_COLORS = [
  '\x1b[96m',
  '\x1b[36m',
  '\x1b[94m',
  '\x1b[92m',
  '\x1b[32m',
  '',
  '\x1b[96m',
];

const RESET = '\x1b[0m';

function getGitStatus(): { branch: string; head: string; clean: boolean } {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const status = execSync('git status --short', { encoding: 'utf8', stdio: 'pipe' }).trim();
    return { branch, head, clean: status.length === 0 };
  } catch {
    return { branch: 'unavailable', head: '', clean: false };
  }
}

export function renderBanner(opts: BannerOptions): string[] {
  if (opts.noBanner) return [];
  if (opts.plainMode || opts.asciiMode) {
    return [...BANNER_LINES];
  }
  const lines: string[] = [];
  for (let i = 0; i < BANNER_LINES.length; i++) {
    const color = GRADIENT_COLORS[i] || '';
    lines.push(color + BANNER_LINES[i] + RESET);
  }
  return lines;
}

export function renderStatusLines(version: string): string[] {
  const git = getGitStatus();
  const gitStr = git.branch !== 'unavailable'
    ? `${git.branch} @ ${git.head} / ${git.clean ? 'CLEAN' : 'DIRTY'}`
    : 'unavailable';
  return [
    `AIP CLI v${version}`,
    `Track: v7.48 Local RC Candidate`,
    `Project: ${process.cwd()}`,
    `Git: ${gitStr}`,
    `Mode: SAFE / Stage C DISABLED / Feature Flag OFF`,
    `Release: Local RC candidate / No tag / No GitHub Release`,
  ];
}
