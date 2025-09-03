// Enhanced Debug Script for            // Check swapWB in schema
            if (pwmSchema.properties && pwmSchema.properties.swapWB) {
                console.log("✅ swapWB found in PWM schema");
                console.log("swapWB schema:", JSON.stringify(pwmSchema.properties.swapWB, null, 2));
                
                // Check access level
                if (pwmSchema.properties.swapWB.access) {
                    console.log("✅ swapWB access level:", pwmSchema.properties.swapWB.access);
                } else {
                    console.log("⚠️ swapWB has no access level - this might cause filtering issues");
                }
            } else {
                console.error("❌ swapWB NOT found in schema");
                console.log("Available properties:", Object.keys(pwmSchema.properties || {}));
            } PWM swapWB Issue
// Run this in browser console when on the LED Hardware configuration page with WS2814f PWM selected

function ultimateWS2814fPWMDebug() {
    console.log("🔍 === ULTIMATE WS2814f PWM SWAPWB DEBUG ===");
    
    // 1. Check device selection
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect) {
        console.error("❌ Device selector not found");
        return false;
    }
    
    console.log("📍 Current device:", deviceSelect.value);
    
    if (deviceSelect.value !== "ws2814fpwm") {
        console.error("❌ Please select 'ws2814fpwm' first. Current:", deviceSelect.value);
        return false;
    }
    
    // 2. Check schema loading
    console.log("\n🔍 --- SCHEMA CHECK ---");
    if (window.serverSchema && window.serverSchema.properties && window.serverSchema.properties.alldevices) {
        const pwmSchema = window.serverSchema.properties.alldevices["ws2814fpwm"];
        if (pwmSchema) {
            console.log("✅ WS2814f PWM schema loaded");
            console.log("Schema properties:", Object.keys(pwmSchema.properties || {}));
            
            // Check swapWB in schema
            if (pwmSchema.properties && pwmSchema.properties.swapWB) {
                console.log("✅ swapWB found in schema");
                console.log("swapWB schema:", JSON.stringify(pwmSchema.properties.swapWB, null, 2));
            } else {
                console.error("❌ swapWB NOT found in schema");
                console.log("Available properties:", Object.keys(pwmSchema.properties || {}));
            }
        } else {
            console.error("❌ WS2814f PWM schema not found");
            console.log("Available devices:", Object.keys(window.serverSchema.properties.alldevices || {}));
        }
    } else {
        console.error("❌ serverSchema not loaded properly");
    }
    
    // 3. Check JSON Editor
    console.log("\n🔍 --- JSON EDITOR CHECK ---");
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("❌ conf_editor not found");
        return false;
    }
    
    console.log("✅ conf_editor exists");
    
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        return false;
    }
    
    console.log("✅ specificOptions editor found");
    console.log("Available specific editors:", Object.keys(specificEditor.editors || {}));
    
    const rgbwEditor = specificEditor.getEditor("rgbw");
    const swapWBEditor = specificEditor.getEditor("swapWB");
    
    if (!rgbwEditor) {
        console.error("❌ rgbw editor not found");
        return false;
    }
    
    console.log("✅ RGBW editor found");
    console.log("RGBW value:", rgbwEditor.getValue());
    
    if (!swapWBEditor) {
        console.error("❌ swapWB editor not found - THIS IS THE ROOT CAUSE!");
        
        // Check if the field exists in the schema used by the editor
        console.log("\n🔍 --- EDITOR SCHEMA INVESTIGATION ---");
        const editorSchema = specificEditor.schema;
        if (editorSchema && editorSchema.properties) {
            console.log("Editor schema properties:", Object.keys(editorSchema.properties));
            if (editorSchema.properties.swapWB) {
                console.log("✅ swapWB exists in editor schema");
                console.log("Editor swapWB:", JSON.stringify(editorSchema.properties.swapWB, null, 2));
            } else {
                console.error("❌ swapWB missing from editor schema");
            }
        }
        
        return false;
    }
    
    console.log("✅ swapWB editor found");
    console.log("swapWB value:", swapWBEditor.getValue());
    console.log("swapWB options:", swapWBEditor.options);
    console.log("swapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
    console.log("swapWB container:", swapWBEditor.container);
    console.log("swapWB container display:", swapWBEditor.container?.style.display);
    
    // 4. Check DOM elements
    console.log("\n🔍 --- DOM ELEMENTS CHECK ---");
    const rgbwElements = document.querySelectorAll('[data-schemapath*="rgbw"]');
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    
    console.log("RGBW DOM elements:", rgbwElements.length);
    rgbwElements.forEach((el, i) => {
        console.log(`RGBW ${i}:`, {
            path: el.getAttribute('data-schemapath'),
            checked: el.querySelector('input')?.checked,
            visible: el.offsetHeight > 0
        });
    });
    
    console.log("SwapWB DOM elements:", swapWBElements.length);
    swapWBElements.forEach((el, i) => {
        console.log(`SwapWB ${i}:`, {
            path: el.getAttribute('data-schemapath'),
            display: el.style.display,
            visibility: el.style.visibility,
            offsetHeight: el.offsetHeight,
            visible: el.offsetHeight > 0
        });
    });
    
    // 5. Test dependency evaluation
    console.log("\n🔍 --- DEPENDENCY TEST ---");
    
    function testDependency(testRgbwValue) {
        console.log(`\n🧪 Testing with RGBW=${testRgbwValue}:`);
        rgbwEditor.setValue(testRgbwValue);
        
        setTimeout(() => {
            // Force dependency evaluation
            if (swapWBEditor.evaluateDependencies) {
                swapWBEditor.evaluateDependencies();
            }
            
            console.log("  Dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
            console.log("  Container display:", swapWBEditor.container?.style.display);
            console.log("  Container visible:", swapWBEditor.container?.offsetHeight > 0);
            
            // Check DOM elements
            const elements = document.querySelectorAll('[data-schemapath*="swapWB"]');
            elements.forEach((el, i) => {
                console.log(`  DOM element ${i} visible:`, el.offsetHeight > 0);
            });
        }, 100);
    }
    
    // Test with both values
    const originalRgbw = rgbwEditor.getValue();
    testDependency(true);
    
    setTimeout(() => {
        testDependency(false);
        
        setTimeout(() => {
            // Restore original value
            rgbwEditor.setValue(originalRgbw);
            console.log("\n✅ Restored original RGBW value:", originalRgbw);
        }, 200);
    }, 200);
    
    return true;
}

// Function to force create swapWB if missing
function forceCreateSwapWB() {
    console.log("🔧 === FORCE CREATE SWAPWB ===");
    
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("❌ conf_editor not available");
        return false;
    }
    
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        return false;
    }
    
    // Check if swapWB already exists
    const swapWBEditor = specificEditor.getEditor("swapWB");
    if (swapWBEditor) {
        console.log("✅ swapWB already exists");
        
        // Force it to be visible
        swapWBEditor.dependenciesFulfilled = true;
        if (swapWBEditor.container) {
            swapWBEditor.container.style.display = 'block';
            swapWBEditor.container.style.visibility = 'visible';
        }
        
        // Force DOM elements visible
        const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
        swapWBElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = 'visible';
        });
        
        console.log("✅ Forced swapWB to be visible");
        return true;
    }
    
    console.error("❌ swapWB editor not found - cannot force create");
    
    // Try to recreate the entire editor with corrected schema
    console.log("🔧 Attempting to recreate editor with swapWB...");
    
    // Get current device
    const deviceSelect = document.getElementById("leddevices");
    if (deviceSelect && deviceSelect.value === "ws2814fpwm") {
        // Trigger device change to recreate editor
        $(deviceSelect).trigger('change');
        console.log("✅ Triggered device change to recreate editor");
        
        setTimeout(() => {
            const newSwapWBEditor = conf_editor.getEditor("root.specificOptions.swapWB");
            if (newSwapWBEditor) {
                console.log("✅ swapWB editor created after recreation");
            } else {
                console.error("❌ swapWB editor still missing after recreation");
            }
        }, 1000);
    }
    
    return false;
}

console.log("🔧 WS2814f PWM Ultimate Debug Script Loaded!");
console.log("📋 Available functions:");
console.log("  - ultimateWS2814fPWMDebug() - Complete diagnostic analysis");
console.log("  - forceCreateSwapWB() - Force create/show swapWB field");
console.log("");
console.log("💡 Run ultimateWS2814fPWMDebug() first to diagnose the issue");
