/**
 * Chat Subscription Integration
 * 
 * This module integrates the subscription system with the AI Advisor chat functionality.
 * It enforces subscription-based restrictions on AI prompts.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Make sure supabaseClient is available
    if (typeof supabaseClient === 'undefined' && typeof supabase !== 'undefined') {
        // Initialize Supabase client if not already available
        const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
        window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
    
    // Initialize the subscription validator
    const validator = new SubscriptionValidator(window.supabaseClient || supabaseClient);
    
    // Reference to chat elements
    const chatForm = document.getElementById('chat-form');
    const promptInput = document.getElementById('prompt-input');
    const sendButton = document.getElementById('send-button');
    const upgradeMessage = document.getElementById('upgrade-message');
    const usageCounter = document.getElementById('usage-counter');
    
    // Initialize validator and check prompt limits
    async function initializeChat() {
        const initialized = await validator.initialize();
        
        if (!initialized) {
            console.log('Failed to initialize subscription validator');
            return;
        }
        
        // Check if user can send prompts
        const promptStatus = await validator.canSendAIPrompt();
        updateUIBasedOnPromptStatus(promptStatus);
        
        // Update usage counter if it exists
        if (usageCounter) {
            usageCounter.textContent = `${promptStatus.currentCount || 0}/${promptStatus.maxCount || 0}`;
        }
    }
    
    // Update UI based on prompt status
    function updateUIBasedOnPromptStatus(status) {
        if (!status.canSendPrompt) {
            // Disable input and send button
            if (promptInput) promptInput.disabled = true;
            if (sendButton) sendButton.disabled = true;
            
            // Show upgrade message
            if (upgradeMessage) {
                upgradeMessage.classList.remove('hidden');
                upgradeMessage.innerHTML = `
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-yellow-700">${status.message}</p>
                                ${status.upgradeRequired ? 
                                    `<p class="mt-2"><a href="subscription.html" class="text-sm font-medium text-yellow-700 underline hover:text-yellow-600">Upgrade your plan</a> to continue using the AI Advisor.</p>` 
                                    : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Enable input and send button
            if (promptInput) promptInput.disabled = false;
            if (sendButton) sendButton.disabled = false;
            
            // Hide upgrade message
            if (upgradeMessage) {
                upgradeMessage.classList.add('hidden');
            }
        }
    }
    
    // Override the original sendMessage function if it exists
    if (window.sendMessage) {
        const originalSendMessage = window.sendMessage;
        
        window.sendMessage = async function(message) {
            // Check if user can send prompts
            const promptStatus = await validator.canSendAIPrompt();
            
            if (!promptStatus.canSendPrompt) {
                updateUIBasedOnPromptStatus(promptStatus);
                return;
            }
            
            // Record the prompt usage
            await validator.recordAIPromptUsage(message);
            
            // Update the usage counter immediately after recording
            const updatedStatus = await validator.canSendAIPrompt();
            if (usageCounter) {
                usageCounter.textContent = `${updatedStatus.currentCount || 0}/${updatedStatus.maxCount || 0}`;
            }
            
            // Call the original function
            return originalSendMessage(message);
        };
    }
    
    // Initialize the chat
    initializeChat();
});
