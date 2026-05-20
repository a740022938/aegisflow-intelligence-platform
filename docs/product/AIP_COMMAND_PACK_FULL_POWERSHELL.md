# AIP Command Pack — Full PowerShell

**生成日期**: 2026-05-20

---

## 基础定位

```powershell
Set-Location E:\AIP

git branch --show-current
git status --short
git rev-parse --short HEAD
git log -1 --oneline
```

## 环境检查

```powershell
node -v
npm -v
python --version
git --version
where.exe node
where.exe npm
where.exe python
where.exe git
```

## AIP CLI 检查

```powershell
where.exe aip
if ($LASTEXITCODE -ne 0) {
  Write-Host "AIP CLI not found in PATH"
} else {
  aip version
  aip status
  aip health
  aip doctor
}
```

## 项目验证

```powershell
Set-Location E:\AIP

npm run typecheck
npm test
npm run build
git diff --check
```

## npm scripts 探测

```powershell
Set-Location E:\AIP
npm run
```

## API smoke（只读）

```powershell
try { Invoke-RestMethod http://127.0.0.1:8787/api/health } catch { $_.Exception.Message }
try { Invoke-RestMethod http://127.0.0.1:8787/api/runtime/status } catch { $_.Exception.Message }
try { Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status } catch { $_.Exception.Message }
```

## POST blocked 验证

```powershell
try {
  Invoke-RestMethod -Method Post http://127.0.0.1:8787/api/stage-c/status
} catch {
  if ($_.Exception.Response) {
    $_.Exception.Response.StatusCode.value__
  } else {
    $_.Exception.Message
  }
}
```

## 端口检查（不杀进程）

```powershell
Get-NetTCPConnection -LocalPort 8787 -ErrorAction SilentlyContinue

$pid8787 = (Get-NetTCPConnection -LocalPort 8787 -ErrorAction SilentlyContinue).OwningProcess
if ($pid8787) {
  Get-Process -Id $pid8787
}
```

禁止 `taskkill`，除非 human owner 明确授权 restart。
