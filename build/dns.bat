@echo off
:: check if is administrator
NET SESSION >nul 2>&1
if %errorLevel% neq 0 (
    echo request administrator authorization...
    powershell -Command "Start-Process cmd -ArgumentList '/c ""%~f0""' -Verb RunAs"
    exit /b
)

:: backup
set "hostsPath=C:\Windows\System32\drivers\etc\hosts"
set "backupPath=C:\Windows\System32\drivers\etc\hosts_backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.bak"
copy "%hostsPath%" "%backupPath%" >nul
echo has set hosts backup: %backupPath%

:: set dns resolve
set "ip=127.0.0.1"
set "domain=whsg.com"

:: check if item has existed
findstr /i /c:"%ip% %domain%" "%hostsPath%" >nul
if %errorLevel% equ 0 (
    echo dns resolve has existed: %ip% %domain%
) else (
    echo add item: %ip% %domain%
    echo.>>"%hostsPath%"
    echo %ip% %domain%>>"%hostsPath%"
)

:: refresh dns cache
ipconfig /flushdns >nul
echo dns cache has updated

echo operation is over
pause