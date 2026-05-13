import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Directory where reports should be written
const REPORTS_ROOT = 'E:\\_AIP_REPORTS';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function logBridgeReport(title: string, details: any) {
  try {
    ensureDir(REPORTS_ROOT);
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(REPORTS_ROOT, `AIP_COMFYUI_BRIDGE_REPORT_${date}.md`);
    const header = `# ${title} Bridge Report\nDate: ${new Date().toISOString()}\n\n`;
    const body = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
    // Add a readable separator and content
    const content = header + body + '\n\n';
    fs.appendFileSync(filePath, content, { encoding: 'utf8' });
  } catch {
    // Do not crash API in reporting failures
  }
}
