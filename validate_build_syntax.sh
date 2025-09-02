#!/bin/bash

# Simple bash syntax validation script for build.sh
# This helps catch syntax errors before committing

echo "=== Bash Syntax Validation for build.sh ==="

# Check if build.sh exists
if [ ! -f "build.sh" ]; then
    echo "ERROR: build.sh not found!"
    exit 1
fi

# Basic syntax check using bash -n
echo "Checking bash syntax..."
if bash -n build.sh 2>/dev/null; then
    echo "✅ Basic bash syntax check PASSED"
else
    echo "❌ Basic bash syntax check FAILED"
    echo "Running detailed syntax check..."
    bash -n build.sh
    exit 1
fi

# Check for common issues
echo "Checking for common issues..."

# Check for missing newlines in case statements
if grep -n ";;[[:space:]]*[a-zA-Z]" build.sh; then
    echo "⚠️  WARNING: Possible missing newline after case statement"
fi

# Check for missing spaces around operators
if grep -n "==" build.sh | grep -v " == "; then
    echo "⚠️  WARNING: Missing spaces around == operator"
fi

# Check for unbalanced quotes (simple check)
quote_count=$(grep -o '"' build.sh | wc -l)
if [ $((quote_count % 2)) -ne 0 ]; then
    echo "❌ WARNING: Odd number of quotes detected ($quote_count)"
else
    echo "✅ Quote balance check PASSED ($quote_count quotes)"
fi

# Check for potential concatenated statements
if grep -n '\].*\[' build.sh; then
    echo "⚠️  WARNING: Possible concatenated bracket statements"
fi

echo "=== Validation Complete ==="
echo "If no errors shown above, build.sh syntax appears valid."
