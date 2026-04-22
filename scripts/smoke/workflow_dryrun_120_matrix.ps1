$ErrorActionPreference = 'Stop'

$BaseUrl = "http://localhost:8787"
$Pass = 0
$Fail = 0
$Rows = @()

function Add-Result($name, $ok, $detail) {
  if ($ok) { $script:Pass++ } else { $script:Fail++ }
  $script:Rows += [pscustomobject]@{ Name = $name; Status = $(if ($ok) { "PASS" } else { "FAIL" }); Detail = $detail }
}

function Invoke-DryRun($steps) {
  $body = @{ execution_mode = "dry-run"; steps = $steps } | ConvertTo-Json -Depth 30
  return Invoke-RestMethod -Uri "$BaseUrl/api/workflow-templates/dry-run" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 30
}

function Has-EnvelopeShape($r) {
  if (-not $r) { return $false }
  if (-not ($r.PSObject.Properties.Name -contains "stepResults")) { return $false }
  if (-not ($r.PSObject.Properties.Name -contains "step_envelopes")) { return $false }
  if (-not ($r.PSObject.Properties.Name -contains "envelope_summary")) { return $false }
  if ($r.stepResults.Count -lt 1) { return $false }
  return ($r.stepResults[0].PSObject.Properties.Name -contains "envelope")
}

function Run-Case($name, $steps, $mode) {
  try {
    $r = Invoke-DryRun $steps
    $ok = $false
    switch ($mode) {
      "shape"     { $ok = Has-EnvelopeShape $r; break }
      "error"     { $ok = (($r.ok -eq $false) -and ($r.errors.Count -ge 1) -and (Has-EnvelopeShape $r)); break }
      "warning"   { $ok = (($r.warnings.Count -ge 1) -and (Has-EnvelopeShape $r)); break }
      "2steps"    { $ok = (($r.stepResults.Count -eq 2) -and (Has-EnvelopeShape $r)); break }
      default     { $ok = Has-EnvelopeShape $r; break }
    }
    Add-Result $name $ok ($(if ($ok) { "assertion ok" } else { "assertion failed" }))
  } catch {
    Add-Result $name $false $_.Exception.Message
  }
}

$stepKeys = @(
  "train_model","evaluate_model","archive_model","dataset_snapshot","dataset_stats","compare_baseline",
  "badcase_mine","export_model","release_validate","hardcase_feedback","retrain_trigger","yolo_detect"
)

$dummy = @{
  train_model      = @{ experiment_id = "exp_x"; dataset_id = "ds_x"; template_version = "1.0.0" }
  evaluate_model   = @{ experiment_id = "exp_x"; model_id = "model_x"; dataset_id = "ds_x" }
  archive_model    = @{ model_id = "model_x"; artifact_name = "art_x" }
  dataset_snapshot = @{ dataset_id = "ds_x"; snapshot_version = "vtest" }
  dataset_stats    = @{ dataset_id = "ds_x" }
  compare_baseline = @{ model_id = "model_x"; baseline_model_id = "model_y" }
  badcase_mine     = @{ evaluation_id = "eval_x" }
  export_model     = @{ model_id = "model_x"; export_format = "onnx" }
  release_validate = @{ model_id = "model_x" }
  hardcase_feedback= @{ dataset_id = "ds_x" }
  retrain_trigger  = @{ experiment_id = "exp_x"; dataset_id = "ds_x" }
  yolo_detect      = @{ experiment_id = "exp_x"; dataset_id = "ds_x" }
}

# Group A: 24 shape checks
foreach ($k in $stepKeys) {
  Run-Case "A1-shape-$k" @(@{ step_key = $k; step_name = $k; step_order = 1; input = @{} }) "shape"
  Run-Case "A2-shape-$k" @(@{ step_key = $k; step_name = "$k-dummy"; step_order = 1; input = $dummy[$k] }) "shape"
}

# Group B: 24 missing-param error checks
foreach ($k in $stepKeys) {
  Run-Case "B1-missing-$k" @(@{ step_key = $k; step_name = $k; step_order = 1; input = @{} }) "error"
  Run-Case "B2-missing-$k" @(@{ step_key = $k; step_name = "$k-m2"; step_order = 2; input = @{} }) "error"
}

# Group C: 24 order/tolerance shape checks
foreach ($k in $stepKeys) {
  Run-Case "C1-order-999-$k" @(@{ step_key = $k; step_name = $k; step_order = 999; input = $dummy[$k] }) "shape"
  Run-Case "C2-order-1-$k"   @(@{ step_key = $k; step_name = $k; step_order = 1; input = $dummy[$k] }) "shape"
}

# Group D: 24 mixed two-step checks
for ($i = 0; $i -lt $stepKeys.Count; $i++) {
  $k = $stepKeys[$i]
  $n = $stepKeys[($i + 1) % $stepKeys.Count]
  Run-Case "D1-mix-$k-$n" @(
    @{ step_key = $k; step_name = $k; step_order = 1; input = $dummy[$k] },
    @{ step_key = $n; step_name = $n; step_order = 2; input = @{} }
  ) "2steps"
  Run-Case "D2-mix-$n-$k" @(
    @{ step_key = $n; step_name = $n; step_order = 1; input = $dummy[$n] },
    @{ step_key = $k; step_name = $k; step_order = 2; input = @{} }
  ) "2steps"
}

# Group E: 24 unknown-step warning checks
for ($i = 1; $i -le 24; $i++) {
  $k = $stepKeys[($i - 1) % $stepKeys.Count]
  Run-Case "E-$i-unknown-plus-$k" @(
    @{ step_key = "unknown_step_$i"; step_name = "unknown-$i"; step_order = 1; input = @{} },
    @{ step_key = $k; step_name = $k; step_order = 2; input = $dummy[$k] }
  ) "warning"
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Workflow Dry-Run 120 Matrix"
Write-Host "  $Pass PASS / $Fail FAIL ($($Rows.Count) items)"
Write-Host "========================================"

if ($Fail -gt 0) {
  Write-Host "Top Failures:"
  $Rows | Where-Object { $_.Status -eq "FAIL" } | Select-Object -First 20 | ForEach-Object {
    Write-Host ("  {0} => {1}" -f $_.Name, $_.Detail)
  }
  exit 1
}

exit 0
