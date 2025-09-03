@echo off
echo 🚀 Vmedithon Blockchain Deployment
echo ================================

echo.
echo Choose your deployment option:
echo 1. Sepolia Testnet (Ethereum)
echo 2. Polygon Mumbai (Cheaper gas)
echo 3. Cancel
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🌐 Deploying to Sepolia Testnet...
    echo Make sure you have:
    echo ✅ PRIVATE_KEY in .env file
    echo ✅ Sepolia ETH in your wallet
    echo.
    pause
    node deploy-sepolia.js
) else if "%choice%"=="2" (
    echo.
    echo 🟣 Deploying to Polygon Mumbai...
    echo Make sure you have:
    echo ✅ PRIVATE_KEY in .env file  
    echo ✅ Mumbai MATIC in your wallet
    echo.
    pause
    node deploy-mumbai.js
) else (
    echo Deployment cancelled.
    exit
)

echo.
echo ✅ Deployment complete! Check the output above for contract address.
pause
