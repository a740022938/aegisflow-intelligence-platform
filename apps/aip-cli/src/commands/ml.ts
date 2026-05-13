import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fallback manual content in case docs/ml_manual.txt is unavailable
const FALLBACK_MANUAL = `AIP 本机命令大全（简版）
稳定基线：Node v22.19.0 / npm 10.9.3 / OpenClaw 2026.3.23 / AIP 7.3.0-rc1

AIP 常用命令:
- aip version
- aip status
- aip health
- aip open
- aip start
- aip stop
- aip restart
- aip logs
- aip ml (本机命令大全入口)

OpenClaw 常用命令:
- openclaw --version
- openclaw gateway status
- openclaw gateway restart

Node/npm/nvm 检查:
- node -v
- npm -v
- nvm current

端口检查:
- Get-NetTCPConnection -LocalPort 8787,5173 -State Listen
- Get-NetTCPConnection -LocalPort 18789 -State Listen

JWT 联调与测试:
- (示例) 使用 /api/auth/login 获取 token
- 其它联调命令按需求执行

故障恢复:
- aip restart
- aip gateway restart
- aip open

不建议使用:
- pnpm 命令缺省使用

最重要记住:
- 日常启动只用：aip start
- 日常检查：aip status / aip health
- 日常恢复：aip restart
`;

// Prints the local machine command大全 (manual)
export async function runMl() {
  // Load the machine-local command manual packaged with the CLI
  // __dirname is not available in ESM mode, so derive it from import.meta.url
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const manualPath = path.resolve(__dirname, '../../docs/ml_manual.txt');
  try {
    const content = await readFile(manualPath, 'utf8');
    console.log(content);
  } catch (err) {
    console.warn('aip ml: could not load local manual, using fallback');
    console.log(FALLBACK_MANUAL);
  }
}
