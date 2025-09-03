// Test script for WS2814f "Invert W & B" checkbox functionality
// Instructions: 
// 1. Open HyperHDR web UI and go to LED Hardware configuration
// 2. Select "ws2814fpwm" from the LED controller dropdown
// 3. Open browser developer console (F12)
// 4. Paste this script and run it
// 5. Follow the test instructions that will be logged to console

function testWS2814fSwapWBCheckbox() {
    console.log("=== WS2814f SwapWB Checkbox Test ===");
    
    // Check if we're on the right page and have the right device selected
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("ERROR: Please select 'ws2814fpwm' from the LED device dropdown first!");
        return false;
    }
    
    // Check if conf_editor exists
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("ERROR: conf_editor not found. Make sure the LED device is selected.");
        return false;
    }
    
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("ERROR: specificOptions editor not found.");
        return false;
    }
    
    const rgbwEditor = specificEditor.getEditor("rgbw");
    const swapWBEditor = specificEditor.getEditor("swapWB");
    
    if (!rgbwEditor) {
        console.error("ERROR: RGBW editor not found.");
        return false;
    }
    
    console.log("✓ Found RGBW editor");
    
    if (!swapWBEditor) {
        console.error("ERROR: SwapWB editor not found. This indicates the schema is not loaded correctly.");
        return false;
    }
    
    console.log("✓ Found SwapWB editor");
    
    // Test the dependency functionality
    console.log("\n--- Testing Dependency Functionality ---");
    
    // Function to check visibility
    const checkSwapWBVisibility = () => {
        const container = swapWBEditor.container;
        const isVisible = container && container.style.display !== 'none';
        const rgbwValue = rgbwEditor.getValue();
        
        console.log(`RGBW value: ${rgbwValue}`);
        console.log(`SwapWB container display: ${container ? container.style.display : 'no container'}`);
        console.log(`SwapWB visible: ${isVisible}`);
        console.log(`SwapWB dependencies fulfilled: ${swapWBEditor.dependenciesFulfilled}`);
        
        return isVisible;
    };
    
    // Initial state
    console.log("\n1. Initial state:");
    const initialVisible = checkSwapWBVisibility();
    
    // Test: Set RGBW to true
    console.log("\n2. Setting RGBW to true:");
    rgbwEditor.setValue(true);
    
    // Force dependency evaluation
    setTimeout(() => {
        swapWBEditor.evaluateDependencies();
        const visibleAfterTrue = checkSwapWBVisibility();
        
        if (visibleAfterTrue) {
            console.log("✓ SUCCESS: SwapWB checkbox is visible when RGBW is enabled!");
        } else {
            console.log("✗ FAILED: SwapWB checkbox is not visible when RGBW is enabled");
        }
        
        // Test: Set RGBW to false
        console.log("\n3. Setting RGBW to false:");
        rgbwEditor.setValue(false);
        
        setTimeout(() => {
            swapWBEditor.evaluateDependencies();
            const visibleAfterFalse = checkSwapWBVisibility();
            
            if (!visibleAfterFalse) {
                console.log("✓ SUCCESS: SwapWB checkbox is hidden when RGBW is disabled!");
            } else {
                console.log("✗ FAILED: SwapWB checkbox is still visible when RGBW is disabled");
            }
            
            // Reset to original state
            console.log("\n4. Resetting to original state:");
            rgbwEditor.setValue(initialVisible);
            setTimeout(() => {
                swapWBEditor.evaluateDependencies();
                console.log("\n=== Test Complete ===");
                console.log("If you see SUCCESS messages above, the fix is working correctly!");
                console.log("If you see FAILED messages, there may still be an issue to debug.");
            }, 100);
        }, 100);
    }, 100);
    
    return true;
}

// Also provide a manual test function
function manualTestInstructions() {
    console.log("\n=== Manual Test Instructions ===");
    console.log("1. Make sure 'ws2814fpwm' is selected in the LED device dropdown");
    console.log("2. Look for the 'Use RGBW protocol' checkbox");
    console.log("3. Check/uncheck the RGBW checkbox");
    console.log("4. The 'Invert W & B' checkbox should appear when RGBW is checked");
    console.log("5. The 'Invert W & B' checkbox should disappear when RGBW is unchecked");
    console.log("\nIf this works correctly, the fix has been successful!");
}

console.log("WS2814f test functions loaded!");
console.log("Run testWS2814fSwapWBCheckbox() for automated test");
console.log("Run manualTestInstructions() for manual test steps");
