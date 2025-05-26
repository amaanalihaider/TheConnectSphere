/**
 * Chatbot Personalization Module for ConnectSphere
 * Allows users to customize the AI advisor's context for more relevant relationship advice
 */

// Personalization state
let personalizationProfile = {
    targetPerson: {
        age: null,
        gender: null,
        education: null,
        values: [],
        interests: []
    },
    relationshipGoal: null,
    communicationStyle: null,
    savedProfiles: []
};

// Initialize personalization module
function initPersonalization() {
    // Load saved personalization if available
    loadPersonalizationSettings();
    
    // Setup UI elements
    setupPersonalizationUI();
    
    // Add event listeners
    document.getElementById('personalization-toggle').addEventListener('click', togglePersonalizationPanel);
    document.getElementById('save-personalization').addEventListener('click', savePersonalizationSettings);
    document.getElementById('reset-personalization').addEventListener('click', resetPersonalization);
    document.getElementById('save-profile').addEventListener('click', saveCurrentProfile);
    
    // Setup profile selector
    const profileSelector = document.getElementById('saved-profiles');
    if (profileSelector) {
        profileSelector.addEventListener('change', (e) => {
            if (e.target.value !== 'new') {
                loadProfile(e.target.value);
            } else {
                resetPersonalization(false);
            }
        });
    }
}

// Toggle personalization panel visibility
function togglePersonalizationPanel() {
    const panel = document.getElementById('personalization-panel');
    const isVisible = panel.classList.contains('active');
    
    if (isVisible) {
        panel.classList.remove('active');
        panel.style.maxHeight = '0';
        document.getElementById('personalization-toggle').innerHTML = 'Personalize AI <i class="fas fa-sliders-h ml-2"></i>';
    } else {
        panel.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        document.getElementById('personalization-toggle').innerHTML = 'Hide Options <i class="fas fa-chevron-up ml-2"></i>';
    }
}

// Setup personalization UI elements
function setupPersonalizationUI() {
    // Populate age options
    const ageSelect = document.getElementById('target-age');
    if (ageSelect) {
        for (let i = 18; i <= 65; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            ageSelect.appendChild(option);
        }
    }
    
    // Setup values multiselect
    setupMultiSelect('values-select', [
        'Traditional', 'Progressive', 'Religious', 'Spiritual', 'Family-oriented',
        'Career-focused', 'Adventurous', 'Conservative', 'Liberal', 'Environmentalist'
    ]);
    
    // Setup interests multiselect
    setupMultiSelect('interests-select', [
        'Travel', 'Music', 'Art', 'Sports', 'Reading', 'Movies', 'Cooking', 
        'Fitness', 'Technology', 'Nature', 'Photography', 'Gaming'
    ]);
    
    // Update UI with current settings
    updateUIFromSettings();
}

// Setup a multi-select dropdown
function setupMultiSelect(elementId, options) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.toLowerCase().replace(/\s+/g, '-');
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    // Initialize multi-select functionality
    $(document).ready(function() {
        try {
            $(`#${elementId}`).select2({
                placeholder: "Select options",
                allowClear: true,
                multiple: true
            });
        } catch (e) {
            console.warn('Select2 not available, falling back to standard select', e);
        }
    });
}

// Save personalization settings
function savePersonalizationSettings() {
    // Get values from form
    personalizationProfile.targetPerson.age = document.getElementById('target-age').value;
    personalizationProfile.targetPerson.gender = document.getElementById('target-gender').value;
    personalizationProfile.targetPerson.education = document.getElementById('target-education').value;
    
    // Get multi-select values
    try {
        personalizationProfile.targetPerson.values = Array.from(document.getElementById('values-select').selectedOptions).map(o => o.text);
        personalizationProfile.targetPerson.interests = Array.from(document.getElementById('interests-select').selectedOptions).map(o => o.text);
    } catch (e) {
        console.warn('Error getting multi-select values', e);
    }
    
    personalizationProfile.relationshipGoal = document.getElementById('relationship-goal').value;
    personalizationProfile.communicationStyle = document.getElementById('communication-style').value;
    
    // Save to localStorage
    localStorage.setItem('chatPersonalization', JSON.stringify(personalizationProfile));
    
    // Show success message
    showNotification('Personalization settings saved!');
    
    // Update the system prompt for the chatbot
    updateChatbotSystemPrompt();
}

