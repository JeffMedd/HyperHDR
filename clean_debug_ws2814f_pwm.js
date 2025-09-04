// Clean Debug Script for WS2814f PWM swapWB Issue
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

                // Check access level
                if (pwmSchema.properties.swapWB.access) {
                    console.log("✅ swapWB access level:", pwmSchema.properties.swapWB.access);
                } else {
                    console.log("✅ swapWB has no access level - this is correct after our fix");
                }
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
    console.log("conf_editor type:", typeof conf_editor);
    console.log("conf_editor methods:", Object.getOwnPropertyNames(conf_editor).filter(prop => typeof conf_editor[prop] === 'function'));

    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        console.log("Available root editors:", Object.keys(conf_editor.editors || {}));
        return false;
    }

    console.log("✅ specificOptions editor found");
    console.log("specificEditor type:", typeof specificEditor);
    console.log("specificEditor properties:", Object.keys(specificEditor));
    console.log("Available specific editors:", Object.keys(specificEditor.editors || {}));

    // Check if getEditor method exists
    if (typeof specificEditor.getEditor !== 'function') {
        console.error("❌ specificEditor.getEditor is not a function");
        console.log("Available methods:", Object.getOwnPropertyNames(specificEditor).filter(prop => typeof specificEditor[prop] === 'function'));

        // Try alternative access methods
        console.log("Trying alternative access methods...");

        // Try direct access via editors property
        if (specificEditor.editors) {
            const rgbwEditor = specificEditor.editors.rgbw;
            const swapWBEditor = specificEditor.editors.swapWB;

            console.log("Direct access - RGBW editor:", rgbwEditor ? "✅ found" : "❌ not found");
            console.log("Direct access - SwapWB editor:", swapWBEditor ? "✅ found" : "❌ not found");

            if (rgbwEditor) {
                console.log("RGBW value:", rgbwEditor.getValue ? rgbwEditor.getValue() : "getValue method not available");
            }

            if (swapWBEditor) {
                console.log("SwapWB value:", swapWBEditor.getValue ? swapWBEditor.getValue() : "getValue method not available");
                console.log("SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
                console.log("SwapWB container:", swapWBEditor.container);
                console.log("SwapWB container display:", swapWBEditor.container?.style.display);
            } else {
                console.error("❌ SwapWB editor not found even with direct access");
            }
        }

        return false;
    }

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

    return true;
}

// Simplified test function
function simpleSwapWBCheck() {
    console.log("🔍 === SIMPLE SWAPWB CHECK ===");

    // Check device
    const deviceSelect = document.getElementById("leddevices");
    console.log("Device:", deviceSelect?.value);

    // Check if conf_editor exists
    console.log("conf_editor exists:", typeof conf_editor !== 'undefined');

    // Check DOM elements
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    console.log("SwapWB DOM elements found:", swapWBElements.length);

    if (swapWBElements.length > 0) {
        console.log("✅ SwapWB elements exist in DOM");
        swapWBElements.forEach((el, i) => {
            console.log(`Element ${i}:`, {
                visible: el.offsetHeight > 0,
                display: el.style.display,
                path: el.getAttribute('data-schemapath')
            });
        });
    } else {
        console.log("❌ No SwapWB elements found in DOM");
    }

    // Check RGBW elements
    const rgbwElements = document.querySelectorAll('[data-schemapath*="rgbw"]');
    console.log("RGBW DOM elements found:", rgbwElements.length);

    if (rgbwElements.length > 0) {
        rgbwElements.forEach((el, i) => {
            const checkbox = el.querySelector('input[type="checkbox"]');
            console.log(`RGBW ${i}:`, {
                checked: checkbox?.checked,
                visible: el.offsetHeight > 0
            });
        });
    }
}

console.log("🔧 Clean WS2814f PWM Debug Script Loaded!");
console.log("📋 Available functions:");
console.log("  - ultimateWS2814fPWMDebug() - Complete diagnostic analysis");
console.log("  - simpleSwapWBCheck() - Simple check for SwapWB elements");
console.log("");
console.log("💡 Try simpleSwapWBCheck() first for a quick check");
