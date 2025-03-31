document.addEventListener('DOMContentLoaded', () => {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Equipment selection functionality
    const equipmentSlots = document.querySelectorAll('.equipment-slot');
    const characterModel = document.querySelector('.character-model');
    
    // Initialize equipment state
    let currentEquipment = {
        helmet: null,
        chest: null,
        gloves: null,
        boots: null
    };

    equipmentSlots.forEach(slot => {
        const slotContent = slot.querySelector('.slot-content');
        const equipmentType = slot.querySelector('.slot-name').textContent.toLowerCase().replace(' ', '');
        
        slotContent.addEventListener('click', () => {
            // Toggle selection
            slotContent.classList.toggle('selected');
            
            if (slotContent.classList.contains('selected')) {
                // Add equipment class without removing other classes
                const equipmentClass = `${equipmentType}-equipped`;
                if (!characterModel.classList.contains(equipmentClass)) {
                    characterModel.classList.add(equipmentClass);
                }
                currentEquipment[equipmentType] = equipmentClass;
            } else {
                // Remove only this equipment class
                const equipmentClass = `${equipmentType}-equipped`;
                characterModel.classList.remove(equipmentClass);
                currentEquipment[equipmentType] = null;
            }
        });
    });

    // Color picker functionality
    const colorOptions = document.querySelectorAll('.color-option:not(.locked)');
    colorOptions.forEach(option => {
        option.style.backgroundColor = option.getAttribute('data-color');
        option.addEventListener('click', () => {
            // Remove selected class from all options in the same group
            const parent = option.closest('.color-options');
            parent.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
        });
    });

    // Slider functionality
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            // Update character preview based on slider value
            updateCharacterPreview(slider, value);
        });
    });

    // Checkbox effects
    const glowEffect = document.querySelector('.glow-effect');
    const crackedEffect = document.querySelector('.cracked-effect');

    glowEffect.addEventListener('change', (e) => {
        if (e.target.checked) {
            characterModel.classList.add('glowing-eyes');
        } else {
            characterModel.classList.remove('glowing-eyes');
        }
    });

    crackedEffect.addEventListener('change', (e) => {
        if (e.target.checked) {
            characterModel.classList.add('cracked-eyes');
        } else {
            characterModel.classList.remove('cracked-eyes');
        }
    });

    // Class selection
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        const selectButton = card.querySelector('.select-class');
        selectButton.addEventListener('click', () => {
            // Remove selected class from all cards
            classCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            // Update character preview based on selected class
            updateCharacterClass(card.querySelector('h3').textContent);
        });
    });

    // Save and Cancel buttons
    const saveButton = document.querySelector('.save-button');
    const cancelButton = document.querySelector('.cancel-button');

    saveButton.addEventListener('click', () => {
        // Collect all customization data
        const customizationData = {
            face: {
                jawline: document.querySelector('input[type="range"][label="Jawline"]').value,
                cheekbones: document.querySelector('input[type="range"][label="Cheekbones"]').value,
                foreheadHeight: document.querySelector('input[type="range"][label="Forehead Height"]').value,
                chinWidth: document.querySelector('input[type="range"][label="Chin Width"]').value
            },
            eyes: {
                pupilSize: document.querySelector('input[type="range"][label="Pupil Size"]').value,
                irisShape: document.querySelector('input[type="range"][label="Iris Shape"]').value,
                irisColor: document.querySelector('.color-option.selected')?.getAttribute('data-color'),
                glowing: glowEffect.checked,
                cracked: crackedEffect.checked
            },
            hair: {
                style: document.querySelector('.style-dropdown').value,
                color: document.querySelector('.color-option.selected')?.getAttribute('data-color')
            },
            body: {
                physique: document.querySelector('input[type="range"][label="Physique"]').value,
                height: document.querySelector('input[type="range"][label="Height"]').value,
                muscleDefinition: document.querySelector('input[type="range"][label="Muscle Definition"]').value
            },
            class: document.querySelector('.class-card.selected')?.querySelector('h3').textContent,
            equipment: currentEquipment
        };

        // Save the data (you would typically send this to a server)
        console.log('Saving customization data:', customizationData);
        
        // Show success message
        showNotification('Customization saved successfully!');
    });

    cancelButton.addEventListener('click', () => {
        // Reset all customization options to default
        resetCustomization();
        showNotification('Customization reset to default');
    });
});

// Helper function to update character preview based on slider changes
function updateCharacterPreview(slider, value) {
    const characterModel = document.querySelector('.character-model');
    const attribute = slider.getAttribute('label').toLowerCase().replace(' ', '-');
    
    // Update the character model's style based on the slider value
    characterModel.style.setProperty(`--${attribute}`, `${value}%`);
}

// Helper function to update character class
function updateCharacterClass(className) {
    const characterModel = document.querySelector('.character-model');
    
    // Store current equipment classes
    const equipmentClasses = Array.from(characterModel.classList)
        .filter(cls => cls.endsWith('-equipped'));
    
    // Reset base classes
    characterModel.className = 'character-model';
    
    // Add back equipment classes
    equipmentClasses.forEach(cls => {
        characterModel.classList.add(cls);
    });
    
    // Add new class
    characterModel.classList.add(className.toLowerCase());
}

// Helper function to reset customization
function resetCustomization() {
    // Reset all sliders to 50%
    document.querySelectorAll('.slider').forEach(slider => {
        slider.value = 50;
    });

    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset dropdowns
    document.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
    });

    // Remove selected class from all cards
    document.querySelectorAll('.class-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Reset character model
    const characterModel = document.querySelector('.character-model');
    characterModel.className = 'character-model';
    
    // Reset equipment slots
    document.querySelectorAll('.equipment-slot .slot-content').forEach(slot => {
        slot.classList.remove('selected');
    });
}

// Helper function to show notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 