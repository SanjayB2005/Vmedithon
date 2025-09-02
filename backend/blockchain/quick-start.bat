@echo off
title Vmedithon Blockchain Quick Start

echo.
echo ======================================
echo   🏥 Vmedithon Blockchain Quick Start
echo ======================================
echo.

cd /d "%~dp0"
echo 📍 Current directory: %CD%
echo.

echo 🔍 Step 1: Checking for existing blockchain...
node diagnose.js

echo.
echo ⏸️  Press any key to start Ganache blockchain...
pause >nul

echo.
echo 🚀 Step 2: Starting Ganache blockchain...
echo 📋 Configuration:
echo    • Port: 8545
echo    • Accounts: 10 (100 ETH each)
echo    • Network ID: 1337
echo    • Host: 0.0.0.0 (accessible from outside)
echo.

echo 🔄 Starting Ganache in a new window...
start "Vmedithon Ganache" cmd /k "echo 🏥 Vmedithon Ganache Blockchain && echo ================================= && npx ganache-cli -h 0.0.0.0 -p 8545 -a 10 -e 100 --deterministic --networkId 1337"

echo.
echo ⏳ Waiting 10 seconds for Ganache to start...
timeout /t 10 /nobreak >nul

echo.
echo 🚀 Step 3: Deploying smart contracts...
echo.
node deploy-simple.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🎉 SUCCESS! Blockchain is ready!
    echo.
    echo 📋 What's Running:
    echo    • Ganache blockchain on port 8545
    echo    • MedicalRecords smart contract deployed
    echo    • 10 test accounts with 100 ETH each
    echo.
    echo 🚀 Next Steps:
    echo    1. Configure MetaMask:
    echo       - Network: Custom RPC
    echo       - RPC URL: http://localhost:8545
    echo       - Chain ID: 1337
    echo       - Currency: ETH
    echo.
    echo    2. Test the workflow:
    echo       cd ..
    echo       npm run test:workflow
    echo.
    echo    3. Start your backend server:
    echo       npm start
    echo.
    echo ✅ Ready for development!
) else (
    echo.
    echo ❌ Deployment failed. Common solutions:
    echo    1. Make sure Ganache window is still running
    echo    2. Check Windows Firewall settings
    echo    3. Try running as Administrator
    echo    4. Use different port: npx ganache-cli -p 7545
    echo.
    echo 🔧 Run diagnose.js to troubleshoot
)

echo.
echo ⏸️  Press any key to exit...
pause >nul
