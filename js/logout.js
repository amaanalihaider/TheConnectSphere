// Logout functionality for ConnectSphere
document.addEventListener('DOMContentLoaded', function() {
    console.log('Logout script initialized');
    
    // Setup logout functionality
    function setupLogout() {
        const logoutButtons = document.querySelectorAll('#logout-btn, #mobile-logout-btn');
        
        logoutButtons.forEach(button => {
            if (button) {
                console.log('Setting up logout button:', button.id);
                
                button.addEventListener('click', async function(e) {
                    e.preventDefault();
                    console.log('Logout button clicked');
                    
                    try {
                        // Sign out using Supabase
                        const { error } = await supabaseClient.auth.signOut();
                        
                        if (error) {
                            console.error('Error signing out:', error);
                            alert('There was a problem signing out. Please try again.');
                        } else {
                            console.log('User signed out successfully');
                            
                            // Show success message
                            alert('You have been signed out successfully.');
                            
                            // Redirect to home page
                            window.location.href = 'index.html';
                        }
                    } catch (err) {
                        console.error('Exception during sign out:', err);
                        alert('An unexpected error occurred. Please try again.');
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
