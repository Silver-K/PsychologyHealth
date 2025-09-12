set PATH=%cd%\\node;%PATH%

echo Dependencies installed, start server...
cd build
node server.js
pause
