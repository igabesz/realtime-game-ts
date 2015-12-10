echo off

start "Realtime game MongoDB server" /MIN mongod.exe --dbpath ..\mongodb
echo MongoDB started
start "Realtime game Node server" /MIN node.exe app
echo Node.js started

:WAITINPUT
set command=E
echo (E)xit the program without stopping the server
echo (R)estart the node.js server
echo (Q)uit and stop the server
:CHOOSE
echo:
set /p command=Choose(E/R/Q):
if %command%==R goto RESTARTNODE
if %command%==r goto RESTARTNODE
if %command%==Restart goto RESTARTNODE
if %command%==restart goto RESTARTNODE
if %command%==E goto EXIT
if %command%==e goto EXIT
if %command%==Exit goto EXIT
if %command%==exit goto EXIT
if %command%==Q goto QUIT
if %command%==q goto QUIT
if %command%==quit goto QUIT
if %command%==quit goto QUIT

echo Invalid input: %command%
goto CHOOSE

:RESTARTNODE
taskkill /FI "Windowtitle eq Realtime game Node server*" /IM node.exe
start "Realtime game Node server" /MIN node.exe app
echo Node.js started
goto WAITINPUT

:QUIT
taskkill /FI "Windowtitle eq Realtime game MongoDB server*" /IM mongod.exe
taskkill /FI "Windowtitle eq Realtime game Node server*" /IM node.exe
goto EXIT

:EXIT
