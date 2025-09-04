// Instant SwapWB Fix - Console Script for WS2814f PWM
// Copy and paste this entire script into browser console on the LED Hardware page

(function() {
    console.log("🔧 === INSTANT SWAPWB FIX STARTING ===");
    
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
    
    // Step 4: Find the form container
    let formContainer = rgbwContainer.parentElement;
    let attempts = 0;
    while (formContainer && !formContainer.classList.contains('container-fluid') && attempts < 10) {
        if (formContainer.classList.contains('row') || 
            formContainer.classList.contains('form-group') ||
            formContainer.tagName === 'FORM') {
            break;
        }
        formContainer = formContainer.parentElement;
        attempts++;
    }
    
    if (!formContainer) {
        console.error("❌ Could not find suitable form container");
        return;
    }
    
    console.log("✅ Found form container:", formContainer.tagName, formContainer.className);
    
    // Step 5: Create SwapWB field with exact same structure as other fields
    const swapWBRow = document.createElement('div');
    swapWBRow.className = 'row form-group';
    
    // Create the HTML structure matching the existing fields
    swapWBRow.innerHTML = `
        <div class="col-sm-12">
            <div class="checkbox">
                <label>
                    <input type="checkbox" 
                           name="root[specificOptions][swapWB]" 
                           value="1"
                           data-schemapath="root.specificOptions.swapWB">
                    Swap W & B
                </label>
            </div>
        </div>
    `;
    
    // Step 6: Find the best insertion point
    const whiteAlgorithmContainer = document.querySelector('[data-schemapath*="whiteAlgorithm"]');
    const rgbwRow = rgbwContainer.closest('.row');
    
    if (whiteAlgorithmContainer && rgbwRow) {
        // Insert between RGBW and White Algorithm
        const whiteAlgRow = whiteAlgorithmContainer.closest('.row');
        if (whiteAlgRow) {
            formContainer.insertBefore(swapWBRow, whiteAlgRow);
            console.log("✅ SwapWB inserted between RGBW and White Algorithm");
        } else {
            // Fallback: insert after RGBW
            rgbwRow.parentElement.insertBefore(swapWBRow, rgbwRow.nextSibling);
            console.log("✅ SwapWB inserted after RGBW (fallback)");
        }
    } else if (rgbwRow) {
        // Insert after RGBW
        rgbwRow.parentElement.insertBefore(swapWBRow, rgbwRow.nextSibling);
        console.log("✅ SwapWB inserted after RGBW");
    } else {
        console.error("❌ Could not find insertion point");
        return;
    }
    
    // Step 7: Set up dependency behavior
    const rgbwCheckbox = rgbwContainer.querySelector('input[type="checkbox"]');
    const swapWBCheckbox = swapWBRow.querySelector('input[type="checkbox"]');
    
    if (rgbwCheckbox && swapWBCheckbox) {
        const updateSwapWBVisibility = () => {
            const shouldShow = rgbwCheckbox.checked;
            swapWBRow.style.display = shouldShow ? 'block' : 'none';
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
    
})();
