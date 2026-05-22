import { resolveProjectRoot, getGitSummary } from './projectRoot.js';

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
const GRADIENT_COLORS = ['\x1b[96m', '\x1b[36m', '\x1b[94m', '\x1b[92m', '\x1b[32m', '', '\x1b[96m'];
const RESET = '\x1b[0m';

export function renderBanner(opts: BannerOptions): string[] {
  if (opts.noBanner) return [];
  if (opts.plainMode || opts.asciiMode) return [...BANNER_LINES];
  return BANNER_LINES.map((line, i) => `${GRADIENT_COLORS[i] || ''}${line}${RESET}`);
}

export function renderStatusLines(version: string): string[] {
  const resolved = resolveProjectRoot();
  const git = getGitSummary(resolved.projectRoot);
  const gitLine = resolved.gitAvailable
    ? `${git.branch} @ ${git.head} / ${git.status ? 'DIRTY' : 'CLEAN'}`
    : 'unavailable';
  const track = 'Stable + v8 foundation';
  const release = resolved.gitAvailable ? 'detected from git tags' : 'see aip release-status';

  return [
    `AIP CLI: v${version}`,
    `Track: ${track}`,
    `Project: ${resolved.projectRoot}`,
    `Git: ${gitLine}`,
    'Mode: SAFE / Gate CLOSED / Stage C DISABLED / Feature Flag OFF',
    `Release: ${release}`,
  ];
}
