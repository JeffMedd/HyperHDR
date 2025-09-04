// Debug script to check WS2814f dependency handling
// This can be run in browser console when on the LED configuration page

function debugWS2814fDependencies() {
    console.log("=== WS2814f Dependency Debug ===");

    // Check if serverSchema exists and has the WS2814f schema
    if (window.serverSchema && window.serverSchema.properties && window.serverSchema.properties.alldevices) {
        const ws2814fSchema = window.serverSchema.properties.alldevices["ws2814fpwm"];
        if (ws2814fSchema) {
            console.log("WS2814f Schema found:", ws2814fSchema);

            // Check if swapWB property exists and has dependencies
            if (ws2814fSchema.properties && ws2814fSchema.properties.swapWB) {
                console.log("swapWB property:", ws2814fSchema.properties.swapWB);
                console.log("swapWB dependencies:", ws2814fSchema.properties.swapWB.dependencies);
            } else {
                console.log("ERROR: swapWB property not found in schema");
            }

            // Check if rgbw property exists
            if (ws2814fSchema.properties && ws2814fSchema.properties.rgbw) {
                console.log("rgbw property:", ws2814fSchema.properties.rgbw);
            } else {
                console.log("ERROR: rgbw property not found in schema");
            }
        } else {
            console.log("ERROR: WS2814f schema not found in alldevices");
            console.log("Available devices:", Object.keys(window.serverSchema.properties.alldevices));
        }
    } else {
        console.log("ERROR: serverSchema not properly initialized");
    }

    // Check if conf_editor exists and has been created
    if (typeof conf_editor !== 'undefined' && conf_editor) {
        console.log("JSON Editor exists:", conf_editor);

        // Try to get the specificOptions editor
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            console.log("Specific options editor found:", specificEditor);

            // Check for rgbw and swapWB editors
            const rgbwEditor = specificEditor.getEditor("rgbw");
            const swapWBEditor = specificEditor.getEditor("swapWB");

            console.log("RGBW editor:", rgbwEditor);
            console.log("SwapWB editor:", swapWBEditor);

            if (rgbwEditor) {
                console.log("RGBW value:", rgbwEditor.getValue());
            }

            if (swapWBEditor) {
                console.log("SwapWB value:", swapWBEditor.getValue());
                console.log("SwapWB container display:", swapWBEditor.container ? swapWBEditor.container.style.display : "no container");
                console.log("SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
            } else {
                console.log("SwapWB editor not found - this is the problem!");
            }
        } else {
            console.log("ERROR: specificOptions editor not found");
        }
    } else {
        console.log("ERROR: conf_editor not initialized");
    }
}

// Also create a function to force re-evaluation of dependencies
function forceWS2814fDependencyEvaluation() {
    if (typeof conf_editor !== 'undefined' && conf_editor) {
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            const swapWBEditor = specificEditor.getEditor("swapWB");
            if (swapWBEditor && swapWBEditor.evaluateDependencies) {
                console.log("Forcing dependency re-evaluation...");
                swapWBEditor.evaluateDependencies();
                console.log("SwapWB container display after re-evaluation:",
                           swapWBEditor.container ? swapWBEditor.container.style.display : "no container");
            }
        }
    }
}

console.log("WS2814f debug functions loaded. Use debugWS2814fDependencies() and forceWS2814fDependencyEvaluation()");
