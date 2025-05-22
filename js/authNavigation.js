// Authentication navigation helper
// Using the global auth functions

// Initialize auth navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short time to ensure all scripts are loaded
    setTimeout(function() {
        // Check if supabaseClient is available
        if (typeof supabaseClient === 'undefined') {
            console.error('Supabase client not loaded properly');
            return;
        }
        
        // Check if auth functions are available
        if (typeof checkAuthState !== 'function') {
            console.error('Auth functions not loaded properly');
            return;
        }
        
        // First check auth state directly
        checkAuthState(function({ isAuthenticated }) {
            // Update UI based on auth state
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
            
            // Setup logout functionality if available
            if (typeof setupLogout === 'function') {
                setupLogout();
            }
        });
    }, 100); // Small delay to ensure scripts are loaded
});
