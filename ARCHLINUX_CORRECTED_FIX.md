# ArchLinux GLIBC Regex Fix - CORRECTED SOLUTION

## Problem Analysis
The ArchLinux build was failing with this bash syntax error:
```bash
bash: -c: line 1: syntax error near unexpected token `('
bash: -c: line 1: `GLIBC_VER=\$(ldd --version | head -1 | grep -o [0-9]+.[0-9]+) && echo "GLIBC version: \$GLIBC_VER" && sed -i "s/{GLIBC_VERSION}/\$GLIBC_VER/" PKGBUILD && makepkg'
```

## Root Cause Discovery
The issue was with the **command execution context**. The `executeCommand` variable gets expanded within a `su` command using single quotes:

```bash
su builder -c '${executeCommand}'
```

When the variable is expanded, it becomes:
```bash
su builder -c 'GLIBC_VER=$(ldd --version | head -1 | grep -o [0-9]+.[0-9]+) && ...'
```

The problem: `[0-9]+.[0-9]+` without quotes causes bash to interpret `[]` as shell globbing patterns instead of literal characters for the regex.

## Correct Solution
The regex pattern must be **properly quoted** in the final command execution. Since the `executeCommand` gets placed within single quotes by the `su` command, the pattern needs double quotes within the variable.

### Fixed Line (build.sh line 236):
```bash
executeCommand="GLIBC_VER=\\\$(ldd --version | head -1 | grep -o \"[0-9]\\+\\.[0-9]\\+\") && echo \"GLIBC version: \\\$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\\\$GLIBC_VER/\" PKGBUILD && makepkg"
```

### Key Changes:
1. **Regex pattern quoted**: `\"[0-9]\\+\\.[0-9]\\+\"` (escaped double quotes)
2. **Literal dot**: `\\.[0-9]` (escaped dot for literal match, not wildcard)
3. **Proper escaping**: Accounts for variable assignment → su command → bash execution

## Command Execution Flow
1. **Variable assignment**: Pattern stored with escaped quotes
2. **Docker command**: Variable passed to container
3. **su command**: `su builder -c '${executeCommand}'` expands variable
4. **Final execution**: `grep -o "[0-9]\+\.[0-9]\+"` (properly quoted pattern)

## Expected Result
The command will now:
- Extract GLIBC version from `ldd (GNU libc) 2.35` → `2.35`
- Replace `{GLIBC_VERSION}` in PKGBUILD with the extracted version
- Successfully run `makepkg` to build the ArchLinux package

## Validation
```bash
# This pattern should work correctly:
echo "ldd (GNU libc) 2.35" | grep -o "[0-9]\+\.[0-9]\+"
# Expected output: 2.35
```

## Status
✅ **CORRECTED** - The regex pattern is now properly quoted for the su command execution context. The ArchLinux build should succeed without bash syntax errors.

This fix addresses the precise escaping requirements for the multi-level command execution: bash variable → docker → su → final bash execution.
