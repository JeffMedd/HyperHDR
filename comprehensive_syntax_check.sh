#!/bin/bash

# Comprehensive syntax validation for build.sh
# This script performs thorough checks for common bash syntax issues

echo "=== Comprehensive Build.sh Syntax Validation ==="

if [ ! -f "build.sh" ]; then
    echo "ERROR: build.sh not found!"
    exit 1
fi

# Function to check for concatenated statements
check_concatenated_statements() {
    echo "Checking for concatenated statements..."
    local issues_found=0

    # Check for missing newlines after control structure keywords
    while IFS= read -r line_num; do
        line_num=$(echo "$line_num" | cut -d: -f1)
        line_content=$(sed -n "${line_num}p" build.sh)
        echo "⚠️  Line $line_num: Possible concatenated statement after control structure: $line_content"
        ((issues_found++))
    done < <(grep -n -E '(fi|else|then|do)\s*[a-zA-Z]' build.sh)

    # Check for missing newlines after statement terminators
    while IFS= read -r line_num; do
        line_num=$(echo "$line_num" | cut -d: -f1)
        line_content=$(sed -n "${line_num}p" build.sh)
        echo "⚠️  Line $line_num: Possible concatenated statement after terminator: $line_content"
        ((issues_found++))
    done < <(grep -n -E '(;;|esac)\s*[a-zA-Z]' build.sh)

    # Check for missing newlines after closing brackets/braces
    while IFS= read -r line_num; do
        line_num=$(echo "$line_num" | cut -d: -f1)
        line_content=$(sed -n "${line_num}p" build.sh)
        echo "⚠️  Line $line_num: Possible concatenated statement after bracket: $line_content"
        ((issues_found++))
    done < <(grep -n -E '[\}\)]\s*[a-zA-Z]' build.sh | grep -v printf | grep -v echo)

    if [ $issues_found -eq 0 ]; then
        echo "✅ No concatenated statements found"
    else
        echo "❌ Found $issues_found potential concatenation issues"
    fi

    return $issues_found
}

# Function to check for unmatched quotes
check_quotes() {
    echo "Checking quote balance..."
    local single_quotes=$(grep -o "'" build.sh | wc -l)
    local double_quotes=$(grep -o '"' build.sh | wc -l)

    if [ $((double_quotes % 2)) -eq 0 ]; then
        echo "✅ Double quotes balanced ($double_quotes total)"
    else
        echo "❌ Unbalanced double quotes ($double_quotes total)"
        return 1
    fi

    return 0
}

# Function to check for unmatched brackets
check_brackets() {
    echo "Checking bracket balance..."
    local open_parens=$(grep -o '(' build.sh | wc -l)
    local close_parens=$(grep -o ')' build.sh | wc -l)
    local open_brackets=$(grep -o '\[' build.sh | wc -l)
    local close_brackets=$(grep -o '\]' build.sh | wc -l)
    local open_braces=$(grep -o '{' build.sh | wc -l)
    local close_braces=$(grep -o '}' build.sh | wc -l)

    local paren_diff=$((open_parens - close_parens))
    local bracket_diff=$((open_brackets - close_brackets))
    local brace_diff=$((open_braces - close_braces))

    if [ $paren_diff -eq 0 ]; then
        echo "✅ Parentheses balanced ($open_parens pairs)"
    else
        echo "❌ Unbalanced parentheses (difference: $paren_diff)"
    fi

    if [ $bracket_diff -eq 0 ]; then
        echo "✅ Square brackets balanced ($open_brackets pairs)"
    else
        echo "❌ Unbalanced square brackets (difference: $bracket_diff)"
    fi

    if [ $brace_diff -eq 0 ]; then
        echo "✅ Curly braces balanced ($open_braces pairs)"
    else
        echo "❌ Unbalanced curly braces (difference: $brace_diff)"
    fi

    [ $paren_diff -eq 0 ] && [ $bracket_diff -eq 0 ] && [ $brace_diff -eq 0 ]
}

# Run all checks
echo "Starting comprehensive syntax validation..."
echo ""

check_concatenated_statements
concat_result=$?

echo ""
check_quotes
quote_result=$?

echo ""
check_brackets
bracket_result=$?

echo ""
echo "=== Validation Summary ==="
if [ $concat_result -eq 0 ] && [ $quote_result -eq 0 ] && [ $bracket_result -eq 0 ]; then
    echo "✅ All syntax checks PASSED - build.sh appears to be syntactically correct"
    exit 0
else
    echo "❌ Some syntax issues found - review the output above"
    exit 1
fi
