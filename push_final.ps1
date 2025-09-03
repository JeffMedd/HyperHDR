# PowerShell script to push changes
Set-Location "d:\Documents\projects\HyperHDR"

# Set environment to avoid pagers
$env:GIT_PAGER = ""
$env:PAGER = ""

Write-Host "Checking git status..."
$status = git status --porcelain
if ($status) {
    Write-Host "Uncommitted changes found, committing..."
    git add -A
    git commit -m "Final WS2814f UI interface fixes - permanent SwapWB solution"
}

Write-Host "Pushing to origin/master..."
git push origin master

Write-Host "Push completed. Check GitHub Actions at: https://github.com/JeffMedd/HyperHDR/actions"
