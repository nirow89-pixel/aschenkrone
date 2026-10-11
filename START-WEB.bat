@echo off
cd /d "%~dp0"
echo Aschenkrone startet unter http://127.0.0.1:8766/web/index.html
echo Dieses Fenster offen lassen. Nicht die HTML-Datei direkt oeffnen.
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8766/web/index.html"
where py >nul 2>&1 && py -m http.server 8766 && goto :eof
where python >nul 2>&1 && python -m http.server 8766 && goto :eof
where python3 >nul 2>&1 && python3 -m http.server 8766 && goto :eof
echo Python fehlt. Bitte Python installieren und diese Datei nochmal starten.
pause
