#!/usr/bin/env node
/**
 * AGI Model Factory - Setup Script
 * Run: node scripts/setup.js
 * 
 * This script:
 * 1. Checks Node.js version (requires >= 22)
 * 2. Installs dependencies via pnpm (or npm)
 * 3. Creates .env.local from .env.example if not exists
 * 4. Initializes SQLite database with all tables
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_NODE_MAJOR = 22;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function checkNodeVersion() {
  const version = process.versions.node;
  const major = parseInt(version.split('.')[0], 10);
  
  log(`\n📦 Node.js 版本: v${version}`, 'cyan');
  
  if (major < REQUIRED_NODE_MAJOR) {
    log(`❌ 需要 Node.js v${REQUIRED_NODE_MAJOR}.x 或更高版本`, 'red');
    log(`   当前版本: v${version}`, 'yellow');
    log(`\n   安装方法:`, 'yellow');
    log(`   - fnm:  fnm install ${REQUIRED_NODE_MAJOR} && fnm use ${REQUIRED_NODE_MAJOR}`, 'cyan');
    log(`   - nvm:  nvm install ${REQUIRED_NODE_MAJOR} && nvm use ${REQUIRED_NODE_MAJOR}`, 'cyan');
    log(`   - 直接下载: https://nodejs.org/`, 'cyan');
    process.exit(1);
  }
  
  log(`✅ Node.js 版本满足要求 (>= v${REQUIRED_NODE_MAJOR})`, 'green');
  return true;
}

function findPackageManager() {
  // Check for pnpm
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {}
  
  // Fall back to npm
  log('⚠️  pnpm 未安装，使用 npm（推荐安装 pnpm 以获得更快速度）', 'yellow');
  return 'npm';
}

function installDeps() {
  const pm = findPackageManager();
  log(`\n📦 使用 ${pm} 安装依赖...`, 'cyan');
  
  try {
    execSync(`${pm} install`, { 
      cwd: ROOT, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    log(`✅ 依赖安装完成`, 'green');
    return true;
  } catch (err) {
    log(`❌ 依赖安装失败: ${err.message}`, 'red');
    return false;
  }
}

function setupEnvFile() {
  const envExample = path.join(ROOT, '.env.example');
  const envLocal = path.join(ROOT, '.env.local');
  
  log(`\n🔧 检查环境配置...`, 'cyan');
  
  if (fs.existsSync(envLocal)) {
    log(`✅ .env.local 已存在`, 'green');
    return true;
  }
  
  if (!fs.existsSync(envExample)) {
    log(`⚠️  .env.example 不存在，跳过`, 'yellow');
    return true;
  }
  
  try {
    fs.copyFileSync(envExample, envLocal);
    log(`✅ 已创建 .env.local（请按需修改）`, 'green');
    return true;
  } catch (err) {
    log(`❌ 创建 .env.local 失败: ${err.message}`, 'red');
    return false;
  }
}

function initDatabase() {
  log(`\n🗄️  初始化数据库...`, 'cyan');
  
  const dbPath = path.join(ROOT, 'packages', 'db', 'agi_factory.db');
  const dbDir = path.dirname(dbPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Check if DB already exists
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    log(`✅ 数据库已存在 (${(stats.size / 1024).toFixed(1)} KB)`, 'green');
    return true;
  }
  
  // Create empty DB file - tables will be created on first API start
  try {
    fs.writeFileSync(dbPath, '');
    log(`✅ 已创建空数据库文件`, 'green');
    log(`   表结构将在首次启动 API 时自动创建`, 'cyan');
    return true;
  } catch (err) {
    log(`❌ 创建数据库失败: ${err.message}`, 'red');
    return false;
  }
}

function printNextSteps() {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`🎉 设置完成！`, 'green');
  log(`${'='.repeat(50)}`, 'cyan');
  log(`\n接下来：`, 'cyan');
  log(`  1. 启动开发服务器：`, 'reset');
  log(`     pnpm run dev`, 'yellow');
  log(`\n  2. 或分别启动前后端：`, 'reset');
  log(`     pnpm run dev:api   # 后端 API`, 'yellow');
  log(`     pnpm run dev:web   # 前端 UI`, 'yellow');
  log(`\n  3. 访问：`, 'reset');
  log(`     http://localhost:5173  # Web UI`, 'yellow');
  log(`     http://localhost:8787/api/health  # API 健康检查`, 'yellow');
  log(`\n`);
}

// Main
async function main() {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`  AGI Model Factory - Setup`, 'cyan');
  log(`${'='.repeat(50)}`, 'cyan');
  
  const steps = [
    ['检查 Node.js 版本', checkNodeVersion],
    ['安装依赖', installDeps],
    ['配置环境变量', setupEnvFile],
    ['初始化数据库', initDatabase],
  ];
  
  for (const [name, fn] of steps) {
    const ok = fn();
    if (!ok && name !== '配置环境变量') {
      log(`\n❌ 设置失败于: ${name}`, 'red');
      process.exit(1);
    }
  }
  
  printNextSteps();
}

main().catch(err => {
  log(`\n❌ 未预期的错误: ${err.message}`, 'red');
  process.exit(1);
});
