@echo off
cd /d E:\AIP\repo
start "AGI Factory API" cmd /k "cd /d E:\AIP\repo && pnpm --dir apps/local-api dev"
start "AGI Factory Web" cmd /k "cd /d E:\AIP\repo && pnpm --dir apps/web-ui dev"
