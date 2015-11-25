echo off
start "Realtime game MongoDB server" /MIN mongod.exe --dbpath ..\mongodb
start "Realtime game Node server" /MIN node.exe app

:WAITINPUT
set command=X
echo (R)estart node server
echo (Q)uit program
:CHOOSE
echo:
set /p command=Choose(R/Q):
if %command%==R goto RESTARTNODE
if %command%==r goto RESTARTNODE
if %command%==Q goto EXIT
if %command%==q goto EXIT
if %command%==Exit goto EXIT
if %command%==exit goto EXIT
if %command%==quit goto EXIT
if %command%==quit goto EXIT

echo Invalid input: %command%
goto CHOOSE

:RESTARTNODE
taskkill /FI "Windowtitle eq Node server*" /IM cmd.exe
start "Node server" cmd.exe /K node.exe app
goto WAITINPUT

:EXIT
taskkill /FI "Windowtitle eq Realtime game MongoDB server*" /IM mongod.exe
taskkill /FI "Windowtitle eq Realtime game Node server*" /IM node.exe
