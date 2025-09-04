// WORKING SwapWB Fix - Improved Console Script for WS2814f PWM
// Copy and paste this entire script into browser console on the LED Hardware page

(function() {
    console.log("🔧 === WORKING SWAPWB FIX STARTING ===");
    
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
    
    console.log("🔍 SwapWB field missing - creating manually...");
    
    // Step 3: Find the RGBW checkbox container
    const rgbwContainer = document.querySelector('[data-schemapath*="rgbw"]');
    if (!rgbwContainer) {
        console.error("❌ RGBW container not found - make sure WS2814f PWM is selected");
        return;
    }
    
    console.log("✅ Found RGBW container");
    
    // Step 4: Find the RGBW row (parent container)
    const rgbwRow = rgbwContainer.closest('.row');
    if (!rgbwRow) {
        console.error("❌ Could not find RGBW row container");
        return;
    }
    
    console.log("✅ Found RGBW row:", rgbwRow);
    
    // Step 5: Find the container that holds all rows
    const formContainer = rgbwRow.parentElement;
    if (!formContainer) {
        console.error("❌ Could not find form container");
        return;
    }
    
    console.log("✅ Found form container:", formContainer.tagName, formContainer.className);
    
    // Step 6: Create SwapWB field with exact same structure as RGBW
    const swapWBRow = document.createElement('div');
    swapWBRow.className = 'row';
    
    // Create the HTML structure matching the RGBW field exactly
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
                           data-schemapath="root.specificOptions.swapWB">
                </label>
            </div>
        </div>
    `;
    
    // Step 7: Find the White Algorithm row for positioning
    const whiteAlgorithmContainer = document.querySelector('[data-schemapath*="whiteAlgorithm"]');
    let insertionPoint = null;
    
    if (whiteAlgorithmContainer) {
        const whiteAlgRow = whiteAlgorithmContainer.closest('.row');
        if (whiteAlgRow && whiteAlgRow.parentElement === formContainer) {
            insertionPoint = whiteAlgRow;
            console.log("✅ Will insert before White Algorithm");
        }
    }
    
    // Step 8: Insert the SwapWB row
    if (insertionPoint) {
        formContainer.insertBefore(swapWBRow, insertionPoint);
        console.log("✅ SwapWB inserted before White Algorithm");
    } else {
        // Fallback: insert after RGBW row
        const nextSibling = rgbwRow.nextElementSibling;
        if (nextSibling) {
            formContainer.insertBefore(swapWBRow, nextSibling);
        } else {
            formContainer.appendChild(swapWBRow);
        }
        console.log("✅ SwapWB inserted after RGBW (fallback)");
    }
    
    // Step 9: Set up dependency behavior
    const rgbwCheckbox = rgbwContainer.querySelector('input[type="checkbox"]');
    const swapWBCheckbox = swapWBRow.querySelector('input[type="checkbox"]');
    
    if (rgbwCheckbox && swapWBCheckbox) {
        const updateSwapWBVisibility = () => {
            const shouldShow = rgbwCheckbox.checked;
            swapWBRow.style.display = shouldShow ? '' : 'none';
            console.log(`SwapWB visibility: ${shouldShow ? 'visible' : 'hidden'}`);
        };
        
        // Add event listener for RGBW changes
        rgbwCheckbox.addEventListener('change', updateSwapWBVisibility);
        
        // Set initial state
        updateSwapWBVisibility();
        
        // Add event listener for SwapWB changes
        swapWBCheckbox.addEventListener('change', function() {
            console.log(`SwapWB changed to: ${this.checked}`);
        });
        
        console.log("✅ Dependency behavior set up");
    }
    
    console.log("🎉 SUCCESS! SwapWB field created and functional!");
    console.log("📋 Instructions:");
    console.log("1. Enable 'Use RGBW protocol' checkbox");
    console.log("2. 'Swap W & B' checkbox should appear");
    console.log("3. Toggle it on/off to test functionality");
    console.log("4. Click 'Save settings' to save your configuration");
    
})();
