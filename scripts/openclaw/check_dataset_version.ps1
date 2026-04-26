param(
  [string]$DatasetVersionId = ''
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($DatasetVersionId)) {
  $result = [ordered]@{
    ok = $false
    error = 'dataset_version_id is required'
    checked_at = (Get-Date).ToString('o')
  }
  $result | ConvertTo-Json -Depth 5
  exit 0
}

$dbPath = 'E:\AIP\repo\packages\db\agi_factory.db'
if (-not (Test-Path $dbPath)) {
  $result = [ordered]@{
    ok = $false
    error = 'db_not_found'
    db_path = $dbPath
    checked_at = (Get-Date).ToString('o')
  }
  $result | ConvertTo-Json -Depth 5
  exit 0
}

try {
  Add-Type -AssemblyName System.Data
  $conn = New-Object System.Data.Odbc.OdbcConnection("Driver=SQLite3 ODBC Driver;Database=$dbPath;")
  $conn.Open()
  $cmd = $conn.CreateCommand()
  $cmd.CommandText = "SELECT id, dataset_id, version, status, sample_count, train_count, val_count, test_count, updated_at FROM dataset_versions WHERE id = ? LIMIT 1"
  $param = $cmd.Parameters.Add('p1',[System.Data.Odbc.OdbcType]::VarChar)
  $param.Value = $DatasetVersionId
  $reader = $cmd.ExecuteReader()

  if ($reader.Read()) {
    $result = [ordered]@{
      ok = $true
      dataset_version = [ordered]@{
        id = "$($reader['id'])"
        dataset_id = "$($reader['dataset_id'])"
        version = "$($reader['version'])"
        status = "$($reader['status'])"
        sample_count = [int]$reader['sample_count']
        train_count = [int]$reader['train_count']
        val_count = [int]$reader['val_count']
        test_count = [int]$reader['test_count']
        updated_at = "$($reader['updated_at'])"
      }
      checked_at = (Get-Date).ToString('o')
    }
  } else {
    $result = [ordered]@{
      ok = $false
      error = 'dataset_version_not_found'
      dataset_version_id = $DatasetVersionId
      checked_at = (Get-Date).ToString('o')
    }
  }

  $reader.Close()
  $conn.Close()
  $result | ConvertTo-Json -Depth 8
} catch {
  $result = [ordered]@{
    ok = $false
    error = $_.Exception.Message
    dataset_version_id = $DatasetVersionId
    checked_at = (Get-Date).ToString('o')
  }
  $result | ConvertTo-Json -Depth 8
}
