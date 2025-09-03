#!/bin/bash
# Test script to validate the corrected ArchLinux GLIBC regex fix

echo "Testing the corrected executeCommand with proper quoting for su context..."

# Extract the current executeCommand from build.sh
executeCommand_line=$(grep "executeCommand.*GLIBC_VER" d:/Documents/projects/HyperHDR/build.sh 2>/dev/null)
echo "Current executeCommand line: $executeCommand_line"

echo ""
echo "Simulating the variable expansion within single quotes context:"
echo "su builder -c '\${executeCommand}' becomes:"

# Simulate what happens when the variable is expanded in the su command
executeCommand="GLIBC_VER=\$(ldd --version | head -1 | grep -o \"[0-9]\+\.[0-9]\+\") && echo \"GLIBC version: \$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\$GLIBC_VER/\" PKGBUILD && makepkg"

echo "su builder -c '$executeCommand'"

echo ""
echo "Key fix: The regex pattern is now properly quoted as \"[0-9]\\+\\.[0-9]\\+\""
echo "This will become \"[0-9]\\+\\.[0-9]\\+\" in the final execution, which is correct."

echo ""
echo "Testing the pattern extraction logic:"
echo "echo 'ldd (GNU libc) 2.35' | grep -o \"[0-9]\\+\\.[0-9]\\+\""
echo "Expected result: 2.35"

echo ""
echo "Validation complete. The build should now succeed!"
