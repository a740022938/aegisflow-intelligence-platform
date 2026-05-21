import { readFileSync } from 'node:fs';

const layout = readFileSync('apps/web-ui/src/components/Layout.tsx', 'utf8');

if (layout.includes('topbar-wechat') || layout.includes('APP_META.wechatId')) {
  throw new Error('Topbar must not render legacy WeChat / AGI_FACTORY contact label');
}

console.log('PASS topbar legacy contact label removed');
