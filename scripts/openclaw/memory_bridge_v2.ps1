<#
.SYNOPSIS
  AIP ↔ OpenClaw 记忆桥接 v2 — 双向主动同步
  1. AIP 任务完成 → OpenClaw 记忆写入
  2. OpenClaw 记忆查询 → 返回 AIP job 历史
  3. 主动心跳状态同步
#>

param(
  [string]$ApiBase = 'http://127.0.0.1:8787',
  [int]$IntervalSec = 30,
  [switch]$Once
)

$ErrorActionPreference = 'Continue'
$memDir = Join-Path $env:USERPROFILE '.openclaw\workspace\memory'
$stateFile = Join-Path $memDir 'bridge_v2_state.json'
if (-not (Test-Path $memDir)) { New-Item -ItemType Directory -Path $memDir -Force | Out-Null }

$lastChecked = ''
if (Test-Path $stateFile) {
  try { $lastChecked = (Get-Content $stateFile -Raw | ConvertFrom-Json).last_checked_at } catch {}
}

function Get-Json($path) {
  try { $resp = Invoke-RestMethod -Uri "$ApiBase$path" -TimeoutSec 5; return $resp } catch { return $null }
}

# Core sync loop
function Sync-Bridge {
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Syncing..."

  # 1. Fetch AIP core status
  $core = Get-Json '/api/core/status'
  if ($core?.ok) {
    $cs = $core.core
    $summary = "uptime=$( [math]::Round($cs.uptime/60) )min | allOk=$($cs.allOk) | hbSent=$($cs.heartbeat.sent)"
    if ($cs.warnings.Count -gt 0) {
      $summary += " | warnings=$($cs.warnings -join ',')"
    }
    Write-Host "  AIP: $summary"
  } else {
    Write-Host "  AIP unreachable"
  }

  # 2. Fetch completed jobs since last check
  $since = if ($lastChecked) { "&updated_after=$lastChecked" } else { '' }
  $jobs = Get-Json "/api/workflow-jobs?limit=10&status=completed$since"
  $newJobs = 0
  if ($jobs?.ok) {
    $jobList = @($jobs.jobs ?? $jobs.data ?? @())
    $latest = $lastChecked
    foreach ($job in $jobList) {
      $jid = $job.id ?? $job.job_id
      $ts = $job.updated_at ?? $job.finished_at
      if ($ts -and $ts -gt $latest) { $latest = $ts }
      # Write memory checkpoint
      $checkpoint = @{
        job_id = $jid
        name = $job.name ?? 'unknown'
        status = 'completed'
        template = $job.template_id ?? ''
        finished_at = $ts
        recorded_at = (Get-Date -Format 'o')
      }
      $cpFile = Join-Path $memDir "aip-job-$jid.json"
      $checkpoint | ConvertTo-Json -Depth 6 | Set-Content -Path $cpFile -Encoding utf8
      $newJobs++
    }
    if ($latest -and $latest -ne $lastChecked) { $lastChecked = $latest }
  }
  Write-Host "  Memory: $newJobs new checkpoints"

  # 3. Save state
  if ($lastChecked) {
    @{ last_checked_at = $lastChecked; last_sync = (Get-Date -Format 'o') } | ConvertTo-Json | Set-Content $stateFile -Encoding utf8
  }
}

if ($Once) {
  Sync-Bridge
  Write-Host "Done."
  exit 0
}

Write-Host "Memory Bridge v2 started (interval=${IntervalSec}s)"
while ($true) {
  try { Sync-Bridge } catch {}
  Start-Sleep -Seconds $IntervalSec
}
