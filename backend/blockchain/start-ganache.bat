@echo off
cd /d "C:\Users\ADMIN\Desktop\Vmedithon\backend"
npx ganache --port 7545 --accounts 10 --deterministic --host 127.0.0.1
pause