// Load personalization settings from localStorage
function loadPersonalizationSettings() {
    try {
        const savedSettings = localStorage.getItem('chatPersonalization');
        if (savedSettings) {
            personalizationProfile = JSON.parse(savedSettings);
            updateUIFromSettings();
            updateSavedProfilesDropdown();
        }
    } catch (e) {
        console.error('Error loading personalization settings', e);
    }
}

// Update UI elements with current settings
function updateUIFromSettings() {
    // Set form values
    if (personalizationProfile.targetPerson.age) {
        document.getElementById('target-age').value = personalizationProfile.targetPerson.age;
    }
    
    if (personalizationProfile.targetPerson.gender) {
        document.getElementById('target-gender').value = personalizationProfile.targetPerson.gender;
    }
    
    if (personalizationProfile.targetPerson.education) {
        document.getElementById('target-education').value = personalizationProfile.targetPerson.education;
    }
    
    // Set multi-select values
    try {
        const valuesSelect = document.getElementById('values-select');
        const interestsSelect = document.getElementById('interests-select');
        
        // Clear selections
        Array.from(valuesSelect.options).forEach(opt => opt.selected = false);
        Array.from(interestsSelect.options).forEach(opt => opt.selected = false);
        
        // Set new selections
        personalizationProfile.targetPerson.values.forEach(value => {
            Array.from(valuesSelect.options).forEach(opt => {
                if (opt.text === value) opt.selected = true;
            });
        });
        
        personalizationProfile.targetPerson.interests.forEach(interest => {
            Array.from(interestsSelect.options).forEach(opt => {
                if (opt.text === interest) opt.selected = true;
            });
        });
        
        // Update Select2 if available
        try {
            $('#values-select').trigger('change');
            $('#interests-select').trigger('change');
        } catch (e) {
            console.warn('Select2 not available for triggering change', e);
        }
    } catch (e) {
        console.warn('Error setting multi-select values', e);
    }
    
    if (personalizationProfile.relationshipGoal) {
        document.getElementById('relationship-goal').value = personalizationProfile.relationshipGoal;
    }
    
    if (personalizationProfile.communicationStyle) {
        document.getElementById('communication-style').value = personalizationProfile.communicationStyle;
    }
}

// Reset personalization settings
function resetPersonalization(showMessage = true) {
    personalizationProfile = {
        targetPerson: {
            age: null,
            gender: null,
            education: null,
            values: [],
            interests: []
        },
        relationshipGoal: null,
        communicationStyle: null,
        savedProfiles: personalizationProfile.savedProfiles || []
    };
    
    // Reset form
    document.getElementById('target-age').value = '';
    document.getElementById('target-gender').value = '';
    document.getElementById('target-education').value = '';
    document.getElementById('relationship-goal').value = '';
    document.getElementById('communication-style').value = '';
    
    // Reset multi-selects
    try {
        const valuesSelect = document.getElementById('values-select');
        const interestsSelect = document.getElementById('interests-select');
        
        Array.from(valuesSelect.options).forEach(opt => opt.selected = false);
        Array.from(interestsSelect.options).forEach(opt => opt.selected = false);
        
        // Update Select2 if available
        try {
            $('#values-select').trigger('change');
            $('#interests-select').trigger('change');
        } catch (e) {
            console.warn('Select2 not available for triggering change', e);
        }
    } catch (e) {
        console.warn('Error resetting multi-select values', e);
    }
    
    // Show message if needed
    if (showMessage) {
        showNotification('Personalization settings reset!');
    }
    
    // Update the system prompt for the chatbot
    updateChatbotSystemPrompt();
}

// Save current profile
function saveCurrentProfile() {
    const profileName = document.getElementById('profile-name').value.trim();
    
    if (!profileName) {
        showNotification('Please enter a profile name', 'error');
        return;
    }
    
    // Get current settings
    savePersonalizationSettings();
    
    // Create profile object
    const profile = {
        name: profileName,
        settings: JSON.parse(JSON.stringify(personalizationProfile))
    };
    
    // Add to saved profiles
    if (!personalizationProfile.savedProfiles) {
        personalizationProfile.savedProfiles = [];
    }
    
    // Check if profile with same name exists
    const existingIndex = personalizationProfile.savedProfiles.findIndex(p => p.name === profileName);
    if (existingIndex >= 0) {
        // Update existing profile
        personalizationProfile.savedProfiles[existingIndex] = profile;
    } else {
        // Add new profile
        personalizationProfile.savedProfiles.push(profile);
    }
    
    // Save to localStorage
    localStorage.setItem('chatPersonalization', JSON.stringify(personalizationProfile));
    
    // Update dropdown
    updateSavedProfilesDropdown();
    
    // Show success message
    showNotification(`Profile "${profileName}" saved!`);
}

