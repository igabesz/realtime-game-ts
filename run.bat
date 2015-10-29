echo off
start "MongoDB server" cmd.exe /K mongod.exe --dbpath ..\mongodb
call tsc -p .
start "Node server" cmd.exe /K node.exe app
echo Waiting for exit
pause
taskkill /FI "Windowtitle eq MongoDB server*" /IM cmd.exe
taskkill /FI "Windowtitle eq Node server*" /IM cmd.exe