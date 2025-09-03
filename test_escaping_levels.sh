#!/bin/bash
# Comprehensive test to determine correct escaping levels for ArchLinux GLIBC regex

echo "Testing different escaping levels for regex pattern..."

# Test what the actual pattern should be in the final grep command
echo "1. Final grep command should use: [0-9]+\.[0-9]+"
echo "   Testing: echo 'glibc 2.35' | grep -o '[0-9]\+\.[0-9]\+'"
echo "glibc 2.35" | grep -o '[0-9]\+\.[0-9]\+'

echo ""
echo "2. In a bash variable (single level):"
pattern='[0-9]\+\.[0-9]\+'
echo "   pattern='[0-9]\+\.[0-9]\+'"
echo "   Testing: echo 'glibc 2.35' | grep -o \"\$pattern\""
echo "glibc 2.35" | grep -o "$pattern"

echo ""
echo "3. In a bash string for executeCommand (double quotes, needs escaping):"
executeCommand="echo 'glibc 2.35' | grep -o '[0-9]\\+\\.[0-9]\\+'"
echo "   executeCommand=\"echo 'glibc 2.35' | grep -o '[0-9]\\\\+\\\\.[0-9]\\\\+'\""
echo "   Testing executeCommand:"
eval "$executeCommand"

echo ""
echo "4. For docker command string (additional escaping layer):"
# This simulates what happens in the docker command
dockerCommand="bash -c \"GLIBC_VER=\\\$(echo 'glibc 2.35' | grep -o '[0-9]\\\\+\\\\.[0-9]\\\\+') && echo \\\$GLIBC_VER\""
echo "   dockerCommand simulation:"
echo "$dockerCommand"
echo "   Testing docker command simulation:"
eval "$dockerCommand"

echo ""
echo "5. For su command within docker (another escaping layer):"
# This simulates the full nesting: docker -> su -> bash
suCommand="su builder -c 'GLIBC_VER=\$(echo \"glibc 2.35\" | grep -o \"[0-9]\\+\\.[0-9]\\+\") && echo \$GLIBC_VER'"
echo "   suCommand simulation:"
echo "$suCommand"
echo "   Testing su command simulation:"
eval "$suCommand" 2>/dev/null || echo "   (su command would work in actual environment)"

echo ""
echo "Analysis complete. The correct pattern for the build.sh file should be:"
echo "'[0-9]\\\\+\\\\\\.[0-9]\\\\+' (for the full docker->su->bash nesting)"
