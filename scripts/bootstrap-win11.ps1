param(
  [switch]$DryRun,
  [switch]$SkipInstall,
  [switch]$SkipSmoke
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Step([string]$msg) {
  Write-Host "==> $msg" -ForegroundColor Cyan
}

function Write-Ok([string]$msg) {
  Write-Host "OK  $msg" -ForegroundColor Green
}

function Write-Warn([string]$msg) {
  Write-Host "WARN $msg" -ForegroundColor Yellow
}

function Require-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing command: $name"
  }
}

function Invoke-OrDryRun([string]$cmd, [string]$workdir) {
  if ($DryRun) {
    Write-Host "[DryRun] ($workdir) $cmd" -ForegroundColor DarkGray
    return
  }
  Push-Location $workdir
  try {
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed: $cmd"
    }
  } finally {
    Pop-Location
  }
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir

Write-Step "Bootstrapping AGI Model Factory on Win11"
Write-Host "Repo: $RepoRoot"

Write-Step "Checking required tools"
Require-Command git
Require-Command node

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Warn "pnpm not found, trying corepack..."
  Require-Command corepack
  if (-not $DryRun) {
    corepack enable | Out-Null
    corepack prepare pnpm@9.15.0 --activate | Out-Null
  }
}
Require-Command pnpm
Write-Ok "git/node/pnpm available"

Write-Step "Checking Node major version"
$nodeVersion = node -p "process.versions.node"
$major = [int]($nodeVersion.Split('.')[0])
if ($major -lt 22) {
  throw "Node.js v22+ required, current: $nodeVersion"
}
Write-Ok "Node version: $nodeVersion"

if (-not $SkipInstall) {
  Write-Step "Installing dependencies"
  Invoke-OrDryRun "pnpm install" $RepoRoot
  Write-Ok "Dependencies installed"
} else {
  Write-Warn "SkipInstall enabled, skipping pnpm install"
}

Write-Step "Preparing environment file"
$envExample = Join-Path $RepoRoot ".env.example"
$envLocal = Join-Path $RepoRoot ".env.local"
if ((Test-Path $envExample) -and (-not (Test-Path $envLocal))) {
  if ($DryRun) {
    Write-Host "[DryRun] Copy $envExample -> $envLocal" -ForegroundColor DarkGray
  } else {
    Copy-Item -LiteralPath $envExample -Destination $envLocal -Force
  }
  Write-Ok ".env.local created"
} elseif (Test-Path $envLocal) {
  Write-Ok ".env.local already exists"
} else {
  Write-Warn ".env.example not found, skipping .env.local setup"
}

Write-Step "Initializing database"
Invoke-OrDryRun "pnpm run db:init" $RepoRoot
Write-Ok "Database initialized"

if (-not $SkipSmoke) {
  Write-Step "Running local-api smoke check"
  if ($DryRun) {
    Write-Host "[DryRun] Start local-api and call /api/health" -ForegroundColor DarkGray
  } else {
    $apiDir = Join-Path $RepoRoot "apps\local-api"
    $proc = Start-Process -FilePath cmd.exe `
      -ArgumentList "/c","npm run dev" `
      -WorkingDirectory $apiDir `
      -WindowStyle Hidden `
      -PassThru
    try {
      $ok = $false
      for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
          $resp = Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8787/api/health" -TimeoutSec 3
          if ($resp.ok -eq $true) { $ok = $true; break }
        } catch {}
      }
      if (-not $ok) {
        throw "local-api smoke check failed: /api/health not ready in 30s"
      }
      Write-Ok "local-api smoke check passed"
    } finally {
      if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
      }
    }
  }
} else {
  Write-Warn "SkipSmoke enabled, smoke check skipped"
}

Write-Step "Done"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1) Start full dev stack: pnpm run dev"
Write-Host "  2) Open Web UI: http://127.0.0.1:5173"
Write-Host "  3) Verify API:   http://127.0.0.1:8787/api/health"
Write-Host ""
Write-Host "Optional dry run:" -ForegroundColor DarkCyan
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/bootstrap-win11.ps1 -DryRun"
