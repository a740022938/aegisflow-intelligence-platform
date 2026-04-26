# AGI Model Factory - Full System Smoke Test
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\smoke\full_system_smoke.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\smoke\full_system_smoke.ps1 -BaseUrl http://10.0.0.5:8787
#   powershell -ExecutionPolicy Bypass -File scripts\smoke\full_system_smoke.ps1 -Token "YOUR_TOKEN"

param(
    [string]$BaseUrl = "http://localhost:8787",
    [string]$ReportPath = "",
    [string]$Token = ""
)

$ErrorActionPreference = "Continue"
$StartTime = Get-Date

# Discover token (env -> .env.local -> DB)
if (-not $Token) {
    $Token = [string]$env:OPENCLAW_HEARTBEAT_TOKEN
    if (-not $Token) { $Token = "" }
}
if (-not $Token) {
    try {
        $repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\\..")
        $envLocalPath = Join-Path $repoRoot ".env.local"
        if (Test-Path $envLocalPath) {
            $line = Get-Content -LiteralPath $envLocalPath | Where-Object { $_ -match '^OPENCLAW_HEARTBEAT_TOKEN=' } | Select-Object -First 1
            if ($line) { $Token = ($line -replace '^OPENCLAW_HEARTBEAT_TOKEN=', '').Trim() }
        }
    } catch {}
}
if (-not $Token) {
    try {
        $dbPath = "E:\AIP\repo\packages\db\agi_factory.db"
        if (Test-Path $dbPath) {
            $tmp = Join-Path $env:TEMP "smoke_read_openclaw_token.py"
            @"
import sqlite3
db = r'E:\AIP\repo\packages\db\agi_factory.db'
try:
    conn = sqlite3.connect(db)
    cur = conn.cursor()
    cur.execute("SELECT value FROM openclaw_config WHERE key='heartbeat_token'")
    row = cur.fetchone()
    if row and row[0]:
        print(row[0], end='')
except Exception:
    pass
"@ | Set-Content -LiteralPath $tmp -Encoding UTF8
            $Token = python $tmp 2>$null
            if (-not $Token) { $Token = "" }
        }
    } catch { $Token = "" }
}

function Invoke-SmokeApi {
    param([string]$Method, [string]$Path, [object]$Body, [hashtable]$Headers)
    $url = "$BaseUrl$Path"
    $params = @{ Method = $Method; Uri = $url; ContentType = "application/json"; TimeoutSec = 30 }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5 -Compress) }
    if ($Headers) { $params["Headers"] = $Headers }
    try {
        $resp = Invoke-RestMethod @params
        return @{ Code = 200; Data = $resp; Err = "" }
    } catch {
        $code = 0
        try { $code = [int]$_.Exception.Response.StatusCode } catch {}
        $msg = $_.Exception.Message
        if ($msg.Length -gt 120) { $msg = $msg.Substring(0, 120) + "..." }
        return @{ Code = $code; Data = $null; Err = $msg }
    }
}

$Results = @()

# 1. Core API endpoints
foreach ($ep in @(
    @{ N="GET /api/health"; P="/api/health" },
    @{ N="GET /api/plugins"; P="/api/plugins" },
    @{ N="GET /api/plugins/health"; P="/api/plugins/health" },
    @{ N="GET /api/plugins/registry"; P="/api/plugins/registry" },
    @{ N="GET /api/plugins/pool"; P="/api/plugins/pool" },
    @{ N="GET /api/plugins/catalog"; P="/api/plugins/catalog" },
    @{ N="GET /api/openclaw/master-switch"; P="/api/openclaw/master-switch" },
    @{ N="GET /api/templates"; P="/api/templates" },
    @{ N="GET /api/datasets"; P="/api/datasets" },
    @{ N="GET /api/models"; P="/api/models" }
)) {
    $r = Invoke-SmokeApi -Method "GET" -Path $ep.P
    $ok = ($r.Code -eq 200)
    $d = ""
    if ($r.Data -is [psobject]) {
        if ($null -ne $r.Data.ok) { $d += "ok=$($r.Data.ok) " }
        if ($r.Data.items -is [array]) { $d += "items=$($r.Data.items.Count) " }
        if ($r.Data.health) { $d += "health=$($r.Data.health) " }
        if ($null -ne $r.Data.token_configured) { $d += "token=$($r.Data.token_configured) " }
    }
    if (-not $ok) { $d = $r.Err }
    $Results += @{ N=$ep.N; C=$r.Code; S=$(if($ok){"PASS"}else{"FAIL"}); D=$d.Trim() }
}

