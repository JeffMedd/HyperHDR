@echo off
echo Connecting to remote machine to verify WS2814f fixes...
echo.

echo === Checking Package Version ===
plink -ssh -pw Granada77 -batch jeffm@192.168.1.34 "dpkg -s hyperhdr | grep Version"
echo.

echo === Checking Installed Files ===
plink -ssh -pw Granada77 -batch jeffm@192.168.1.34 "dpkg -L hyperhdr | grep -E '\.(json|js)$' | head -10"
echo.

echo === Looking for Translation Files ===
plink -ssh -pw Granada77 -batch jeffm@192.168.1.34 "find /usr -name 'en.json' 2>/dev/null | grep -i hyperhdr"
echo.

echo === Checking for WS2814f Schema Files ===
plink -ssh -pw Granada77 -batch jeffm@192.168.1.34 "find /usr -name '*ws2814f*' 2>/dev/null"
echo.

echo === Checking for Our Translation Keys ===
plink -ssh -pw Granada77 -batch jeffm@192.168.1.34 "find /usr -name '*.json' 2>/dev/null | xargs grep -l 'edt_dev_spec_gpio_title' 2>/dev/null"
echo.

echo === Checking light_source.js ===
plink -ssh -pw Granada77 -batch jeffm@192.168.1.34 "find /usr -name 'light_source.js' 2>/dev/null"
echo.

echo === Checking for Our JavaScript Fixes ===
plink -ssh -pw Granada77 -batch jeffm@192.168.1.34 "if [ -f /usr/share/hyperhdr/web/js/light_source.js ]; then grep -c 'Manual dependency watchers' /usr/share/hyperhdr/web/js/light_source.js; else echo 'File not found'; fi"
echo.

echo Investigation complete.
pause
