import fs from 'node:fs';
import path from 'node:path';

const REPORTS_ROOT = 'E:\\_AIP_REPORTS';

function ensureDir() {
  if (!fs.existsSync(REPORTS_ROOT)) {
    fs.mkdirSync(REPORTS_ROOT, { recursive: true });
  }
}

export function logOpenClawComfyReport(title: string, details: any) {
  try {
    ensureDir();
    const date = new Date().toISOString().slice(0, 10);
    const filePath = path.join(REPORTS_ROOT, `AIP_OPENCLAW_COMFY_GENERATE_REPORT_${date}.md`);
    const header = `# ${title}\nDate: ${new Date().toISOString()}\n\n`;
    const body = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
    fs.appendFileSync(filePath, header + body + '\n\n', 'utf8');
  } catch {
    // swallow logging errors
  }
}
