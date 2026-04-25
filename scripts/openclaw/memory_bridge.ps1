<#
.SYNOPSIS
  AIP ↔ OpenClaw 记忆桥接 — 将 AIP 任务结果写入 OpenClaw 记忆库

.DESCRIPTION
  轮询 AIP 已完成的工作流任务，将结果写入 OpenClaw 的记忆系统。
  让 OpenClaw 能记住 AIP 干过什么、结果如何、下次能直接参考。

  启动: .\memory_bridge.ps1
  单次: .\memory_bridge.ps1 -Once
#>

param(
  [string]$ApiBase = 'http://127.0.0.1:8787',
  [int]$IntervalSec = 60,
  [switch]$Once
)

$ErrorActionPreference = 'Continue'
$stateFile = Join-Path $env:USERPROFILE '.openclaw\workspace\memory\bridge_state.json'
$stateDir = Split-Path $stateFile -Parent
if (-not (Test-Path $stateDir)) { New-Item -ItemType Directory -Path $stateDir -Force | Out-Null }

# Load last processed timestamp
$lastChecked = ''
if (Test-Path $stateFile) {
  try { $lastChecked = (Get-Content $stateFile -Raw | ConvertFrom-Json).last_checked_at } catch {}
}

function Write-MemoryCheckpoint($jobId, $summary) {
  $checkpointFile = Join-Path $stateDir "aip-job-$jobId.json"
  $checkpoint = @{
    job_id = $jobId
    summary = $summary
    timestamp = (Get-Date -Format 'o')
    source = 'aip-bridge'
  }
  $checkpoint | ConvertTo-Json -Depth 10 | Set-Content -Path $checkpointFile -Encoding utf8
  Write-Host "  🧠 已写入记忆: $checkpointFile"
}

function Sync-CompletedJobs {
  param([string]$Since)
  try {
    $uri = "$ApiBase/api/workflow-jobs?limit=20&status=completed"
    if ($Since) { $uri += "&updated_after=$Since" }
    $jobs = Invoke-RestMethod -Method Get -Uri $uri -TimeoutSec 10

    $jobs = @($jobs.jobs ?? $jobs.data ?? $jobs)
    if ($jobs.Count -eq 0) { return $null }

    $latest = $Since
    foreach ($job in $jobs) {
      $jobId = $job.id ?? $job.job_id
      if (-not $jobId) { continue }
      $ts = $job.updated_at ?? $job.finished_at ?? $job.completed_at
      if ($ts -and $ts -gt $latest) { $latest = $ts }

      $summary = @{
        name = $job.name ?? $job.title ?? 'unknown'
        status = 'completed'
        steps_total = $job.steps_total ?? $job.steps ?? 0
        duration_ms = $job.duration_ms ?? 0
        error = $job.error_message ?? $null
        output = $job.output_summary ?? $null
        template = $job.template_id ?? $job.template ?? $null
      }
      Write-MemoryCheckpoint $jobId $summary
    }
    return $latest
  } catch {
    Write-Host "  ⚠️ 同步失败: $_" -ForegroundColor Yellow
    return $null
  }
}

# Main loop
if ($Once) {
  Write-Host "单次同步..." -ForegroundColor Cyan
  $newTs = Sync-CompletedJobs -Since $lastChecked
  if ($newTs) {
    @{ last_checked_at = $newTs } | ConvertTo-Json | Set-Content $stateFile -Encoding utf8
    Write-Host "✅ 同步完成，下次从 $newTs 开始" -ForegroundColor Green
  } else {
    Write-Host "暂无新完成的 job" -ForegroundColor Yellow
  }
  exit 0
}

Write-Host "🧠 AIP ↔ OpenClaw 记忆桥接已启动 (间隔 ${IntervalSec}s)" -ForegroundColor Cyan
Write-Host "   状态文件: $stateFile"
if ($lastChecked) { Write-Host "   上次同步点: $lastChecked" }

while ($true) {
  try {
    $newTs = Sync-CompletedJobs -Since $lastChecked
    if ($newTs) {
      $lastChecked = $newTs
      @{ last_checked_at = $newTs } | ConvertTo-Json | Set-Content $stateFile -Encoding utf8
    }
  } catch {
    # ignore
  }
  Start-Sleep -Seconds $IntervalSec
}
