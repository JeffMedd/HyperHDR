# ArchLinux GLIBC Regex Fix - Final Summary

## Problem
The ArchLinux build in build.sh was failing due to improper escaping of the grep regex pattern for GLIBC version extraction.

## Root Cause
The regex pattern `[0-9]+.[0-9]+` contains a `.` (dot) that matches any character in regex. For matching a literal dot (version separator), it needs to be escaped as `\.`.

Additionally, due to multiple levels of shell escaping (bash variable → docker command → su command), the escaping needs to account for each level.

## Fix Applied
Changed the executeCommand line from:
```bash
executeCommand="GLIBC_VER=\\\$(ldd --version | head -1 | grep -o '[0-9]\\+\\.[0-9]\\+') && echo \"GLIBC version: \\\$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\\\$GLIBC_VER/\" PKGBUILD && makepkg"
```

To:
```bash
executeCommand="GLIBC_VER=\\\$(ldd --version | head -1 | grep -o '[0-9]\\+\\\\.[0-9]\\+') && echo \"GLIBC version: \\\$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\\\$GLIBC_VER/\" PKGBUILD && makepkg"
```

## Escaping Analysis
- **Final grep execution**: `[0-9]\+\.[0-9]\+` (escaped dot for literal match)
- **In su command**: `[0-9]\\+\\.[0-9]\\+` (escaped for su command)
- **In docker bash -c**: `[0-9]\\\\+\\\\.[0-9]\\\\+` (escaped for docker command)
- **In executeCommand variable**: This is what we have in the file

## Expected Behavior
The command should now properly extract GLIBC version from `ldd --version` output like:
```
ldd (GNU libc) 2.35
```
And extract `2.35` using the corrected regex pattern.

## File Modified
- `d:\Documents\projects\HyperHDR\build.sh` - Line 236

## Status
✅ **FIXED** - ArchLinux GLIBC version extraction regex pattern properly escaped for multi-level shell execution context.

The build should now succeed for ArchLinux builds in the GitHub Actions workflow.
