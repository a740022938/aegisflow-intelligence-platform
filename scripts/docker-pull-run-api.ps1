param(
  [string]$Image = "ghcr.io/a740022938/agi-model-factory-api:v6.7.0",
  [string]$ContainerName = "agi-local-api",
  [switch]$ForceRecreate
)

$ErrorActionPreference = "Stop"

function Step([string]$msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Ok([string]$msg) { Write-Host "OK  $msg" -ForegroundColor Green }
function Warn([string]$msg) { Write-Host "WARN $msg" -ForegroundColor Yellow }

Step "Checking docker"
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "docker command not found. Install Docker Desktop first."
}

Step "Pull image: $Image"
docker pull $Image

$exists = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $ContainerName }
if ($exists) {
  if ($ForceRecreate) {
    Step "Removing existing container: $ContainerName"
    docker rm -f $ContainerName | Out-Null
  } else {
    Warn "Container '$ContainerName' already exists. Use -ForceRecreate to replace."
    exit 0
  }
}

Step "Running container"
docker run -d `
  --name $ContainerName `
  --restart unless-stopped `
  -p 8787:8787 `
  -v "${PWD}\packages\db:/app/packages/db" `
  -v "${PWD}\outputs:/app/outputs" `
  $Image | Out-Null

Ok "Container started: $ContainerName"
Write-Host "Health check: http://127.0.0.1:8787/api/health"
