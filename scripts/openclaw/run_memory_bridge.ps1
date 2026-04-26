$repo = $args[0]
$logDir = "$repo\logs"
$logFile = "$logDir\aip-memory.log"
$bridgeScript = "$repo\scripts\openclaw\memory_bridge_v2.ps1"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$timestamp] Memory Bridge started" | Out-File -FilePath $logFile -Encoding utf8

while ($true) {
    try {
        & $bridgeScript -IntervalSec 30 2>&1 | Out-File -FilePath $logFile -Append -Encoding utf8
    } catch {
        $errTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "[$errTimestamp] Bridge error: $_" | Out-File -FilePath $logFile -Append -Encoding utf8
    }
    Start-Sleep 30
}