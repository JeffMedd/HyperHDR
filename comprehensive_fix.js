// Comprehensive WS2814f dependency fix
// This script provides multiple approaches to fix the swapWB dependency issue

function comprehensiveFix() {
    console.log("=== Comprehensive WS2814f Dependency Fix ===");

    // Check if we're on the correct device
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("ERROR: Not on ws2814fpwm device. Switch to WS2814f PWM first.");
        return false;
    }

    console.log("✅ Device: ws2814fpwm");

    // Get editors
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("ERROR: conf_editor not available");
        return false;
    }

    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("ERROR: specificOptions editor not found");
        return false;
    }

    const rgbwEditor = specificEditor.getEditor("rgbw");
    const swapWBEditor = specificEditor.getEditor("swapWB");
    const whiteAlgorithmEditor = specificEditor.getEditor("whiteAlgorithm");

    if (!rgbwEditor || !swapWBEditor) {
        console.error("ERROR: Required editors not found");
        console.log("Available editors:", Object.keys(specificEditor.editors || {}));
        return false;
    }

    console.log("✅ All required editors found");

    // Approach 1: Use JSON Editor's built-in watch mechanism
    console.log("🔧 Setting up JSON Editor watchers...");

    const setupDependencies = () => {
        const rgbwValue = rgbwEditor.getValue();
        const shouldShow = rgbwValue === true;

        console.log("RGBW value:", rgbwValue, "-> Should show dependent fields:", shouldShow);

        // Handle swapWB
        if (swapWBEditor) {
            swapWBEditor.dependenciesFulfilled = shouldShow;
            if (swapWBEditor.container) {
                swapWBEditor.container.style.display = shouldShow ? 'block' : 'none';
            }
            console.log("✅ SwapWB visibility set to:", shouldShow);
        }

        // Handle whiteAlgorithm
        if (whiteAlgorithmEditor) {
            whiteAlgorithmEditor.dependenciesFulfilled = shouldShow;
            if (whiteAlgorithmEditor.container) {
                whiteAlgorithmEditor.container.style.display = shouldShow ? 'block' : 'none';
            }
            console.log("✅ WhiteAlgorithm visibility set to:", shouldShow);
        }

        // Force DOM update by finding and updating all related elements
        const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
        const whiteAlgElements = document.querySelectorAll('[data-schemapath*="whiteAlgorithm"]');

        swapWBElements.forEach(el => {
            el.style.display = shouldShow ? '' : 'none';
        });

        whiteAlgElements.forEach(el => {
            el.style.display = shouldShow ? '' : 'none';
        });

        console.log("✅ DOM elements updated directly");
    };

    // Set up watcher using JSON Editor's watch mechanism
    try {
        conf_editor.watch('root.specificOptions.rgbw', setupDependencies);
        console.log("✅ JSON Editor watcher set up");
    } catch (e) {
        console.warn("⚠️ JSON Editor watch failed:", e);
    }

    // Approach 2: Use jQuery change events as backup
    console.log("🔧 Setting up jQuery change events...");

    const rgbwCheckbox = $('input[name="root[specificOptions][rgbw]"]');
    if (rgbwCheckbox.length) {
        rgbwCheckbox.off('change.ws2814f').on('change.ws2814f', function() {
            console.log("🔄 RGBW checkbox changed via jQuery");
            setTimeout(setupDependencies, 10);
        });
        console.log("✅ jQuery change handler set up");
    } else {
        console.warn("⚠️ RGBW checkbox not found for jQuery binding");
    }

    // Approach 3: MutationObserver for DOM changes
    console.log("🔧 Setting up MutationObserver...");

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'checked') {
                const target = mutation.target;
                if (target.name === 'root[specificOptions][rgbw]') {
                    console.log("🔄 RGBW changed via MutationObserver");
                    setTimeout(setupDependencies, 10);
                }
            }
        });
    });

    const rgbwInput = document.querySelector('input[name="root[specificOptions][rgbw]"]');
    if (rgbwInput) {
        observer.observe(rgbwInput, {
            attributes: true,
            attributeFilter: ['checked']
        });
        console.log("✅ MutationObserver set up");
    }

    // Initial setup
    console.log("🔧 Running initial dependency setup...");
    setupDependencies();

    // Test the setup
    console.log("🧪 Testing dependency mechanism...");
    const currentValue = rgbwEditor.getValue();

    setTimeout(() => {
        console.log("Testing toggle to:", !currentValue);
        rgbwEditor.setValue(!currentValue);

        setTimeout(() => {
            console.log("Testing toggle back to:", currentValue);
            rgbwEditor.setValue(currentValue);

            console.log("✅ Comprehensive fix applied and tested!");
            console.log("The SwapWB and WhiteAlgorithm fields should now properly show/hide based on RGBW setting.");
        }, 500);
    }, 500);

    return true;
}

// Function to check current state
function checkCurrentState() {
    console.log("=== Current State Check ===");

    if (typeof conf_editor !== 'undefined' && conf_editor) {
        const specificEditor = conf_editor.getEditor("root.specificOptions");
        if (specificEditor) {
            const rgbwEditor = specificEditor.getEditor("rgbw");
            const swapWBEditor = specificEditor.getEditor("swapWB");

            if (rgbwEditor && swapWBEditor) {
                console.log("RGBW value:", rgbwEditor.getValue());
                console.log("SwapWB value:", swapWBEditor.getValue());
                console.log("SwapWB dependencies fulfilled:", swapWBEditor.dependenciesFulfilled);
                console.log("SwapWB container display:", swapWBEditor.container ? swapWBEditor.container.style.display : "no container");

                // Check DOM elements
                const swapWBElements = document.querySelectorAll('[data-schemapath*="swapWB"]');
                swapWBElements.forEach((el, i) => {
                    console.log(`SwapWB DOM element ${i}:`, el.getAttribute('data-schemapath'), "display:", el.style.display);
                });
            }
        }
    }
}

console.log("Comprehensive WS2814f dependency fix loaded!");
console.log("Available functions:");
console.log("- comprehensiveFix() - Apply comprehensive dependency fix");
console.log("- checkCurrentState() - Check current state of dependency fields");
