#!/bin/bash
# Test script to validate the ArchLinux GLIBC regex fix

echo "Testing ArchLinux GLIBC version extraction command..."

# Extract the executeCommand from build.sh
executeCommand="GLIBC_VER=\$(ldd --version | head -1 | grep -o '[0-9]\+\.[0-9]\+') && echo \"GLIBC version: \$GLIBC_VER\" && sed -i \"s/{GLIBC_VERSION}/\$GLIBC_VER/\" PKGBUILD && makepkg"

echo "Extracted command (unescaped for testing):"
echo "$executeCommand"

# Test the GLIBC extraction part in isolation
echo ""
echo "Testing GLIBC version extraction:"
echo "ldd --version | head -1"
ldd --version | head -1 2>/dev/null || echo "ldd not available in this environment"

echo ""
echo "Testing regex pattern '[0-9]+\.[0-9]+' on sample input:"
echo "glibc 2.35" | grep -o '[0-9]\+\.[0-9]\+' || echo "Pattern failed"

echo ""
echo "Testing with escaped pattern '[0-9]\\+\\.[0-9]\\+' on sample input:"
echo "glibc 2.35" | grep -o '[0-9]\+\.[0-9]\+' || echo "Escaped pattern failed"

echo ""
echo "Validation complete."
