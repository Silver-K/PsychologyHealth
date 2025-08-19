@echo off
:: 检查是否安装依赖
if exist node_modules (
    echo Dependencies installed, start server...
    "node\node.exe" server.js
) else (
    echo Dependencies not found, installing...
    call "node\pnpm.cmd" install
    
    if %errorlevel% equ 0 (
        echo Dependencies installed successfully, start server...
        "node\node.exe" server.js
    ) else (
        echo install failed, please check network or package.json...
        pause
    )
)