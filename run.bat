echo off
IF NOT EXIST ..\mongodb mkdir ..\mongodb
start "MongoDB server" cmd.exe /K mongod.exe --dbpath ..\mongodb

:COMPILE
call tsc -p .
start "Node server" cmd.exe /K node.exe app
goto WAITINPUT

:WAITINPUT
set /p command=(R)estart node, re(C)ompile project, e(X)it: 
if %command%==R goto RESTARTNODE
if %command%==r goto RESTARTNODE
if %command%==C goto RECOMPILE
if %command%==c goto RECOMPILE
goto EXIT

:RECOMPILE
taskkill /FI "Windowtitle eq Node server*" /IM cmd.exe
goto COMPILE

:RESTARTNODE
taskkill /FI "Windowtitle eq Node server*" /IM cmd.exe
start "Node server" cmd.exe /K node.exe app
goto WAITINPUT

:EXIT
taskkill /FI "Windowtitle eq MongoDB server*" /IM cmd.exe
taskkill /FI "Windowtitle eq Node server*" /IM cmd.exe
