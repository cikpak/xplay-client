@echo off
Setlocal enableextensions

set "port=8000"
set "message=Server is working!"

:: get local ip
for /f "tokens=8" %%a in ('tracert -d -h 1 -w 1 -4 1.1.1.1 ^| find "<"') do set "GateWay=%%a"
for /f "tokens=3-4" %%a in ('route print -4 ^| find "%GateWay%"') do set "localip=%%b"& goto ext
:ext
:: get binded ip
del /f /a net_*.log 2>NUL >NUL
for /f %%a in ('arp -a -N %localip% ^| find /v "---" ^| find "-"') do (
	start "" /b powershell.exe -executionpolicy bypass -command "Invoke-RestMethod -Uri %%a:%port% -TimeoutSec 1 > net_%%a.log 2>$null" 2>NUL
)
set sec=0
:begin
set /a sec+=1
if %sec% GTR 5 goto clean
timeout -t 1 >NUL
for /f %%a in ('dir /b /a-d "net_*.log"') do (
	< "%%~a" find "%message%" >NUL 2>NUL && for /f "tokens=2 delims=_" %%b in ("%%~na") do echo %%b& goto clean
)
goto begin
:clean
call :GetCurrentProcessID mypid
wmic process where 'name="powershell.exe" AND ParentProcessId=%mypid%' delete >NUL 2>NUL
timeout -t 1 >NUL
del /f /a net_*.log 2>NUL >NUL
goto :eof

:GetCurrentProcessID [mypid]
  SetLocal EnableDelayedExpansion
  for /f "tokens=2 delims=," %%a in ('tasklist /fo csv /nh ^| find /i "cmd.exe"') do set "curPID=!x!"& set "x=%%~a"
EndLocal & set "%~1=%curPID%" & Exit /B