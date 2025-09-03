// Deep schema analysis for dependency issues
// This script analyzes the schema structure and JSON editor initialization

function deepSchemaAnalysis() {
    console.log("=== Deep Schema Analysis ===");
    
    // 1. Check device selection
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("ERROR: Not on ws2814fpwm device");
        return false;
    }
    
    console.log("✅ Device: ws2814fpwm");
    
    // 2. Check raw schema
    if (window.serverSchema && window.serverSchema.properties && window.serverSchema.properties.alldevices) {
        const ws2814fSchema = window.serverSchema.properties.alldevices["ws2814fpwm"];
        if (ws2814fSchema && ws2814fSchema.properties) {
            console.log("✅ Raw schema loaded");
            
            // Check rgbw field
            if (ws2814fSchema.properties.rgbw) {
                console.log("✅ RGBW field found in schema");
                console.log("RGBW schema:", JSON.stringify(ws2814fSchema.properties.rgbw, null, 2));
            } else {
                console.error("❌ RGBW field not found in schema");
            }
            
            // Check swapWB field  
            if (ws2814fSchema.properties.swapWB) {
                console.log("✅ SwapWB field found in schema");
                console.log("SwapWB schema:", JSON.stringify(ws2814fSchema.properties.swapWB, null, 2));
                
                // Check dependencies specifically
                if (ws2814fSchema.properties.swapWB.options && ws2814fSchema.properties.swapWB.options.dependencies) {
                    console.log("✅ SwapWB dependencies found in schema");
                    console.log("Dependencies:", ws2814fSchema.properties.swapWB.options.dependencies);
                } else {
                    console.error("❌ SwapWB dependencies not found in schema");
                }
            } else {
                console.error("❌ SwapWB field not found in schema");
            }
        }
    }
    
    // 3. Check JSON editor initialization
    if (typeof conf_editor !== 'undefined' && conf_editor) {
        console.log("✅ conf_editor exists");
        
        // Check root schema passed to editor
        if (conf_editor.schema && conf_editor.schema.properties) {
            console.log("Editor schema properties:", Object.keys(conf_editor.schema.properties));
            
            if (conf_editor.schema.properties.specificOptions) {
                console.log("✅ specificOptions found in editor schema");
                console.log("specificOptions schema:", JSON.stringify(conf_editor.schema.properties.specificOptions, null, 2));
            }
        }
        
        // Check editor structure
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            console.log("✅ specificOptions editor exists");
            console.log("Available sub-editors:", Object.keys(specificEditor.editors || {}));
            
            // Check individual editors
            const rgbwEditor = specificEditor.getEditor("rgbw");
            const swapWBEditor = specificEditor.getEditor("swapWB");
            
            if (rgbwEditor) {
                console.log("✅ RGBW editor exists");
                console.log("RGBW editor schema:", JSON.stringify(rgbwEditor.schema, null, 2));
                console.log("RGBW editor options:", JSON.stringify(rgbwEditor.options, null, 2));
            }
            
            if (swapWBEditor) {
                console.log("✅ SwapWB editor exists");
                console.log("SwapWB editor schema:", JSON.stringify(swapWBEditor.schema, null, 2));
                console.log("SwapWB editor options:", JSON.stringify(swapWBEditor.options, null, 2));
                
                // Check if dependencies were registered
                if (swapWBEditor.options && swapWBEditor.options.dependencies) {
                    console.log("✅ SwapWB has dependencies in options");
                    console.log("Dependencies:", swapWBEditor.options.dependencies);
                    
                    // Check if dependency watchers are set up
                    console.log("SwapWB watched fields:", swapWBEditor.watched);
                    console.log("SwapWB dependenciesFulfilled:", swapWBEditor.dependenciesFulfilled);
                } else {
                    console.error("❌ SwapWB has no dependencies in options");
                }
            }
        }
    }
    
    // 4. Check DOM structure
    console.log("\n--- DOM Analysis ---");
    const rgbwElements = document.querySelectorAll('[data-schemapath*="rgbw"]');
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    
    console.log("RGBW DOM elements:", rgbwElements.length);
    rgbwElements.forEach((el, i) => {
        console.log(`RGBW ${i}:`, el.getAttribute('data-schemapath'), "visible:", el.style.display !== 'none');
    });
    
    console.log("SwapWB DOM elements:", swapWBElements.length);
    swapWBElements.forEach((el, i) => {
        console.log(`SwapWB ${i}:`, el.getAttribute('data-schemapath'), "display:", el.style.display, "visible:", el.style.display !== 'none');
    });
    
    return true;
}

// Function to compare with working Philips Hue dependencies
function compareWithWorkingDevice() {
    console.log("=== Comparing with Philips Hue Dependencies ===");
    
    // Check if Philips Hue schema has working dependencies
    if (window.serverSchema && window.serverSchema.properties && window.serverSchema.properties.alldevices) {
        const hueSchema = window.serverSchema.properties.alldevices["philipshue"];
        if (hueSchema && hueSchema.properties) {
            console.log("Found Philips Hue schema");
            
            // Find a field with dependencies
            Object.keys(hueSchema.properties).forEach(fieldName => {
                const field = hueSchema.properties[fieldName];
                if (field.options && field.options.dependencies) {
                    console.log(`Hue field "${fieldName}" has dependencies:`, field.options.dependencies);
                }
            });
        }
    }
}

console.log("Deep schema analysis functions loaded!");
console.log("Available functions:");
console.log("- deepSchemaAnalysis() - Analyze schema and editor structure");
console.log("- compareWithWorkingDevice() - Compare with working Philips Hue dependencies");
