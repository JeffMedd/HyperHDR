# Comprehensive syntax validation for build.sh (PowerShell version)
# This script performs thorough checks for common bash syntax issues

Write-Host "=== Comprehensive Build.sh Syntax Validation ===" -ForegroundColor Green

if (-not (Test-Path "build.sh")) {
    Write-Host "ERROR: build.sh not found!" -ForegroundColor Red
    exit 1
}

$content = Get-Content "build.sh"
$issuesFound = 0

Write-Host "`nChecking for concatenated statements..." -ForegroundColor Yellow

# Check for missing newlines after control structure keywords
for ($i = 0; $i -lt $content.Length; $i++) {
    $line = $content[$i]
    $lineNum = $i + 1

    # Check for concatenated control structures
    if ($line -match '(fi|else|then|do)\s+[a-zA-Z]') {
        Write-Host "⚠️  Line $lineNum`: Possible concatenated statement after control structure: $line" -ForegroundColor Yellow
        $issuesFound++
    }

    # Check for concatenated terminators
    if ($line -match '(;;|esac)\s+[a-zA-Z]') {
        Write-Host "⚠️  Line $lineNum`: Possible concatenated statement after terminator: $line" -ForegroundColor Yellow
        $issuesFound++
    }

    # Check for concatenated brackets/braces (excluding printf/echo statements)
    if ($line -match '[\}\)]\s*[a-zA-Z]' -and $line -notmatch 'printf' -and $line -notmatch 'echo') {
        Write-Host "⚠️  Line $lineNum`: Possible concatenated statement after bracket: $line" -ForegroundColor Yellow
        $issuesFound++
    }
}

if ($issuesFound -eq 0) {
    Write-Host "✅ No concatenated statements found" -ForegroundColor Green
} else {
    Write-Host "❌ Found $issuesFound potential concatenation issues" -ForegroundColor Red
}

Write-Host "`nChecking quote balance..." -ForegroundColor Yellow
$doubleQuotes = ([regex]::Matches($content -join "`n", '"')).Count
if ($doubleQuotes % 2 -eq 0) {
    Write-Host "✅ Double quotes balanced ($doubleQuotes total)" -ForegroundColor Green
    $quotesOk = $true
} else {
    Write-Host "❌ Unbalanced double quotes ($doubleQuotes total)" -ForegroundColor Red
    $quotesOk = $false
}

Write-Host "`nChecking bracket balance..." -ForegroundColor Yellow
$fullContent = $content -join "`n"
$openParens = ([regex]::Matches($fullContent, '\(')).Count
$closeParens = ([regex]::Matches($fullContent, '\)')).Count
$openBrackets = ([regex]::Matches($fullContent, '\[')).Count
$closeBrackets = ([regex]::Matches($fullContent, '\]')).Count
$openBraces = ([regex]::Matches($fullContent, '\{')).Count
$closeBraces = ([regex]::Matches($fullContent, '\}')).Count

$parenDiff = $openParens - $closeParens
$bracketDiff = $openBrackets - $closeBrackets
$braceDiff = $openBraces - $closeBraces

$bracketsOk = $true

if ($parenDiff -eq 0) {
    Write-Host "✅ Parentheses balanced ($openParens pairs)" -ForegroundColor Green
} else {
    Write-Host "❌ Unbalanced parentheses (difference: $parenDiff)" -ForegroundColor Red
    $bracketsOk = $false
}

if ($bracketDiff -eq 0) {
    Write-Host "✅ Square brackets balanced ($openBrackets pairs)" -ForegroundColor Green
} else {
    Write-Host "❌ Unbalanced square brackets (difference: $bracketDiff)" -ForegroundColor Red
    $bracketsOk = $false
}

if ($braceDiff -eq 0) {
    Write-Host "✅ Curly braces balanced ($openBraces pairs)" -ForegroundColor Green
} else {
    Write-Host "❌ Unbalanced curly braces (difference: $braceDiff)" -ForegroundColor Red
    $bracketsOk = $false
}

Write-Host "`n=== Validation Summary ===" -ForegroundColor Green
if ($issuesFound -eq 0 -and $quotesOk -and $bracketsOk) {
    Write-Host "✅ All syntax checks PASSED - build.sh appears to be syntactically correct" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some syntax issues found - review the output above" -ForegroundColor Red
    exit 1
}
