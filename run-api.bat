@echo off
set "AIP_ROOT=%~dp0"
cd /d "%AIP_ROOT%"
pnpm dev:api
