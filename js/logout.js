// Logout functionality for ConnectSphere
document.addEventListener('DOMContentLoaded', function() {
    console.log('Logout script initialized');
    
    // Setup logout functionality
    function setupLogout() {
        const logoutButtons = document.querySelectorAll('#logout-btn, #mobile-logout-btn');
        
        // Create logout confirmation modal if it doesn't exist
        if (!document.getElementById('logout-confirmation-modal')) {
            const modal = document.createElement('div');
            modal.id = 'logout-confirmation-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all">
                    <div class="text-center">
                        <i class="fas fa-sign-out-alt text-4xl text-purple-600 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                        <p class="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
                        <div class="flex justify-center space-x-4">
                            <button id="cancel-logout-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300">
                                Cancel
                            </button>
                            <button id="confirm-logout-btn" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition duration-300">
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners to the modal buttons
            document.getElementById('cancel-logout-btn').addEventListener('click', () => {
                modal.classList.add('hidden');
            });
            
            document.getElementById('confirm-logout-btn').addEventListener('click', async () => {
                try {
                    // Sign out using Supabase
                    const { error } = await supabaseClient.auth.signOut();
                    
                    if (error) {
                        console.error('Error signing out:', error);
                        // Don't show alert, just log the error
                    }
                    
                    // Redirect to home page after logout attempt (even if there was an error)
                    window.location.href = 'index.html';
                } catch (err) {
                    console.error('Exception during sign out:', err);
                    window.location.href = 'index.html';
                }
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
        
        // Setup click handlers for logout buttons
        logoutButtons.forEach(button => {
            if (button) {
                console.log('Setting up logout button:', button.id);
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Logout button clicked');
                    
                    // Show the confirmation modal
                    const modal = document.getElementById('logout-confirmation-modal');
                    if (modal) {
                        modal.classList.remove('hidden');
                    }
                });
                
                // Make sure the button is visible if user is authenticated
                button.style.display = 'inline-block';
                button.classList.remove('hidden');
            }
        });
    }
    
    // Check authentication status and setup logout if authenticated
    async function checkAuthAndSetupLogout() {
        try {
            const { data } = await supabaseClient.auth.getSession();
            const session = data.session;
            
            if (session) {
                console.log('User is authenticated, setting up logout functionality');
                setupLogout();
                
                // Make logout buttons visible
                const logoutButtons = document.querySelectorAll('#logout-btn, #mobile-logout-btn');
                logoutButtons.forEach(button => {
                    if (button) {
                        button.classList.remove('hidden');
                        button.style.display = button.id === 'mobile-logout-btn' ? 'block' : 'inline-block';
                    }
                });
                
                // Hide login/signup buttons
                const authButtons = document.querySelectorAll('#login-btn, #mobile-login-btn, #join-now-btn');
                authButtons.forEach(button => {
                    if (button) {
                        button.classList.add('hidden');
                        button.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.error('Error checking authentication status:', error);
        }
    }
    
    // Run the check and setup
    checkAuthAndSetupLogout();
});
