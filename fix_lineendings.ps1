$content = Get-Content "build.sh" -Raw
$content = $content -replace "`r`n", "`n" -replace "`r", "`n"
Set-Content "build.sh" -Value $content -NoNewline
