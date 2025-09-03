// Final test script for WS2814f PWM swapWB access level fix
// Run this in browser console after selecting WS2814f PWM device

function finalTestAccessFix() {
    console.log("🔍 === FINAL ACCESS LEVEL FIX TEST ===");
    
    // 1. Check device selection
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("❌ Please select 'ws2814fpwm' device first");
        return false;
    }
    
    console.log("✅ Device: ws2814fpwm");
    
    // 2. Check schema access levels
    if (window.serverSchema && window.serverSchema.properties && window.serverSchema.properties.alldevices) {
        const pwmSchema = window.serverSchema.properties.alldevices["ws2814fpwm"];
        if (pwmSchema && pwmSchema.properties) {
            console.log("\n🔍 Schema Access Levels:");
            
            const rgbwSchema = pwmSchema.properties.rgbw;
            const swapWBSchema = pwmSchema.properties.swapWB;
            
            console.log("RGBW access:", rgbwSchema?.access || "none");
            console.log("SwapWB access:", swapWBSchema?.access || "none");
            
            if (!rgbwSchema?.access && !swapWBSchema?.access) {
                console.log("✅ Both fields have no access restrictions");
            } else {
                console.log("⚠️ Still have access restrictions");
            }
        }
    }
    
    // 3. Check JSON Editor
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("❌ conf_editor not found");
        return false;
    }
    
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        return false;
    }
    
    const rgbwEditor = specificEditor.getEditor("rgbw");
    const swapWBEditor = specificEditor.getEditor("swapWB");
    
    if (!rgbwEditor) {
        console.error("❌ RGBW editor not found");
        return false;
    }
    
    if (!swapWBEditor) {
        console.error("❌ SwapWB editor still not found!");
        console.log("Available editors:", Object.keys(specificEditor.editors || {}));
        return false;
    }
    
    console.log("✅ Both RGBW and SwapWB editors found!");
    
    // 4. Test dependency behavior
    console.log("\n🧪 Testing dependency behavior...");
    
    const originalRgbw = rgbwEditor.getValue();
    console.log("Original RGBW value:", originalRgbw);
    
    function testDependency(testValue) {
        console.log(`\n📍 Testing RGBW = ${testValue}:`);
        rgbwEditor.setValue(testValue);
        
        // Force evaluation
        if (swapWBEditor.evaluateDependencies) {
            swapWBEditor.evaluateDependencies();
        }
        
        const shouldShow = testValue === true;
        const dependencyFulfilled = swapWBEditor.dependenciesFulfilled;
        const containerVisible = swapWBEditor.container?.style.display !== 'none';
        const domVisible = swapWBEditor.container?.offsetHeight > 0;
        
        console.log("  Expected visible:", shouldShow);
        console.log("  Dependencies fulfilled:", dependencyFulfilled);
        console.log("  Container display:", swapWBEditor.container?.style.display || "undefined");
        console.log("  Actually visible:", domVisible);
        
        if (shouldShow === dependencyFulfilled && shouldShow === domVisible) {
            console.log("  ✅ WORKING CORRECTLY");
            return true;
        } else {
            console.log("  ❌ NOT WORKING");
            return false;
        }
    }
    
    // Test with both values
    const test1 = testDependency(true);
    setTimeout(() => {
        const test2 = testDependency(false);
        
        setTimeout(() => {
            // Restore original
            rgbwEditor.setValue(originalRgbw);
            if (swapWBEditor.evaluateDependencies) {
                swapWBEditor.evaluateDependencies();
            }
            
            console.log("\n🏁 === FINAL RESULT ===");
            if (test1 && test2) {
                console.log("🎉 SUCCESS! SwapWB dependency is working correctly!");
            } else {
                console.log("❌ FAILED: SwapWB dependency still not working");
            }
        }, 200);
    }, 200);
    
    return true;
}

console.log("🔧 Final Access Fix Test Script Loaded!");
console.log("📋 Run finalTestAccessFix() to test the fix");
