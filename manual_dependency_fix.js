// Manual dependency fix for WS2814f swapWB field
// This script manually registers and evaluates dependencies for the swapWB field

function manualDependencyFix() {
    console.log("=== Manual Dependency Fix for WS2814f ===");
    
    // Check if we're on the correct device
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("ERROR: Not on ws2814fpwm device. Current:", deviceSelect ? deviceSelect.value : "no device selector");
        return false;
    }
    
    // Get the JSON editor
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("ERROR: conf_editor not found");
        return false;
    }
    
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("ERROR: specificOptions editor not found");
        return false;
    }
    
    const rgbwEditor = specificEditor.getEditor("rgbw");
    const swapWBEditor = specificEditor.getEditor("swapWB");
    
    if (!rgbwEditor || !swapWBEditor) {
        console.error("ERROR: rgbw or swapWB editor not found");
        console.log("Available editors:", Object.keys(specificEditor.editors || {}));
        return false;
    }
    
    console.log("✅ All editors found");
    console.log("RGBW value:", rgbwEditor.getValue());
    console.log("SwapWB value:", swapWBEditor.getValue());
    console.log("SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
    
    // Manually register dependencies for swapWB if not already done
    if (!swapWBEditor.options || !swapWBEditor.options.dependencies) {
        console.log("⚠️ SwapWB dependencies not properly configured in options");
        return false;
    }
    
    console.log("Dependencies config:", swapWBEditor.options.dependencies);
    
    // Force re-register dependencies
    console.log("🔧 Re-registering dependencies manually...");
    
    // Clear any existing watchers
    if (swapWBEditor.watched) {
        Object.values(swapWBEditor.watched).forEach(watcherPath => {
            if (swapWBEditor.jsoneditor && swapWBEditor.jsoneditor.unwatch) {
                swapWBEditor.jsoneditor.unwatch(watcherPath, swapWBEditor.watch_listener);
            }
        });
    }
    
    // Manually register the dependency watcher
    const rgbwPath = "root.specificOptions.rgbw";
    
    if (swapWBEditor.jsoneditor && swapWBEditor.jsoneditor.watch) {
        console.log("Setting up watcher for:", rgbwPath);
        
        swapWBEditor.jsoneditor.watch(rgbwPath, function() {
            console.log("🔄 Dependency watcher triggered for swapWB");
            swapWBEditor.evaluateDependencies();
        });
        
        // Force initial evaluation
        console.log("🔄 Forcing initial dependency evaluation...");
        swapWBEditor.evaluateDependencies();
        
        console.log("After evaluation:");
        console.log("Dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
        console.log("Container display:", swapWBEditor.container ? swapWBEditor.container.style.display : "no container");
        
        // Test the dependency by toggling RGBW
        console.log("🧪 Testing dependency by toggling RGBW...");
        const currentRgbwValue = rgbwEditor.getValue();
        
        // Toggle to opposite value
        rgbwEditor.setValue(!currentRgbwValue);
        setTimeout(() => {
            console.log("After setting RGBW to", !currentRgbwValue);
            console.log("SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
            console.log("SwapWB container display:", swapWBEditor.container ? swapWBEditor.container.style.display : "no container");
            
            // Toggle back
            rgbwEditor.setValue(currentRgbwValue);
            setTimeout(() => {
                console.log("After setting RGBW back to", currentRgbwValue);
                console.log("SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
                console.log("SwapWB container display:", swapWBEditor.container ? swapWBEditor.container.style.display : "no container");
            }, 100);
        }, 100);
        
        return true;
    } else {
        console.error("ERROR: jsoneditor.watch method not available");
        return false;
    }
}

// Function to force show swapWB regardless of dependencies
function forceShowSwapWB() {
    console.log("🔧 Force showing swapWB field...");
    
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    swapWBElements.forEach(el => {
        el.style.display = '';
        el.style.visibility = 'visible';
        console.log("Made visible:", el.getAttribute('data-schemapath'));
    });
    
    // Also try to force the editor state
    if (typeof conf_editor !== 'undefined' && conf_editor) {
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            const swapWBEditor = specificEditor.getEditor("swapWB");
            if (swapWBEditor) {
                // Force dependencies to be fulfilled
                swapWBEditor.dependenciesFulfilled = true;
                
                // Force container to be visible
                if (swapWBEditor.container) {
                    swapWBEditor.container.style.display = 'block';
                }
                
                console.log("✅ Forced swapWB editor to be visible");
            }
        }
    }
}

console.log("Manual dependency fix functions loaded!");
console.log("Available functions:");
console.log("- manualDependencyFix() - Manually register and test dependencies");
console.log("- forceShowSwapWB() - Force show swapWB field regardless of dependencies");
