// Enhanced debugging script for WS2814f dependency issues
// Run this in browser console on the LED configuration page

function comprehensiveWS2814fDebug() {
    console.log("=== Comprehensive WS2814f Dependency Debug ===");
    
    // 1. Check if correct device is selected
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("❌ ERROR: ws2814fpwm not selected. Current:", deviceSelect ? deviceSelect.value : "no device selector");
        return false;
    }
    console.log("✅ Device selected: ws2814fpwm");
    
    // 2. Check schema loaded correctly
    if (window.serverSchema && window.serverSchema.properties && window.serverSchema.properties.alldevices) {
        const ws2814fSchema = window.serverSchema.properties.alldevices["ws2814fpwm"];
        if (ws2814fSchema) {
            console.log("✅ WS2814f schema loaded");
            
            // Check if swapWB exists in schema with dependencies
            if (ws2814fSchema.properties && ws2814fSchema.properties.swapWB) {
                console.log("✅ swapWB property found in schema");
                console.log("Schema swapWB:", ws2814fSchema.properties.swapWB);
                
                if (ws2814fSchema.properties.swapWB.options && ws2814fSchema.properties.swapWB.options.dependencies) {
                    console.log("✅ Dependencies found in schema");
                    console.log("Dependencies:", ws2814fSchema.properties.swapWB.options.dependencies);
                } else {
                    console.log("❌ No dependencies found in schema");
                }
            } else {
                console.log("❌ swapWB property not found in schema");
            }
            
            // Check if rgbw exists
            if (ws2814fSchema.properties && ws2814fSchema.properties.rgbw) {
                console.log("✅ rgbw property found in schema");
            } else {
                console.log("❌ rgbw property not found in schema");
            }
        } else {
            console.log("❌ WS2814f schema not found");
        }
    } else {
        console.log("❌ serverSchema not loaded");
    }
    
    // 3. Check if JSON editor exists and has correct structure
    if (typeof conf_editor !== 'undefined' && conf_editor) {
        console.log("✅ conf_editor exists");
        
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            console.log("✅ specificOptions editor found");
            
            // List all available editors
            console.log("Available editors in specificOptions:", Object.keys(specificEditor.editors || {}));
            
            const rgbwEditor = specificEditor.getEditor("rgbw");
            if (rgbwEditor) {
                console.log("✅ RGBW editor found");
                console.log("RGBW value:", rgbwEditor.getValue());
            } else {
                console.log("❌ RGBW editor not found");
            }
            
            const swapWBEditor = specificEditor.getEditor("swapWB");
            if (swapWBEditor) {
                console.log("✅ SwapWB editor found");
                console.log("SwapWB value:", swapWBEditor.getValue());
                console.log("SwapWB container:", swapWBEditor.container);
                console.log("SwapWB visible:", swapWBEditor.container ? swapWBEditor.container.style.display !== 'none' : 'no container');
                
                // Check if dependencies evaluation method exists
                if (swapWBEditor.evaluateDependencies) {
                    console.log("✅ evaluateDependencies method exists");
                } else {
                    console.log("❌ evaluateDependencies method not found");
                }
                
                // Check dependency fulfillment
                if (swapWBEditor.dependenciesFulfilled !== undefined) {
                    console.log("Dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
                } else {
                    console.log("No dependenciesFulfilled property");
                }
            } else {
                console.log("❌ SwapWB editor not found");
            }
        } else {
            console.log("❌ specificOptions editor not found");
        }
    } else {
        console.log("❌ conf_editor not found");
    }
    
    // 4. Check DOM elements directly
    console.log("\n--- DOM Element Check ---");
    const rgbwElements = document.querySelectorAll('[data-schemapath*="rgbw"]');
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    
    console.log("RGBW DOM elements found:", rgbwElements.length);
    rgbwElements.forEach((el, i) => {
        console.log(`RGBW element ${i}:`, el.getAttribute('data-schemapath'), el);
    });
    
    console.log("SwapWB DOM elements found:", swapWBElements.length);
    swapWBElements.forEach((el, i) => {
        console.log(`SwapWB element ${i}:`, el.getAttribute('data-schemapath'), el);
        console.log(`SwapWB element ${i} display:`, el.style.display);
    });
    
    return true;
}

// Function to force show swapWB if hidden
function forceShowSwapWB() {
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    swapWBElements.forEach(el => {
        el.style.display = '';
        el.style.visibility = 'visible';
    });
    console.log("Forced swapWB elements to be visible");
}

// Function to test dependency evaluation
function testDependencyEvaluation() {
    if (typeof conf_editor !== 'undefined' && conf_editor) {
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            const rgbwEditor = specificEditor.getEditor("rgbw");
            const swapWBEditor = specificEditor.getEditor("swapWB");
            
            if (rgbwEditor && swapWBEditor) {
                console.log("--- Testing Dependency Evaluation ---");
                
                // Test setting RGBW to true
                console.log("Setting RGBW to true...");
                rgbwEditor.setValue(true);
                
                setTimeout(() => {
                    if (swapWBEditor.evaluateDependencies) {
                        swapWBEditor.evaluateDependencies();
                    }
                    
                    console.log("After setting RGBW to true:");
                    console.log("SwapWB visible:", swapWBEditor.container ? swapWBEditor.container.style.display !== 'none' : 'no container');
                    
                    // Test setting RGBW to false
                    console.log("Setting RGBW to false...");
                    rgbwEditor.setValue(false);
                    
                    setTimeout(() => {
                        if (swapWBEditor.evaluateDependencies) {
                            swapWBEditor.evaluateDependencies();
                        }
                        
                        console.log("After setting RGBW to false:");
                        console.log("SwapWB visible:", swapWBEditor.container ? swapWBEditor.container.style.display !== 'none' : 'no container');
                    }, 100);
                }, 100);
            }
        }
    }
}

console.log("Enhanced WS2814f debug functions loaded!");
console.log("Available functions:");
console.log("- comprehensiveWS2814fDebug() - Complete diagnostic");
console.log("- forceShowSwapWB() - Force show hidden swapWB fields");
console.log("- testDependencyEvaluation() - Test dependency logic");
