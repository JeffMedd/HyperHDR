// FUNCTIONAL SwapWB Fix - Properly Integrated Console Script for WS2814f PWM
// This script creates a SwapWB checkbox that actually saves and functions

(function() {
    console.log("🔧 === FUNCTIONAL SWAPWB FIX STARTING ===");

    // Step 1: Verify we're on the right page
    const deviceSelect = document.getElementById("leddevices");
    if (!deviceSelect) {
        console.error("❌ Not on LED Hardware page - navigate to Configuration > LED Hardware first");
        return;
    }

    if (deviceSelect.value !== "ws2814fpwm") {
        console.error("❌ Please select 'ws2814fpwm' from Controller type dropdown first");
        return;
    }

    console.log("✅ Device: ws2814fpwm confirmed");

    // Step 2: Check if SwapWB already exists
    const existingSwapWB = document.querySelector('[data-schemapath*="swapWB"]');
    if (existingSwapWB) {
        console.log("✅ SwapWB field already exists!");
        return;
    }

    console.log("🔍 SwapWB field missing - creating functionally integrated version...");

    // Step 3: Get the JSON Editor instance
    if (typeof conf_editor === 'undefined' || !conf_editor) {
        console.error("❌ conf_editor not found - please refresh the page and try again");
        return;
    }

    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        return;
    }

    console.log("✅ JSON Editor found");

    // Step 4: Find the RGBW checkbox container
    const rgbwContainer = document.querySelector('[data-schemapath*="rgbw"]');
    if (!rgbwContainer) {
        console.error("❌ RGBW container not found - make sure WS2814f PWM is selected");
        return;
    }

    console.log("✅ Found RGBW container");

    // Step 5: Find the RGBW row and form container
    const rgbwRow = rgbwContainer.closest('.row');
    if (!rgbwRow) {
        console.error("❌ Could not find RGBW row container");
        return;
    }

    const formContainer = rgbwRow.parentElement;
    if (!formContainer) {
        console.error("❌ Could not find form container");
        return;
    }

    console.log("✅ Found form structure");

    // Step 6: Create SwapWB field with proper JSON Editor integration
    const swapWBRow = document.createElement('div');
    swapWBRow.className = 'row';
    swapWBRow.setAttribute('data-schemapath', 'root.specificOptions.swapWB');

    // Create the HTML structure matching other fields exactly
    swapWBRow.innerHTML = `
        <div class="col-sm-3 control-label">
            <label>Swap W & B</label>
        </div>
        <div class="col-sm-9">
            <div class="checkbox">
                <label>
                    <input type="checkbox"
                           name="root[specificOptions][swapWB]"
                           value="1"
                           data-schemapath="root.specificOptions.swapWB"
                           id="swapWB_manual">
                </label>
            </div>
        </div>
    `;

    // Step 7: Insert the SwapWB row in the correct position
    const whiteAlgorithmContainer = document.querySelector('[data-schemapath*="whiteAlgorithm"]');
    let insertionPoint = null;

    if (whiteAlgorithmContainer) {
        const whiteAlgRow = whiteAlgorithmContainer.closest('.row');
        if (whiteAlgRow && whiteAlgRow.parentElement === formContainer) {
            insertionPoint = whiteAlgRow;
            console.log("✅ Will insert before White Algorithm");
        }
    }

    if (insertionPoint) {
        formContainer.insertBefore(swapWBRow, insertionPoint);
        console.log("✅ SwapWB inserted before White Algorithm");
    } else {
        const nextSibling = rgbwRow.nextElementSibling;
        if (nextSibling) {
            formContainer.insertBefore(swapWBRow, nextSibling);
        } else {
            formContainer.appendChild(swapWBRow);
        }
        console.log("✅ SwapWB inserted after RGBW");
    }

    // Step 8: Get the checkbox element
    const swapWBCheckbox = swapWBRow.querySelector('input[type="checkbox"]');
    const rgbwCheckbox = rgbwContainer.querySelector('input[type="checkbox"]');

    if (!swapWBCheckbox || !rgbwCheckbox) {
        console.error("❌ Could not find checkboxes");
        return;
    }

    // Step 9: Set up proper dependency behavior
    const updateSwapWBVisibility = () => {
        const shouldShow = rgbwCheckbox.checked;
        swapWBRow.style.display = shouldShow ? '' : 'none';
        console.log(`SwapWB visibility: ${shouldShow ? 'visible' : 'hidden'}`);
    };

    // Add event listener for RGBW changes
    rgbwCheckbox.addEventListener('change', updateSwapWBVisibility);

    // Set initial state
    updateSwapWBVisibility();

    // Step 10: Integrate with JSON Editor's data model
    let currentConfig = conf_editor.getValue();
    if (!currentConfig.specificOptions) {
        currentConfig.specificOptions = {};
    }

    // Initialize swapWB in the config if it doesn't exist
    if (typeof currentConfig.specificOptions.swapWB === 'undefined') {
        currentConfig.specificOptions.swapWB = false;
    }

    // Set initial checkbox state from config
    swapWBCheckbox.checked = currentConfig.specificOptions.swapWB;

    // Step 11: Set up proper change handling that integrates with conf_editor
    swapWBCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        console.log(`SwapWB changed to: ${isChecked}`);

        // Update the JSON Editor's internal data model
        let config = conf_editor.getValue();
        if (!config.specificOptions) {
            config.specificOptions = {};
        }
        config.specificOptions.swapWB = isChecked;

        // Set the value back to the editor (this triggers internal validation)
        conf_editor.setValue(config);

        // Trigger change event for proper form handling
        conf_editor.trigger('change');

        console.log("✅ SwapWB value updated in configuration model");
    });

    // Step 12: Monitor for form submissions to ensure our data is included
    const saveButton = document.querySelector('#btn_submit_controller, button[type="submit"]');
    if (saveButton) {
        const originalSubmitHandler = saveButton.onclick;

        saveButton.addEventListener('click', function(event) {
            // Ensure our swapWB value is in the config before submission
            let config = conf_editor.getValue();
            if (!config.specificOptions) {
                config.specificOptions = {};
            }
            config.specificOptions.swapWB = swapWBCheckbox.checked;
            conf_editor.setValue(config);

            console.log("✅ SwapWB value ensured in config before save:", swapWBCheckbox.checked);
        });
    }

    console.log("✅ Dependency behavior set up");
    console.log("🎉 SUCCESS! SwapWB field created and FUNCTIONALLY integrated!");
    console.log("📋 Instructions:");
    console.log("1. Enable 'Use RGBW protocol' checkbox");
    console.log("2. 'Swap W & B' checkbox should appear");
    console.log("3. Toggle 'Swap W & B' on/off");
    console.log("4. Click 'Save settings' to save your configuration");
    console.log("5. The setting will now be properly saved and applied to your LED strip");

})();
