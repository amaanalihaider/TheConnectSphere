/**
 * Connection Subscription Integration
 * 
 * This module integrates the subscription system with the connection functionality.
 * It enforces subscription-based restrictions on user connections.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the subscription validator
    const validator = new SubscriptionValidator(supabaseClient);
    
    // Reference to connection elements
    const connectButtons = document.querySelectorAll('.connect-button');
    const connectionCounter = document.getElementById('connection-counter');
    const upgradeMessage = document.getElementById('connection-upgrade-message');
    
    // Initialize validator and check connection limits
    async function initializeConnectionSystem() {
        const initialized = await validator.initialize();
        
        if (!initialized) {
            console.log('Failed to initialize subscription validator');
            return;
        }
        
        // Check if user can create connections
        const connectionStatus = await validator.canCreateConnection();
        updateUIBasedOnConnectionStatus(connectionStatus);
        
        // Update connection counter if it exists
        if (connectionCounter) {
            connectionCounter.textContent = `${connectionStatus.currentCount || 0}/${connectionStatus.maxCount || 0}`;
        }
    }
    
    // Update UI based on connection status
    function updateUIBasedOnConnectionStatus(status) {
        if (!status.canConnect) {
            // Disable all connect buttons
            connectButtons.forEach(button => {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
                button.classList.remove('hover:bg-purple-700');
            });
            
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
                                    `<p class="mt-2"><a href="subscription.html" class="text-sm font-medium text-yellow-700 underline hover:text-yellow-600">Upgrade your plan</a> to connect with more people.</p>` 
                                    : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Enable all connect buttons
            connectButtons.forEach(button => {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.classList.add('hover:bg-purple-700');
            });
            
            // Hide upgrade message
            if (upgradeMessage) {
                upgradeMessage.classList.add('hidden');
            }
        }
    }
    
    // Add click event listeners to connect buttons
    connectButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            // Check if user can create connections
            const connectionStatus = await validator.canCreateConnection();
            
            if (!connectionStatus.canConnect) {
                e.preventDefault();
                e.stopPropagation();
                
                updateUIBasedOnConnectionStatus(connectionStatus);
                
                // Show alert with upgrade message
                alert(connectionStatus.message);
                return false;
            }
            
            // Continue with the original connection logic
            return true;
        });
    });
    
    // Initialize the connection system
    initializeConnectionSystem();
});
