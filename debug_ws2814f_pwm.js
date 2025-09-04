// Specific debug script for WS2814f PWM dependency issues
// Run this in browser console when on the WS2814f PWM configuration page

function debugWS2814fPWM() {
    console.log("=== WS2814f PWM Dependency Debug ===");

    // 1. Check device selection
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect) {
        console.error("❌ Device selector not found");
        return false;
    }

    console.log("Current device:", deviceSelect.value);

    if (deviceSelect.value !== "ws2814fpwm") {
        console.error("❌ Please select 'ws2814fpwm' first. Current:", deviceSelect.value);
        return false;
    }

    console.log("✅ WS2814f PWM selected");

    // 2. Check schema loading
    if (window.serverSchema && window.serverSchema.properties && window.serverSchema.properties.alldevices) {
        const pwmSchema = window.serverSchema.properties.alldevices["ws2814fpwm"];
        if (pwmSchema) {
            console.log("✅ PWM schema loaded");

            // Check swapWB field in schema
            if (pwmSchema.properties && pwmSchema.properties.swapWB) {
                console.log("✅ SwapWB found in PWM schema");
                console.log("SwapWB schema:", JSON.stringify(pwmSchema.properties.swapWB, null, 2));

                // Check access level
                if (pwmSchema.properties.swapWB.access) {
                    console.log("⚠️ SwapWB has access level:", pwmSchema.properties.swapWB.access);
                } else {
                    console.log("✅ SwapWB has no access restriction");
                }

                // Check dependencies
                if (pwmSchema.properties.swapWB.options && pwmSchema.properties.swapWB.options.dependencies) {
                    console.log("✅ SwapWB dependencies:", pwmSchema.properties.swapWB.options.dependencies);
                } else {
                    console.error("❌ SwapWB dependencies missing");
                }
            } else {
                console.error("❌ SwapWB not found in PWM schema");
            }

            // Check RGBW field
            if (pwmSchema.properties && pwmSchema.properties.rgbw) {
                console.log("✅ RGBW found in PWM schema");
                console.log("RGBW schema:", JSON.stringify(pwmSchema.properties.rgbw, null, 2));
            } else {
                console.error("❌ RGBW not found in PWM schema");
            }
        } else {
            console.error("❌ PWM schema not found");
        }
    } else {
        console.error("❌ Server schema not loaded");
    }

    // 3. Check JSON Editor
    if (typeof conf_editor !== 'undefined' && conf_editor) {
        console.log("✅ conf_editor exists");

        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            console.log("✅ specificOptions editor exists");
            console.log("Available editors:", Object.keys(specificEditor.editors || {}));

            const rgbwEditor = specificEditor.getEditor("rgbw");
            const swapWBEditor = specificEditor.getEditor("swapWB");

            if (rgbwEditor) {
                console.log("✅ RGBW editor exists");
                console.log("RGBW value:", rgbwEditor.getValue());
                console.log("RGBW schema:", JSON.stringify(rgbwEditor.schema, null, 2));
            } else {
                console.error("❌ RGBW editor not found");
            }

            if (swapWBEditor) {
                console.log("✅ SwapWB editor exists");
                console.log("SwapWB value:", swapWBEditor.getValue());
                console.log("SwapWB schema:", JSON.stringify(swapWBEditor.schema, null, 2));
                console.log("SwapWB options:", JSON.stringify(swapWBEditor.options, null, 2));
                console.log("SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
                console.log("SwapWB container display:", swapWBEditor.container ? swapWBEditor.container.style.display : "no container");
                console.log("SwapWB container:", swapWBEditor.container);
            } else {
                console.error("❌ SwapWB editor not found");
            }
        } else {
            console.error("❌ specificOptions editor not found");
        }
    } else {
        console.error("❌ conf_editor not found");
    }

    // 4. Check DOM elements
    console.log("\n--- DOM Check ---");
    const rgbwElements = document.querySelectorAll('[data-schemapath*="rgbw"]');
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');

    console.log("RGBW DOM elements:", rgbwElements.length);
    rgbwElements.forEach((el, i) => {
        console.log(`RGBW ${i}:`, el.getAttribute('data-schemapath'), "checked:", el.querySelector('input')?.checked);
    });

    console.log("SwapWB DOM elements:", swapWBElements.length);
    swapWBElements.forEach((el, i) => {
        console.log(`SwapWB ${i}:`, el.getAttribute('data-schemapath'), "display:", el.style.display, "visible:", el.offsetParent !== null);
    });

    return true;
}

// Function to force dependency fix for PWM
function forceFixPWM() {
    console.log("🔧 Force fixing WS2814f PWM dependencies...");

    if (typeof conf_editor !== 'undefined' && conf_editor) {
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            const rgbwEditor = specificEditor.getEditor("rgbw");
            const swapWBEditor = specificEditor.getEditor("swapWB");

            if (rgbwEditor && swapWBEditor) {
                // Set up manual dependency handling
                const fixDependency = () => {
                    const rgbwValue = rgbwEditor.getValue();
                    const shouldShow = rgbwValue === true;

                    console.log("Fixing dependency: RGBW =", rgbwValue, "-> SwapWB should be", shouldShow ? "visible" : "hidden");

                    // Force editor state
                    swapWBEditor.dependenciesFulfilled = shouldShow;

                    // Force container visibility
                    if (swapWBEditor.container) {
                        swapWBEditor.container.style.display = shouldShow ? 'block' : 'none';
                        console.log("Set container display to:", swapWBEditor.container.style.display);
                    }

                    // Force DOM elements
                    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
                    swapWBElements.forEach(el => {
                        el.style.display = shouldShow ? '' : 'none';
                    });

                    console.log("✅ Dependency fix applied");
                };

                // Set up watcher and initial fix
                try {
                    conf_editor.watch('root.specificOptions.rgbw', fixDependency);
                    fixDependency();
                    console.log("✅ Manual dependency watcher set up");
                } catch (e) {
                    console.error("❌ Failed to set up watcher:", e);
                }

                return true;
            } else {
                console.error("❌ Required editors not found");
                return false;
            }
        }
    }

    console.error("❌ conf_editor not available");
    return false;
}

console.log("WS2814f PWM debug functions loaded!");
console.log("Available functions:");
console.log("- debugWS2814fPWM() - Debug PWM dependency issues");
console.log("- forceFixPWM() - Force fix PWM dependencies");
