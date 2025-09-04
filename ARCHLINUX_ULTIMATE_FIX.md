# ArchLinux GLIBC Regex Fix - ULTIMATE SOLUTION

## Problem Analysis
The ArchLinux build was failing with bash syntax error due to improper variable escaping in the GLIBC version extraction command.

## Root Cause - Command Execution Chain
The exact execution flow is:
1. **Docker command**: `/bin/bash -c "...${executeCommand}..."`
2. **Variable expansion**: `${executeCommand}` expands BEFORE the su command
3. **Su command**: `su builder -c 'EXPANDED_COMMAND'`
4. **Final execution**: The expanded command runs as the builder user

## Issue Identification
The error showed:
```bash
bash: -c: line 1: `GLIBC_VER=\$(ldd --version | head -1 | grep -o "[0-9]\+\.[0-9]\+") && echo "GLIBC version: \$GLIBC_VER" && sed -i "s/{GLIBC_VERSION}/\$GLIBC_VER/" PKGBUILD && makepkg'
```

The `\$` should be `$` because the variable expansion happens in the docker bash context, not in the su context.

## Ultimate Solution
Fixed the escaping in `build.sh` line 236:

**BEFORE (over-escaped)**:
```bash
executeCommand="GLIBC_VER=\\\$(ldd --version | head -1 | grep -o \"[0-9]\\+\\.[0-9]\\+\") && echo \"GLIBC version: \\\$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\\\$GLIBC_VER/\" PKGBUILD && makepkg"
```

**AFTER (correctly escaped)**:
```bash
executeCommand="GLIBC_VER=\$(ldd --version | head -1 | grep -o \"[0-9]\\+\\.[0-9]\\+\") && echo \"GLIBC version: \$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\$GLIBC_VER/\" PKGBUILD && makepkg"
```

## Key Changes
1. **Reduced dollar sign escaping**: `\$` instead of `\\\$`
2. **Maintained regex quoting**: `"[0-9]\\+\\.[0-9]\\+"`
3. **Proper context understanding**: Escaping for docker bash, not su context

## Final Command Execution
When expanded, the command becomes:
```bash
su builder -c 'GLIBC_VER=$(ldd --version | head -1 | grep -o "[0-9]\+\.[0-9]\+") && echo "GLIBC version: $GLIBC_VER" && sed -i "s/{GLIBC_VERSION}/$GLIBC_VER/" PKGBUILD && makepkg'
```

This properly:
- Executes `ldd --version` to get GLIBC info
- Extracts version using quoted regex pattern
- Replaces placeholder in PKGBUILD
- Runs makepkg to build the package

## Status
✅ **ULTIMATE FIX APPLIED** - The ArchLinux build should now complete successfully with proper GLIBC version detection and package generation.

This fix correctly accounts for the actual command execution chain in the Docker + su context.
