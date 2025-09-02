#!/usr/bin/env python3

"""
CMake Validation Script for zstd INTERFACE_LIBRARY Fix

This script validates that our fix for the zstd POSITION_INDEPENDENT_CODE
error on INTERFACE_LIBRARY targets is correct.
"""

import os
import re

def validate_cmake_fix():
    """Validate that the CMake fix is applied correctly."""
    
    # Path to the external CMakeLists.txt file
    cmake_file = "d:/Documents/projects/HyperHDR/external/CMakeLists.txt"
    
    if not os.path.exists(cmake_file):
        print(f"❌ ERROR: CMakeLists.txt not found at {cmake_file}")
        return False
    
    # Read the file content
    with open(cmake_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check that the problematic line is removed
    problematic_pattern = r'set_property\s*\(\s*TARGET\s+libzstd\s+PROPERTY\s+POSITION_INDEPENDENT_CODE\s+ON\s*\)'
    
    if re.search(problematic_pattern, content, re.IGNORECASE):
        print("❌ ERROR: Found problematic POSITION_INDEPENDENT_CODE line for libzstd INTERFACE target")
        print("   This line should be removed as INTERFACE libraries cannot have this property.")
        return False
    
    # Check that the zstd configuration section exists and looks correct
    zstd_section_pattern = r'set\s*\(\s*ZSTD_BUILD_PROGRAMS\s+OFF\s*\).*?add_subdirectory.*?zstd.*?set_target_properties.*?libzstd.*?add_library.*?zstd::zstd'
    
    if not re.search(zstd_section_pattern, content, re.DOTALL | re.IGNORECASE):
        print("❌ ERROR: zstd configuration section not found or malformed")
        return False
    
    print("✅ SUCCESS: CMake fix validated successfully!")
    print("   - Problematic POSITION_INDEPENDENT_CODE line removed")
    print("   - zstd configuration section present and correct")
    print("   - libzstd INTERFACE target should now work properly")
    
    return True

def check_zstd_cmake_structure():
    """Check the zstd library's own CMakeLists.txt structure."""
    
    zstd_cmake = "d:/Documents/projects/HyperHDR/external/zstd/build/cmake/lib/CMakeLists.txt"
    
    if not os.path.exists(zstd_cmake):
        print(f"⚠️  WARNING: zstd CMakeLists.txt not found at {zstd_cmake}")
        return False
    
    with open(zstd_cmake, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check that zstd properly handles POSITION_INDEPENDENT_CODE for static library
    static_pic_pattern = r'set_target_properties\s*\(\s*libzstd_static.*?POSITION_INDEPENDENT_CODE\s+On'
    
    if re.search(static_pic_pattern, content, re.DOTALL | re.IGNORECASE):
        print("✅ zstd library correctly sets POSITION_INDEPENDENT_CODE on static target")
    else:
        print("⚠️  WARNING: Could not verify POSITION_INDEPENDENT_CODE setting in zstd static library")
    
    # Check for INTERFACE library creation
    interface_pattern = r'add_library\s*\(\s*libzstd\s+INTERFACE\s*\)'
    
    if re.search(interface_pattern, content, re.IGNORECASE):
        print("✅ zstd library correctly creates INTERFACE libzstd target")
        return True
    else:
        print("⚠️  WARNING: Could not find INTERFACE libzstd target creation")
        return False

if __name__ == "__main__":
    print("🔍 Validating CMake fix for zstd INTERFACE_LIBRARY POSITION_INDEPENDENT_CODE error...")
    print("=" * 80)
    
    success = validate_cmake_fix()
    
    print("\n🔍 Checking zstd library structure...")
    print("-" * 50)
    check_zstd_cmake_structure()
    
    print("\n" + "=" * 80)
    if success:
        print("🎉 CMAKE FIX VALIDATION: PASSED")
        print("   The build should now proceed past the zstd configuration error.")
        print("   Next step: Test with GitHub Actions or local build environment.")
    else:
        print("❌ CMAKE FIX VALIDATION: FAILED") 
        print("   Please review and fix the issues above.")
    
    print("=" * 80)
