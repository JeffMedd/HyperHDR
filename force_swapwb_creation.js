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

// Test function to manually create swapWB field
function manuallyCreateSwapWB() {
    console.log("🔧 === MANUALLY CREATE SWAPWB FIELD ===");
    
    const specificEditor = conf_editor.getEditor("root.specificOptions");
    if (!specificEditor) {
        console.error("❌ specificOptions editor not found");
        return false;
    }
    
    // Get the schema
    const schema = specificEditor.schema;
    if (!schema || !schema.properties || !schema.properties.swapWB) {
        console.error("❌ swapWB not found in schema");
        return false;
    }
    
    console.log("SwapWB schema found:", schema.properties.swapWB);
    
    // Try to manually create the editor
    try {
        // Create the swapWB editor manually using JSON Editor's internal methods
        const JSONEditor = window.JSONEditor;
        if (JSONEditor) {
            console.log("JSONEditor class found, attempting manual creation...");
            
            // Create a new editor instance for swapWB
            const swapWBSchema = JSON.parse(JSON.stringify(schema.properties.swapWB));
            swapWBSchema.title = swapWBSchema.title || "Swap W & B";
            
            // Find the container to add the field to
            const container = specificEditor.editor_holder || specificEditor.container;
            if (container) {
                console.log("Container found, creating swapWB field...");
                
                // Create a new container for swapWB
                const swapWBContainer = document.createElement('div');
                swapWBContainer.className = 'form-group';
                
                // Create checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'swapWB';
                checkbox.setAttribute('data-schemapath', 'root.specificOptions.swapWB');
                
                // Create label
                const label = document.createElement('label');
                label.htmlFor = 'swapWB';
                label.textContent = 'Swap W & B';
                label.style.marginLeft = '5px';
                
                // Add to container
                swapWBContainer.appendChild(checkbox);
                swapWBContainer.appendChild(label);
                
                // Insert after RGBW field
                const rgbwContainer = document.querySelector('[data-schemapath*="rgbw"]')?.parentElement;
                if (rgbwContainer && rgbwContainer.parentElement) {
                    rgbwContainer.parentElement.insertBefore(swapWBContainer, rgbwContainer.nextSibling);
                    console.log("✅ SwapWB field manually created and inserted!");
                    
                    // Add event listener for dependency
                    const rgbwCheckbox = document.querySelector('[data-schemapath*="rgbw"] input');
                    if (rgbwCheckbox) {
                        rgbwCheckbox.addEventListener('change', function() {
                            swapWBContainer.style.display = this.checked ? 'block' : 'none';
                        });
                        
                        // Set initial state
                        swapWBContainer.style.display = rgbwCheckbox.checked ? 'block' : 'none';
                        console.log("✅ Dependency handling added!");
                    }
                    
                    return true;
                } else {
                    console.error("❌ Could not find RGBW container to insert after");
                }
            }
        }
    } catch (error) {
        console.error("Error creating manual swapWB field:", error);
    }
    
    return false;
}

console.log("🔧 SwapWB Creation Fix Scripts Loaded!");
console.log("📋 Available functions:");
console.log("  - forceSwapWBCreation() - Force recreate editors to include swapWB");
console.log("  - manuallyCreateSwapWB() - Manually create swapWB field in DOM");
console.log("");
console.log("💡 Try forceSwapWBCreation() first");
