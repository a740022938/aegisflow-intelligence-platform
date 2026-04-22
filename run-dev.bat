@echo off
cd /d E:\AGI_Factory\repo
start "AGI Factory API" cmd /k "cd /d E:\AGI_Factory\repo && pnpm --dir apps/local-api dev"
start "AGI Factory Web" cmd /k "cd /d E:\AGI_Factory\repo && pnpm --dir apps/web-ui dev"
