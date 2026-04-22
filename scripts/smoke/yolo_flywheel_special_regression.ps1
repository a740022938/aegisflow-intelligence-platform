$ErrorActionPreference = 'Stop'

$BaseUrl = "http://localhost:8787"
$Pass = 0
$Fail = 0
$Rows = @()

function Add-Result($name, $ok, $detail) {
  if ($ok) { $script:Pass++ } else { $script:Fail++ }
  $script:Rows += [pscustomobject]@{
    Name   = $name
    Status = $(if ($ok) { "PASS" } else { "FAIL" })
    Detail = $detail
  }
}

function Test-Get($name, $path) {
  try {
    $r = Invoke-RestMethod -Uri "$BaseUrl$path" -Method Get -TimeoutSec 20
    Add-Result $name $true "ok"
    return $r
  } catch {
    Add-Result $name $false $_.Exception.Message
    return $null
  }
}

function Test-PostJson($name, $path, $body, [scriptblock]$assertion) {
  try {
    $json = $body | ConvertTo-Json -Depth 30
    $r = Invoke-RestMethod -Uri "$BaseUrl$path" -Method Post -ContentType "application/json" -Body $json -TimeoutSec 30
    $ok = & $assertion $r
    Add-Result $name $ok ($(if ($ok) { "assertion ok" } else { "assertion failed" }))
    return $r
  } catch {
    Add-Result $name $false $_.Exception.Message
    return $null
  }
}

$null = Test-Get "health" "/api/health"
$templates = Test-Get "workflow templates" "/api/workflow-templates"

if ($templates -and $templates.templates) {
  $codes = @($templates.templates | ForEach-Object { $_.code })
  Add-Result "template yolo_minimal_closedloop" ($codes -contains "yolo_minimal_closedloop") "builtin exists"
  Add-Result "template yolo_video_to_train" ($codes -contains "yolo_video_to_train") "builtin exists"
  Add-Result "template yolo_eval_feedback_loop" ($codes -contains "yolo_eval_feedback_loop") "builtin exists"
  Add-Result "template yolo_enhanced_flywheel" ($codes -contains "yolo_enhanced_flywheel") "builtin exists"
} else {
  Add-Result "template list parse" $false "templates payload missing"
}

$null = Test-PostJson "dry-run envelope shape" "/api/workflow-templates/dry-run" @{
  execution_mode = "dry-run"
  steps = @(
    @{
      step_key = "archive_model"
      step_name = "Archive Model"
      step_order = 1
      input = @{ model_id = "non-existent-model-id" }
    }
  )
} {
  param($r)
  return $r.PSObject.Properties.Name -contains "step_envelopes" -and
    $r.PSObject.Properties.Name -contains "envelope_summary" -and
    $r.stepResults.Count -ge 1 -and
    ($r.stepResults[0].PSObject.Properties.Name -contains "envelope")
}

$null = Test-PostJson "dry-run missing param failure" "/api/workflow-templates/dry-run" @{
  execution_mode = "dry-run"
  steps = @(
    @{
      step_key = "train_model"
      step_name = "Train Model"
      step_order = 1
      input = @{}
    }
  )
} {
  param($r)
  return $r.ok -eq $false -and $r.errors.Count -ge 1
}

$null = Test-PostJson "dry-run unknown step warning" "/api/workflow-templates/dry-run" @{
  execution_mode = "dry-run"
  steps = @(
    @{
      step_key = "unknown_step_foo"
      step_name = "Unknown Step"
      step_order = 1
      input = @{}
    }
  )
} {
  param($r)
  return $r.warnings.Count -ge 1
}

$null = Test-PostJson "dry-run release_validate missing model" "/api/workflow-templates/dry-run" @{
  execution_mode = "dry-run"
  steps = @(
    @{
      step_key = "release_validate"
      step_name = "Release Validate"
      step_order = 1
      input = @{}
    }
  )
} {
  param($r)
  return $r.ok -eq $false -and $r.errors.Count -ge 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "  YOLO Flywheel Special Regression"
Write-Host "  $Pass PASS / $Fail FAIL ($($Rows.Count) items)"
Write-Host "========================================"
foreach ($row in $Rows) {
  Write-Host ("  {0,-42} [{1}] {2}" -f $row.Name, $row.Status, $row.Detail)
}

if ($Fail -gt 0) { exit 1 }
exit 0
