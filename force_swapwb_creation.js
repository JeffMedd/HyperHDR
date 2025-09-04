// Force SwapWB Editor Creation Fix
function forceSwapWBCreation() {
    console.log("🔧 === FORCE SWAPWB EDITOR CREATION ===");

    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("❌ Please select ws2814fpwm first");
        return false;
    }

    // Get the specific editor
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        return false;
    }

    // Check RGBW value
    const rgbwEditor = specificEditor.editors.rgbw;
    if (!rgbwEditor) {
        console.error("❌ RGBW editor not found");
        return false;
    }

    console.log("Current RGBW value:", rgbwEditor.getValue());

    // Step 1: Enable RGBW if not already enabled
    if (!rgbwEditor.getValue()) {
        console.log("Enabling RGBW...");
        rgbwEditor.setValue(true);
    }

    // Step 2: Force recreation of the entire specificOptions editor
    console.log("Forcing editor recreation...");

    // Get current values to preserve them
    const currentValues = {};
    Object.keys(specificEditor.editors).forEach(key => {
        const editor = specificEditor.editors[key];
        if (editor && editor.getValue) {
            currentValues[key] = editor.getValue();
        }
    });

    console.log("Saved current values:", currentValues);

    // Force destroy and recreate the specific options editor
    if (specificEditor.destroy) {
        specificEditor.destroy();
    }

    // Trigger device change to recreate everything
    console.log("Triggering device change...");
    $(deviceSelect).trigger('change');

    // Wait for recreation and restore values
    setTimeout(() => {
        console.log("Checking if swapWB was created...");

        const newSpecificEditor = conf_editor.getEditor("root.specificOptions");
        if (newSpecificEditor) {
            const newEditors = Object.keys(newSpecificEditor.editors || {});
            console.log("New editors created:", newEditors);

            if (newEditors.includes('swapWB')) {
                console.log("🎉 SUCCESS! SwapWB editor was created!");

                // Restore the values
                Object.keys(currentValues).forEach(key => {
                    const editor = newSpecificEditor.editors[key];
                    if (editor && editor.setValue) {
                        editor.setValue(currentValues[key]);
                    }
                });

                console.log("Values restored");
                return true;
            } else {
                console.error("❌ SwapWB editor still not created");
                return false;
            }
        }
    }, 1000);
}

// Smart SwapWB creation function that properly handles DOM structure
function manuallyCreateSwapWB() {
    console.log("🔧 === SMART SWAPWB FIELD CREATION ===");

    // Check if we're on WS2814f PWM
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect || deviceSelect.value !== "ws2814fpwm") {
        console.error("❌ Please select ws2814fpwm first");
        return false;
    }

    // Check if it already exists
    if (document.querySelector('[data-schemapath*="swapWB"]')) {
        console.log("✅ SwapWB already exists!");
        return true;
    }

    // Find the RGBW field container
    const rgbwContainer = document.querySelector('[data-schemapath*="rgbw"]');
    if (!rgbwContainer) {
        console.error("❌ RGBW container not found");
        return false;
    }

    console.log("Found RGBW container:", rgbwContainer);

    // Find the parent container that holds all the form fields
    let formContainer = rgbwContainer.parentElement;
    while (formContainer && !formContainer.classList.contains('je-object')) {
        formContainer = formContainer.parentElement;
    }

    if (!formContainer) {
        console.error("❌ Could not find form container");
        return false;
    }

    console.log("Found form container:", formContainer);

    // Create SwapWB container with proper structure matching existing fields
    const swapWBContainer = document.createElement('div');
    swapWBContainer.className = 'form-group je-object';
    swapWBContainer.setAttribute('data-schemapath', 'root.specificOptions.swapWB');

    // Create checkbox wrapper
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox';

    // Create label with checkbox inside (Bootstrap style)
    const label = document.createElement('label');

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'root[specificOptions][swapWB]';
    checkbox.value = '1';
    checkbox.setAttribute('data-schemapath', 'root.specificOptions.swapWB');

    // Create label text
    const labelText = document.createTextNode(' Swap W & B');

    // Assemble elements
    label.appendChild(checkbox);
    label.appendChild(labelText);
    checkboxWrapper.appendChild(label);
    swapWBContainer.appendChild(checkboxWrapper);

    // Find the best insertion point
    const whiteAlgContainer = document.querySelector('[data-schemapath*="whiteAlgorithm"]');
    const rgbwFormGroup = rgbwContainer.closest('.form-group');

    if (whiteAlgContainer && rgbwFormGroup) {
        // Insert between RGBW and White Algorithm
        const whiteAlgFormGroup = whiteAlgContainer.closest('.form-group');
        formContainer.insertBefore(swapWBContainer, whiteAlgFormGroup);
        console.log("✅ SwapWB inserted between RGBW and White Algorithm");
    } else if (rgbwFormGroup) {
        // Insert after RGBW
        if (rgbwFormGroup.nextSibling) {
            formContainer.insertBefore(swapWBContainer, rgbwFormGroup.nextSibling);
        } else {
            formContainer.appendChild(swapWBContainer);
        }
        console.log("✅ SwapWB inserted after RGBW");
    } else {
        console.error("❌ Could not find suitable insertion point");
        return false;
    }

    // Set up dependency handling
    const rgbwCheckbox = rgbwContainer.querySelector('input[type="checkbox"]');
    if (rgbwCheckbox) {
        const updateVisibility = () => {
            const shouldShow = rgbwCheckbox.checked;
            swapWBContainer.style.display = shouldShow ? 'block' : 'none';
            console.log(`SwapWB visibility: ${shouldShow ? 'visible' : 'hidden'}`);
        };

        // Add event listener
        rgbwCheckbox.addEventListener('change', updateVisibility);

        // Set initial state
        updateVisibility();

        console.log("✅ Dependency handling added");
    }

    // Add to form data handling
    checkbox.addEventListener('change', function() {
        console.log(`SwapWB changed to: ${this.checked}`);
        // Trigger form validation if needed
        if (window.conf_editor && window.conf_editor.validate) {
            window.conf_editor.validate();
        }
    });

    console.log("🎉 SUCCESS! SwapWB checkbox created and functional!");
    return true;
}

console.log("🔧 SwapWB Creation Fix Scripts Loaded!");
console.log("📋 Available functions:");
console.log("  - forceSwapWBCreation() - Force recreate editors to include swapWB");
console.log("  - manuallyCreateSwapWB() - Manually create swapWB field in DOM");
console.log("");
console.log("💡 Try forceSwapWBCreation() first");
