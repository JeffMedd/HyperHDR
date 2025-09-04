// Debug script specifically for WS2814f PWM swapWB issue
// Run this in browser console when on the LED Hardware configuration page

function debugPWMSwapWB() {
    console.log("=== Debug WS2814f PWM swapWB Issue ===");

    // Check current device
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect) {
        console.error("❌ Device selector not found");
        return;
    }

    console.log("📍 Current device:", deviceSelect.value);

    if (deviceSelect.value !== "ws2814fpwm") {
        console.warn("⚠️ Not on ws2814fpwm device. Please select WS2814f PWM first.");
        return;
    }

    // Check if conf_editor exists
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("❌ conf_editor not found");
        return;
    }

    // Get editors
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        return;
    }

    console.log("🔍 Available specific options:", Object.keys(specificEditor.editors || {}));

    const rgbwEditor = specificEditor.getEditor("rgbw");
    const swapWBEditor = specificEditor.getEditor("swapWB");

    if (!rgbwEditor) {
        console.error("❌ rgbw editor not found");
        return;
    }

    if (!swapWBEditor) {
        console.error("❌ swapWB editor not found");
        console.log("🔍 This is the main issue - swapWB editor is missing!");

        // Check if it exists in the schema
        console.log("🔍 Checking schema...");
        const schema = specificEditor.schema;
        if (schema && schema.properties && schema.properties.swapWB) {
            console.log("✅ swapWB exists in schema:", schema.properties.swapWB);
        } else {
            console.error("❌ swapWB missing from schema");
        }
        return;
    }

    console.log("✅ Both editors found");
    console.log("📊 RGBW value:", rgbwEditor.getValue());
    console.log("📊 SwapWB value:", swapWBEditor.getValue());
    console.log("📊 SwapWB options:", swapWBEditor.options);
    console.log("📊 SwapWB dependencies:", swapWBEditor.options?.dependencies);
    console.log("📊 SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
    console.log("📊 SwapWB container display:", swapWBEditor.container?.style.display);
    console.log("📊 SwapWB container visible:", swapWBEditor.container?.offsetHeight > 0);

    // Check DOM elements
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    console.log("🔍 SwapWB DOM elements found:", swapWBElements.length);
    swapWBElements.forEach((el, i) => {
        console.log(`  Element ${i}:`, {
            path: el.getAttribute('data-schemapath'),
            display: el.style.display,
            visible: el.offsetHeight > 0,
            classes: el.className
        });
    });

    return {
        rgbwEditor,
        swapWBEditor,
        rgbwValue: rgbwEditor.getValue(),
        swapWBValue: swapWBEditor.getValue(),
        dependenciesFulfilled: swapWBEditor.dependenciesFulfilled,
        containerVisible: swapWBEditor.container?.offsetHeight > 0
    };
}

function forceShowPWMSwapWB() {
    console.log("🔧 Force showing PWM swapWB...");

    const result = debugPWMSwapWB();
    if (!result || !result.swapWBEditor) {
        console.error("❌ Cannot force show - swapWB editor not found");
        return false;
    }

    const { swapWBEditor } = result;

    // Force dependencies fulfilled
    swapWBEditor.dependenciesFulfilled = true;

    // Force container visible
    if (swapWBEditor.container) {
        swapWBEditor.container.style.display = 'block';
        swapWBEditor.container.style.visibility = 'visible';
    }

    // Force all DOM elements visible
    const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
    swapWBElements.forEach(el => {
        el.style.display = '';
        el.style.visibility = 'visible';
    });

    console.log("✅ Forced swapWB to be visible");
    return true;
}

function testPWMDependency() {
    console.log("🧪 Testing PWM RGBW dependency...");

    const result = debugPWMSwapWB();
    if (!result) return false;

    const { rgbwEditor, swapWBEditor } = result;
    const originalValue = rgbwEditor.getValue();

    console.log("📍 Original RGBW value:", originalValue);

    // Test enabling RGBW
    console.log("🔄 Setting RGBW to true...");
    rgbwEditor.setValue(true);

    setTimeout(() => {
        console.log("📊 After setting RGBW=true:");
        console.log("  - Dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
        console.log("  - Container display:", swapWBEditor.container?.style.display);
        console.log("  - Container visible:", swapWBEditor.container?.offsetHeight > 0);

        // Force evaluation
        if (swapWBEditor.evaluateDependencies) {
            swapWBEditor.evaluateDependencies();
            console.log("  - After forced evaluation:", swapWBEditor.dependenciesFulfilled);
        }

        // Test disabling RGBW
        console.log("🔄 Setting RGBW to false...");
        rgbwEditor.setValue(false);

        setTimeout(() => {
            console.log("📊 After setting RGBW=false:");
            console.log("  - Dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
            console.log("  - Container display:", swapWBEditor.container?.style.display);
            console.log("  - Container visible:", swapWBEditor.container?.offsetHeight > 0);

            // Restore original value
            rgbwEditor.setValue(originalValue);
            console.log("🔄 Restored original RGBW value:", originalValue);
        }, 200);
    }, 200);
}

console.log("🔧 PWM SwapWB Debug Functions Loaded!");
console.log("📋 Available functions:");
console.log("  - debugPWMSwapWB() - Analyze current state");
console.log("  - forceShowPWMSwapWB() - Force swapWB to be visible");
console.log("  - testPWMDependency() - Test RGBW dependency behavior");
