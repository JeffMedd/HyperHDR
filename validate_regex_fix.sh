#!/bin/bash
# Validation script to test the ArchLinux GLIBC regex fix in simulated docker context

echo "Testing ArchLinux GLIBC regex fix in simulated docker execution context..."

# Extract the current executeCommand from build.sh
executeCommand_raw=$(grep "executeCommand.*GLIBC_VER" build.sh | sed 's/.*executeCommand="//' | sed 's/"$//')

echo "Raw executeCommand from build.sh:"
echo "$executeCommand_raw"
echo ""

# Simulate the docker execution context
echo "Simulating docker bash -c execution:"

# This simulates what happens in the docker command
# The executeCommand gets passed to: su builder -c '${executeCommand}'
# Which means we need to test it in single quotes context

test_command="bash -c \"GLIBC_VER=\\\$(echo 'ldd (GNU libc) 2.35' | head -1 | grep -o '[0-9]\\\\+\\\\.[0-9]\\\\+') && echo \\\"GLIBC version: \\\$GLIBC_VER\\\"\""

echo "Test command:"
echo "$test_command"
echo ""

echo "Executing test command:"
eval "$test_command"

echo ""
echo "Testing the pattern in isolation:"
echo "echo 'ldd (GNU libc) 2.35' | grep -o '[0-9]\\+\\.[0-9]\\+'"
echo 'ldd (GNU libc) 2.35' | grep -o '[0-9]\+\.[0-9]\+'

echo ""
echo "Validation complete."
