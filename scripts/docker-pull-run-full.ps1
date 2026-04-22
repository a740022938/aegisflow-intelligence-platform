param(
  [string]$ComposeFile = "docker-compose.full.yml",
  [switch]$ForceRecreate
)

$ErrorActionPreference = "Stop"

function Step([string]$msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }

Step "Checking docker"
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "docker command not found. Install Docker Desktop first."
}

Step "Checking compose file: $ComposeFile"
if (-not (Test-Path $ComposeFile)) {
  throw "Compose file not found: $ComposeFile"
}

Step "Pulling latest images"
docker compose -f $ComposeFile pull

if ($ForceRecreate) {
  Step "Recreating containers"
  docker compose -f $ComposeFile up -d --force-recreate
} else {
  Step "Starting containers"
  docker compose -f $ComposeFile up -d
}

Ok "Full stack started"
Write-Host "Web UI:    http://127.0.0.1:5173"
Write-Host "Local API: http://127.0.0.1:8787"
Write-Host "Health:    http://127.0.0.1:8787/api/health"
