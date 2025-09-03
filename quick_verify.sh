#!/bin/bash

echo "=== HyperHDR WS2814f Fixes Verification ==="
echo "Checking if our fixes are present in the installed package..."
echo

echo "1. Package Information:"
dpkg -s hyperhdr | grep -E "(Package|Version|Source)"
echo

echo "2. Total installed files:"
echo "Files installed: $(dpkg -L hyperhdr | wc -l)"
echo

echo "3. Web interface location:"
dpkg -L hyperhdr | grep -E "(www|web|js)" | head -10
echo

echo "4. Schema files location:"
dpkg -L hyperhdr | grep -i schema | head -10
echo

echo "5. Translation files:"
dpkg -L hyperhdr | grep -i i18n
echo

echo "6. Looking for our specific fixes..."

# Check for translation keys we added
echo "Checking for translation keys we added:"
find /usr -name "*.json" 2>/dev/null | xargs grep -l "edt_dev_spec_gpio_title" 2>/dev/null
find /usr -name "*.json" 2>/dev/null | xargs grep -l "edt_dev_enum_white_from_blue" 2>/dev/null

echo
echo "7. Looking for WS2814f schema files:"
find /usr -name "*ws2814f*" 2>/dev/null
find /usr -name "*schema*" 2>/dev/null | grep -i ws2814f

echo
echo "8. Checking light_source.js for our dependency fixes:"
if find /usr -name "light_source.js" 2>/dev/null | head -1 | read js_file; then
    echo "Found light_source.js at: $js_file"
    echo "Checking for our dependency handling code:"
    grep -n "Manual dependency watchers" "$js_file" 2>/dev/null || echo "Manual dependency watchers code NOT found"
    grep -n "PWM variant" "$js_file" 2>/dev/null || echo "PWM variant code NOT found"
    grep -n "DOM-level forcing for PWM" "$js_file" 2>/dev/null || echo "DOM-level forcing code NOT found"
else
    echo "light_source.js NOT found"
fi

echo
echo "9. Quick schema content check:"
find /usr -name "*ws2814fpwm*" 2>/dev/null | while read schema_file; do
    echo "Checking $schema_file:"
    grep -c "enum_titles" "$schema_file" 2>/dev/null || echo "enum_titles NOT found"
    grep -c "swapWB" "$schema_file" 2>/dev/null || echo "swapWB field NOT found"
done

echo
echo "10. Package build date check:"
stat -c "Package installed: %y" /var/lib/dpkg/info/hyperhdr.list 2>/dev/null

echo
echo "=== Verification Complete ==="
echo "If fixes are missing, the package may be from an older build."
