#!/bin/bash
# WS2814f Fixes Verification Script
# Copy this entire script and run it on your Linux machine

echo "=== HyperHDR WS2814f Fixes Verification ==="
echo "Date: $(date)"
echo

echo "1. Package Information:"
dpkg -s hyperhdr | grep -E "(Package|Version|Architecture)"
echo

echo "2. Checking for installed files:"
echo "Total files: $(dpkg -L hyperhdr | wc -l)"
echo "JSON/JS files:"
dpkg -L hyperhdr | grep -E "\.(json|js)$" | head -10
echo

echo "3. Looking for web interface files:"
dpkg -L hyperhdr | grep -E "(www|web|i18n)" | head -10
echo

echo "4. Searching for our translation keys:"
echo "Looking for 'edt_dev_spec_gpio_title':"
find /usr -name "*.json" 2>/dev/null | xargs grep -l "edt_dev_spec_gpio_title" 2>/dev/null || echo "NOT FOUND"
echo "Looking for 'edt_dev_enum_white_from_blue':"
find /usr -name "*.json" 2>/dev/null | xargs grep -l "edt_dev_enum_white_from_blue" 2>/dev/null || echo "NOT FOUND"
echo

echo "5. Searching for WS2814f schema files:"
find /usr -name "*ws2814f*" 2>/dev/null || echo "NO WS2814f FILES FOUND"
echo

echo "6. Checking light_source.js for our fixes:"
js_file=$(find /usr -name "light_source.js" 2>/dev/null | head -1)
if [ -n "$js_file" ]; then
    echo "Found: $js_file"
    echo "Checking for our fixes:"
    if grep -q "Manual dependency watchers" "$js_file" 2>/dev/null; then
        echo "✅ Manual dependency code FOUND"
    else
        echo "❌ Manual dependency code NOT FOUND"
    fi

    if grep -q "PWM variant" "$js_file" 2>/dev/null; then
        echo "✅ PWM variant code FOUND"
    else
        echo "❌ PWM variant code NOT FOUND"
    fi

    if grep -q "DOM-level forcing for PWM" "$js_file" 2>/dev/null; then
        echo "✅ DOM-level forcing code FOUND"
    else
        echo "❌ DOM-level forcing code NOT FOUND"
    fi
else
    echo "❌ light_source.js NOT FOUND"
fi
echo

echo "7. Package build information:"
echo "Package install date:"
stat -c "Installed: %y" /var/lib/dpkg/info/hyperhdr.list 2>/dev/null || echo "Cannot determine install date"
echo

echo "8. Checking for schema content:"
schema_files=$(find /usr -name "*schema*ws2814f*" 2>/dev/null)
if [ -n "$schema_files" ]; then
    echo "Found schema files:"
    echo "$schema_files"
    for file in $schema_files; do
        echo "Checking $file for enum_titles:"
        grep -c "enum_titles" "$file" 2>/dev/null || echo "enum_titles NOT found"
    done
else
    echo "❌ NO WS2814f schema files found"
fi

echo
echo "=== CONCLUSION ==="
if find /usr -name "*.json" 2>/dev/null | xargs grep -q "edt_dev_spec_gpio_title" 2>/dev/null; then
    echo "✅ WS2814f fixes appear to be PRESENT"
else
    echo "❌ WS2814f fixes appear to be MISSING"
    echo "This suggests the package is from an older build without our fixes."
fi
echo
echo "=== Verification Complete ==="
