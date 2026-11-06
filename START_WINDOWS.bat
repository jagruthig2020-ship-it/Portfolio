@echo off
cd /d "%~dp0"
where py >nul 2>&1
if errorlevel 1 (
    python serve_portfolio.py
) else (
    py serve_portfolio.py
)
pause
