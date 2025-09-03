#!/bin/bash

echo "=== HyperHDR Package Investigation ==="
echo "Checking if WS2814f fixes are present in installed package"
echo

echo "1. Package information:"
dpkg -s hyperhdr | grep -E "(Package|Version|Description)"
echo

echo "2. All installed files:"
echo "Total files: $(dpkg -L hyperhdr | wc -l)"
echo

echo "3. Looking for JSON/schema files:"
dpkg -L hyperhdr | grep -E "\.(json|js)$" | head -10
echo

echo "4. Looking for web files:"
dpkg -L hyperhdr | grep -E "(www|web|i18n)" | head -10
echo

echo "5. Looking for schema files specifically:"
find /usr -name "*ws2814f*" 2>/dev/null | head -10
echo

echo "6. Checking translation files:"
find /usr -name "en.json" 2>/dev/null | grep -i hyperhdr | head -5
echo

echo "7. Checking for our specific translation keys:"
find /usr -name "*.json" 2>/dev/null | xargs grep -l "edt_dev_spec_gpio_title" 2>/dev/null | head -5
echo

echo "8. Looking for WS2814f schema files:"
find /usr -name "*schema*ws2814f*" 2>/dev/null | head -5
echo

echo "9. HyperHDR installation directory structure:"
find /usr -type d -name "*hyperhdr*" 2>/dev/null | head -10
echo

echo "10. Checking installed version vs expected:"
echo "Expected: Package with WS2814f-fixes in filename"
echo "Installed package files in /home:"
ls -la /home/*/HyperHDR*WS2814f* 2>/dev/null
echo

echo "11. Checking web interface files location:"
find /usr -name "light_source.js" 2>/dev/null | head -5
echo

echo "12. Verifying package actually contains our commit:"
if [ -f /usr/share/hyperhdr/web/js/light_source.js ]; then
    echo "Found light_source.js - checking for our fixes:"
    grep -n "Manual dependency watchers" /usr/share/hyperhdr/web/js/light_source.js | head -3
    grep -n "PWM variant" /usr/share/hyperhdr/web/js/light_source.js | head -3
else
    echo "light_source.js not found in expected location"
fi
echo

echo "=== Investigation Complete ==="
