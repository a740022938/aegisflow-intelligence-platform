<#
.SYNOPSIS
  启动 OpenClaw ↔ AIP 双向通信桥接
.DESCRIPTION
  同时启动:
  1. 增强心跳循环 (heartbeat-v2)
  2. 持续状态监听 (watch)
  3. OpenClaw 能力缓存同步
#>

param(
  [string]$AipApi = 'http://127.0.0.1:8787',
  [int]$HeartbeatInterval = 15,
  [switch]$SkipHeartbeat,
  [switch]$SkipWatch
)

$ErrorActionPreference = 'Continue'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bridgeScript = Join-Path $scriptDir 'bidirectional_bridge.mjs'

# Load env
function Load-EnvFile {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return }
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $idx = $line.IndexOf('=')
    if ($idx -le 0) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim().Trim('"').Trim("'")
    $current = [Environment]::GetEnvironmentVariable($key)
    if ([string]::IsNullOrWhiteSpace($current)) {
      [Environment]::SetEnvironmentVariable($key, $val)
    }
  }
}

$repoRoot = Resolve-Path (Join-Path $scriptDir '..\..')
Load-EnvFile -Path (Join-Path $repoRoot '.env.local')
Load-EnvFile -Path (Join-Path $repoRoot '.env')

$env:AIP_API_BASE = $AipApi

try { $Host.UI.RawUI.WindowTitle = 'AIP ↔ OpenClaw Bridge' } catch {}

Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     AIP ↔ OpenClaw 双向通信桥接启动中...           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "AIP API: $AipApi"
Write-Host ""

# Step 1: Test connection
Write-Host "[1/3] 测试 AIP 连接..." -ForegroundColor Yellow
try {
  $health = Invoke-RestMethod -Uri "$AipApi/api/health" -TimeoutSec 5
  Write-Host "  ✅ AIP 在线: v$($health.version) | uptime: $([math]::Round($health.uptime / 60))min" -ForegroundColor Green
} catch {
  Write-Host "  ❌ AIP 不可达: $_" -ForegroundColor Red
  Write-Host "  请先启动 AIP: cd $repoRoot && pnpm run dev"
  exit 1
}

# Step 2: Fetch capabilities
Write-Host "[2/3] 获取 AIP 能力清单..." -ForegroundColor Yellow
try {
  $caps = node $bridgeScript capabilities
  if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ 能力清单已获取" -ForegroundColor Green
  }
} catch {
  Write-Host "  ⚠️ 能力获取失败: $_" -ForegroundColor Yellow
}

# Step 3: Start heartbeat + watch background jobs
Write-Host "[3/3] 启动后台桥接进程..." -ForegroundColor Yellow

$jobs = @()

if (-not $SkipHeartbeat) {
  $hbJob = Start-Job -Name "AIP-Heartbeat" -ScriptBlock {
    param($Script, $Interval)
    while ($true) {
      try {
        $result = node $Script heartbeat
        $ts = (Get-Date).ToString("HH:mm:ss")
        Write-Host "[$ts] ❤️ heartbeat ok" -ForegroundColor Green
      } catch {
        $ts = (Get-Date).ToString("HH:mm:ss")
        Write-Host "[$ts] 💔 heartbeat failed: $_" -ForegroundColor Red
      }
      Start-Sleep -Seconds $Interval
    }
  } -ArgumentList $bridgeScript, $HeartbeatInterval
  $jobs += $hbJob
  Write-Host "  ✅ 心跳循环已启动 (间隔 ${HeartbeatInterval}s)" -ForegroundColor Green
}

if (-not $SkipWatch) {
  $watchJob = Start-Job -Name "AIP-Watcher" -ScriptBlock {
    param($Script, $Interval)
    Start-Sleep -Seconds 5
    node $Script watch $Interval
  } -ArgumentList $bridgeScript, 30
  $jobs += $watchJob
  Write-Host "  ✅ 状态监听已启动 (间隔 30s)" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   AIP ↔ OpenClaw 双向桥接运行中                     ║" -ForegroundColor Cyan
Write-Host "║                                                    ║" -ForegroundColor Cyan
Write-Host "║   使用示例:                                        ║" -ForegroundColor Cyan
Write-Host "║     node scripts/openclaw/bidirectional_bridge.mjs capabilities  ║" -ForegroundColor Cyan
Write-Host "║     node scripts/openclaw/bidirectional_bridge.mjs intent \"训练模型\" ║" -ForegroundColor Cyan
Write-Host "║     node scripts/openclaw/bidirectional_bridge.mjs workflow full-flywheel ║" -ForegroundColor Cyan
Write-Host "║     node scripts/openclaw/bidirectional_bridge.mjs command pause job_xxx  ║" -ForegroundColor Cyan
Write-Host "║                                                    ║" -ForegroundColor Cyan
Write-Host "║   按 Ctrl+C 停止桥接                               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Wait for jobs and handle Ctrl+C
try {
  while ($true) {
    $jobs | ForEach-Object {
      if ($_.State -eq 'Failed') {
        Receive-Job $_ | Out-String | Write-Host
      }
    }
    Start-Sleep -Seconds 5
  }
} finally {
  Write-Host "`n正在停止桥接进程..." -ForegroundColor Yellow
  $jobs | Stop-Job -PassThru | Remove-Job
  Write-Host "桥接已停止" -ForegroundColor Green
}
