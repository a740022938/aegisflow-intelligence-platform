# Windows 打包命令清单（DR Release）

> 目标：在不改业务代码的前提下，生成可上传 GitHub Releases 的 DR 资产。

## 0. 变量

```powershell
$repo='E:\AGI_Factory\repo'
$ver='v6.6.6'  # 后续可改为 v6.6.6
$stamp=Get-Date -Format 'yyyyMMdd_HHmmss'
$outDir="E:\AGI_Factory\backups\dr_release_${ver}_$stamp"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
```

## 1. 生成 clean source

```powershell
$cleanZip=Join-Path $outDir "AGI_Model_Factory_${ver}_clean_source.zip"
git -C $repo archive --format=zip --output=$cleanZip HEAD
```

## 2. 生成 db init bundle

```powershell
$dbZip=Join-Path $outDir "AGI_Model_Factory_${ver}_db_init_bundle.zip"
$tmpDb=Join-Path $outDir '_tmp_db_bundle'
New-Item -ItemType Directory -Force -Path $tmpDb | Out-Null
Copy-Item -Path (Join-Path $repo 'packages\db\schema.sql') -Destination (Join-Path $tmpDb 'schema.sql') -Force
"-- optional minimal seed" | Set-Content -Path (Join-Path $tmpDb 'seed_minimal.sql') -Encoding UTF8
"# DB init readme" | Set-Content -Path (Join-Path $tmpDb 'db_init_readme.md') -Encoding UTF8
Compress-Archive -Path (Join-Path $tmpDb '*') -DestinationPath $dbZip -Force
Remove-Item -Recurse -Force $tmpDb
```

## 3. 生成 quickstart / checksum / manifest

```powershell
$quick=Join-Path $outDir "AGI_Model_Factory_${ver}_recovery_quickstart.md"
$shaFile=Join-Path $outDir "AGI_Model_Factory_${ver}_SHA256SUMS.txt"
$manifest=Join-Path $outDir "AGI_Model_Factory_${ver}_restore_manifest.json"

"# Recovery Quickstart" | Set-Content -Path $quick -Encoding UTF8

$assets=Get-ChildItem -File $outDir | Where-Object { $_.Name -like "AGI_Model_Factory_${ver}_*" }
$rows=@(); $items=@()
foreach($a in $assets){
  $hash=(Get-FileHash -Path $a.FullName -Algorithm SHA256).Hash.ToLower()
  $rows += "${hash}  $($a.Name)"
  $items += [PSCustomObject]@{ file=$a.Name; size_bytes=$a.Length; sha256=$hash }
}
$rows | Set-Content -Path $shaFile -Encoding UTF8
([PSCustomObject]@{ version=$ver; generated_at=(Get-Date).ToString('s'); assets=$items } | ConvertTo-Json -Depth 6) | Set-Content -Path $manifest -Encoding UTF8
```

## 4. 发布前检查

```powershell
Get-ChildItem -File $outDir | Select Name,Length,LastWriteTime
Get-Content $shaFile
```

## 5. 上传到 GitHub Releases

- 上传上述 5 个文件
- 填写版本说明：环境基线、恢复步骤、已知限制

