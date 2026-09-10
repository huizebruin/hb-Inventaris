@echo off
title HB Inventaris
cd /d "%~dp0"

REM --- Check of Python geinstalleerd is ---
where python >nul 2>nul
if errorlevel 1 (
    echo.
    echo Python is nog niet geinstalleerd op deze computer.
    echo.
    echo Er wordt nu een downloadpagina geopend. Installeer Python,
    echo en vink tijdens de installatie "Add python.exe to PATH" aan.
    echo Start daarna dit bestand nogmaals.
    echo.
    start https://www.python.org/downloads/
    pause
    exit /b
)

REM --- Eerste keer: benodigdheden installeren (daarna overgeslagen, sneller opstarten) ---
if not exist "data" mkdir data
if not exist "data\.setup_done" (
    echo Eenmalig instellen, dit duurt even...
    python -m pip install --quiet --upgrade pip
    python -m pip install --quiet flask werkzeug
    echo klaar > "data\.setup_done"
)

REM --- Server starten in eigen venster, browser openen zodra hij klaar staat ---
echo HB Inventaris wordt gestart...
start "HB Inventaris - NIET SLUITEN tijdens gebruik" /min cmd /c "python server.py"
timeout /t 2 /nobreak >nul
start "" http://localhost:5000

echo.
echo De app draait nu en is geopend in je browser.
echo Laat dit venster en het "HB Inventaris" venster gewoon openstaan
echo zolang je de app gebruikt. Sluiten stopt de app.
echo.
pause