// Load a saved profile
function loadProfile(profileName) {
    if (!personalizationProfile.savedProfiles) return;
    
    const profile = personalizationProfile.savedProfiles.find(p => p.name === profileName);
    if (profile) {
        // Load profile settings
        personalizationProfile = JSON.parse(JSON.stringify(profile.settings));
        
        // Make sure savedProfiles is preserved
        if (!personalizationProfile.savedProfiles) {
            personalizationProfile.savedProfiles = profile.settings.savedProfiles || [];
        }
        
        // Update UI
        updateUIFromSettings();
        
        // Update the system prompt for the chatbot
        updateChatbotSystemPrompt();
        
        // Show success message
        showNotification(`Profile "${profileName}" loaded!`);
    }
}

// Update saved profiles dropdown
function updateSavedProfilesDropdown() {
    const profileSelector = document.getElementById('saved-profiles');
    if (!profileSelector) return;
    
    // Clear existing options
    profileSelector.innerHTML = '';
    
    // Add "New Profile" option
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '-- New Profile --';
    profileSelector.appendChild(newOption);
    
    // Add saved profiles
    if (personalizationProfile.savedProfiles && personalizationProfile.savedProfiles.length > 0) {
        personalizationProfile.savedProfiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.name;
            option.textContent = profile.name;
            profileSelector.appendChild(option);
        });
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Update the chatbot system prompt with personalization
function updateChatbotSystemPrompt() {
    // Check if we have personalization data
    const hasPersonalization = personalizationProfile.targetPerson.age || 
                              personalizationProfile.targetPerson.gender ||
                              personalizationProfile.relationshipGoal;
    
    if (!hasPersonalization) {
        // Reset to default system prompt
        window.chatbotSystemPromptPersonalized = null;
        return;
    }
    
    // Build personalized context
    let personalizedContext = "Here's some context about the person I'm interested in or want to discuss:\n\n";
    
    if (personalizationProfile.targetPerson.age) {
        personalizedContext += `- Age: ${personalizationProfile.targetPerson.age}\n`;
    }
    
    if (personalizationProfile.targetPerson.gender) {
        personalizedContext += `- Gender: ${personalizationProfile.targetPerson.gender}\n`;
    }
    
    if (personalizationProfile.targetPerson.education) {
        personalizedContext += `- Education: ${personalizationProfile.targetPerson.education}\n`;
    }
    
    if (personalizationProfile.targetPerson.values && personalizationProfile.targetPerson.values.length > 0) {
        personalizedContext += `- Values: ${personalizationProfile.targetPerson.values.join(', ')}\n`;
    }
    
    if (personalizationProfile.targetPerson.interests && personalizationProfile.targetPerson.interests.length > 0) {
        personalizedContext += `- Interests: ${personalizationProfile.targetPerson.interests.join(', ')}\n`;
    }
    
    if (personalizationProfile.relationshipGoal) {
        personalizedContext += `\nMy relationship goal is: ${personalizationProfile.relationshipGoal}\n`;
    }
    
    if (personalizationProfile.communicationStyle) {
        personalizedContext += `\nI prefer communication that is: ${personalizationProfile.communicationStyle}\n`;
    }
    
    // Create personalized system prompt
    window.chatbotSystemPromptPersonalized = `You are the ConnectSphere AI Advisor, a specialized chatbot focused exclusively on relationship advice, dating tips, and interpersonal connections.

Your responses must ONLY relate to:
- Dating advice and relationship guidance
- Tips for improving communication with partners
- Advice on finding compatible matches
- Guidance on building healthy relationships
- Support for relationship challenges
- Dating profile improvement suggestions
- Interpersonal connection strategies

PERSONALIZATION CONTEXT:
${personalizedContext}

Please tailor your advice to be relevant to this specific context. Consider the age, gender, education level, values, and interests of the person I'm discussing when providing relationship advice. Adjust your suggestions to align with my relationship goals and preferred communication style.

If asked about ANY other topic outside of relationships and dating, politely redirect the conversation back to relationship topics by saying: "I'm the ConnectSphere Relationship Advisor, so I focus on helping with dating and relationship questions. I'd be happy to help with any relationship concerns you have!"

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses friendly, supportive, and thoughtful
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested
7. Always maintain a positive, encouraging tone`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initPersonalization);