# 2. Workflow dry-run
$dr = Invoke-SmokeApi -Method "POST" -Path "/api/workflow-templates/dry-run" -Body @{
    payload = @{ name="smoke"; description="auto"; template_id=$null
        steps=@(@{ step_key="yolo_detect"; step_name="Y"; step_order=1; params=@{ experiment_id="smoke"; dataset_id="smoke" } })
        input=@{} }; execution_mode="dry-run"
}
$drD = ""
if ($dr.Data -is [psobject]) {
    $drD = "ok=$($dr.Data.ok)"
    if ($dr.Data.summary) { $drD += " ok_steps=$($dr.Data.summary.ok_steps)" }
}
$Results += @{ N="POST /workflow-templates/dry-run"; C=$dr.Code; S=$(if(($dr.Code -eq 200)){"PASS"}else{"FAIL"}); D=$drD }

$wj = Invoke-SmokeApi -Method "GET" -Path "/api/workflow-jobs?limit=3"
$Results += @{ N="GET /workflow-jobs"; C=$wj.Code; S=$(if(($wj.Code -eq 200)){"PASS"}else{"FAIL"}); D="" }

# 3. OpenClaw heartbeat (3 rounds) - only if token discovered
$hbH = @{}
$hbState = "SKIP"
$hbCode = 0
$hbDetail = "SKIP (token not configured)"
$master = Invoke-SmokeApi -Method "GET" -Path "/api/openclaw/master-switch"
$tokenConfigured = $false
if ($master.Code -eq 200 -and $master.Data -is [psobject] -and $null -ne $master.Data.token_configured) {
    $tokenConfigured = [bool]$master.Data.token_configured
}
if ($Token) {
    $hbH["x-openclaw-token"] = $Token
    $hbOk = 0
    $hbLastCode = 0
    for ($i=0; $i -lt 3; $i++) {
        $hb = Invoke-SmokeApi -Method "POST" -Path "/api/openclaw/heartbeat" -Body @{ actor="smoke"; runtime_online=$true } -Headers $hbH
        $hbLastCode = $hb.Code
        # Check: HTTP 200 + ok field is truthy (True/true/1/"yes" etc.)
        $okVal = $hb.Data.ok
        $isOk = $false
        if ($hb.Code -eq 200 -and $null -ne $okVal) {
            if ($okVal -is [bool]) { $isOk = $okVal -eq $true }
            elseif ($okVal -is [string]) { $isOk = ($okVal -match "^true$|^1$|^yes$") }
            elseif ($okVal -is [int] -or $okVal -is [long]) { $isOk = $okVal -ne 0 }
            else { $isOk = [bool]($okVal) }
        }
        if ($isOk) { $hbOk++ }
    }
    $hbCode = $hbLastCode
    if ($hbOk -eq 3) {
        $hbState = "PASS"
        $hbDetail = "$hbOk/3"
    } else {
        $hbState = "FAIL"
        $hbDetail = "$hbOk/3"
    }
} else {
    if ($tokenConfigured) {
        $hbState = "FAIL"
        $hbCode = 0
        $hbDetail = "token configured but not loaded from DB/env"
    }
}
$Results += @{ N="POST /openclaw/heartbeat x3"; C=$hbCode; S=$hbState; D=$hbDetail }

