param(
  $DryRun = $true
)

# Accept bool/string/number inputs (e.g. -DryRun:$false, -DryRun 0)
$isDryRun = $true
if ($DryRun -is [bool]) {
  $isDryRun = [bool]$DryRun
} else {
  $raw = [string]$DryRun
  switch -Regex ($raw.Trim().ToLowerInvariant()) {
    '^(false|0|no)$' { $isDryRun = $false; break }
    '^(true|1|yes)$' { $isDryRun = $true; break }
    default { throw "Invalid -DryRun value: $raw" }
  }
}

$ErrorActionPreference = 'Stop'
$repo = 'E:\AGI_Factory\repo'
$workflowFile = Join-Path $repo 'apps\local-api\src\workflow\index.ts'

if (!(Test-Path $workflowFile)) {
  throw "Workflow file not found: $workflowFile"
}

$env:ENABLE_LEGACY_YOLO = 'true'
Write-Output "[YOLO-Unfreeze] ENABLE_LEGACY_YOLO=$($env:ENABLE_LEGACY_YOLO)"

# Gate presence check (read-only)
$hits = Select-String -Path $workflowFile -Pattern 'isLegacyYoloEnabled\(|legacy_yolo_frozen_block|executeYoloDetect' -SimpleMatch:$false
Write-Output "[YOLO-Unfreeze] Gate check hits=$($hits.Count)"

if ($isDryRun) {
  Write-Output '[YOLO-Unfreeze] DryRun=true, no API process started.'
  exit 0
}

Set-Location (Join-Path $repo 'apps\local-api')
Write-Output '[YOLO-Unfreeze] Starting API with legacy yolo unfreeze...'
npx tsx src/index.ts
