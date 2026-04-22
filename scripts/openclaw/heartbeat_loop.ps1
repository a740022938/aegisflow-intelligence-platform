param(
  [string]$ApiBase = 'http://127.0.0.1:8787',
  [int]$IntervalSec = 10
)

$ErrorActionPreference = 'Continue'

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

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..\..')
Load-EnvFile -Path (Join-Path $repoRoot '.env.local')
Load-EnvFile -Path (Join-Path $repoRoot '.env')

$token = $env:OPENCLAW_HEARTBEAT_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Host "[OpenClaw] OPENCLAW_HEARTBEAT_TOKEN not configured. Heartbeat loop exits."
  exit 1
}

try { $Host.UI.RawUI.WindowTitle = 'AGI Factory OpenClaw Heartbeat' } catch {}
Write-Host "[OpenClaw] Heartbeat loop started. api=$ApiBase interval=${IntervalSec}s"

while ($true) {
  try {
    $body = @{
      actor = 'openclaw_agent'
      runtime_online = $true
      status = 'online'
      execution_status = 'idle'
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/openclaw/heartbeat" -Headers @{ 'x-openclaw-token' = $token } -ContentType 'application/json' -Body $body -TimeoutSec 4
    $hb = $res.heartbeat_at
    Write-Host "[OpenClaw] heartbeat ok at $hb"
  } catch {
    Write-Host "[OpenClaw] heartbeat failed: $($_.Exception.Message)"
  }
  Start-Sleep -Seconds $IntervalSec
}
