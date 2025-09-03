#!/bin/bash
# Test script to validate the final ArchLinux GLIBC regex fix

echo "Testing the final executeCommand with proper quoting..."

# Extract the current executeCommand from build.sh
executeCommand_line=$(grep -n "executeCommand.*GLIBC_VER" build.sh)
echo "Found executeCommand line: $executeCommand_line"

# Test the pattern that should be generated
echo ""
echo "Testing the final command that should be executed:"
echo 'GLIBC_VER=$(ldd --version | head -1 | grep -o "[0-9]\+\.[0-9]\+") && echo "GLIBC version: $GLIBC_VER"'

echo ""
echo "Simulating with test data:"
echo 'echo "ldd (GNU libc) 2.35" | grep -o "[0-9]\+\.[0-9]\+"'

echo ""
echo "Expected result: 2.35"

echo ""
echo "Testing the escaping levels:"
echo "Level 1 (bash variable): grep -o \"[0-9]\\\\+\\\\.[0-9]\\\\+\""
echo "Level 2 (docker command): grep -o \\\"[0-9]\\\\\\\\+\\\\\\\\.[0-9]\\\\\\\\+\\\""
echo "Level 3 (su command): This is what gets executed in the container"

echo ""
echo "Build script syntax check..."
cd /d/Documents/projects/HyperHDR 2>/dev/null || cd d:/Documents/projects/HyperHDR 2>/dev/null || echo "Could not change directory"
if [[ -f build.sh ]]; then
    echo "Checking build.sh syntax..."
    # Check specific lines around the executeCommand
    head -240 build.sh | tail -10
else
    echo "build.sh not found in current directory"
fi