# 4. Brain route
$br = Invoke-SmokeApi -Method "POST" -Path "/api/ai/brain/route" -Body @{ prompt="1+1="; task_type="calc"; risk_level="low" }
$brD = ""
if ($br.Data -is [psobject]) { $brD = "brain=$($br.Data.brain_used) latency=$($br.Data.latency_ms)ms" }
$brOk = $false
if ($br.Code -eq 200 -and $null -ne $br.Data.ok) {
    $v = $br.Data.ok
    if ($v -is [bool]) { $brOk = $v }
    elseif ($v -is [string]) { $brOk = ($v -match "^true$|^1$|^yes$") }
    else { $brOk = [bool]$v }
}
$Results += @{ N="POST /ai/brain/route"; C=$br.Code; S=$(if($brOk){"PASS"}else{"FAIL"}); D=$brD }

# ===== Output =====
$PC = @($Results | Where-Object { $_.S -eq 'PASS' }).Count
$FC = @($Results | Where-Object { $_.S -eq 'FAIL' }).Count
$SC = @($Results | Where-Object { $_.S -eq 'SKIP' }).Count
$Dur = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 1)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AGI Model Factory Smoke Test" -ForegroundColor Cyan
Write-Host "  $PC PASS / $FC FAIL / $SC SKIP ($($Results.Count) items)" -ForegroundColor $(if ($FC -eq 0){"Green"}else{"Yellow"})
Write-Host "  ${Dur}s | $BaseUrl | Token: $(if($Token){'DB'}else{'none'})" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
foreach ($r in $Results) {
    $tag = $r.S
    $color = if ($tag -eq "PASS") { "Green" } elseif ($tag -eq "SKIP") { "Yellow" } else { "Red" }
    Write-Host ("  {0,-50} [{1}] {2}" -f $r.N, $r.C, $tag) -ForegroundColor $color
}
Write-Host ""

# Markdown report
$ML = @("# AGI Model Factory - Smoke Test Report", "",
    "| Field | Value |", "|-------|-------|",
    "| Time | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') |",
    "| Duration | ${Dur}s |",
    "| BaseUrl | $BaseUrl |",
    "| Token | $(if ($Token) {'from live DB/env'} else {'not found in DB/env'}) |",
    "| **Result** | **$PC PASS / $FC FAIL / $SC SKIP** |", "",
    "| # | Check | HTTP | Result | Detail |",
    "|---|-------|------|--------|--------|")
$idx=1; foreach ($r in $Results) { $ML += "| $idx | ``$($r.N)`` | $($r.C) | **$($r.S)** | $($r.D) |"; $idx++ }
$ML += ""
if ($FC -gt 0) {
    $ML += "## FAIL Items"
    foreach ($r in ($Results | Where-Object { $_.S -eq 'FAIL' })) { $ML += "- ``$($r.N)``: HTTP $($r.C) — $($r.D)" }
    $ML += ""
}
if ($SC -gt 0) {
    $ML += "## SKIP Items"
    foreach ($r in ($Results | Where-Object { $_.S -eq 'SKIP' })) { $ML += "- ``$($r.N)``: $($r.D)" }
    $ML += ""
}
$ML += "## Conclusion"
if ($FC -eq 0) { $ML += "> **GO**" } elseif ($FC -le 2) { $ML += "> **GO (conditional)**" } else { $ML += "> **NO-GO**" }

if (-not $ReportPath) {
    $ts = (Get-Date).ToString("yyyyMMdd_HHmmss")
    $ReportPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "smoke_report_$ts.md"
}
[System.IO.File]::WriteAllText($ReportPath, ($ML -join "`r`n"), [System.Text.UTF8Encoding]::new($false))
Write-Host "Report: $ReportPath" -ForegroundColor Yellow
exit $(if ($FC -eq 0) { 0 } else { 1 })
