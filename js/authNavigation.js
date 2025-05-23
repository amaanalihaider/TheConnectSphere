// Authentication navigation helper
// Using the global auth functions

// Initialize auth navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth navigation initialization started');
    
    // Initially make all non-auth elements visible and auth elements hidden
    // This prevents the flash of incorrect state
    const initialAuthElements = document.querySelectorAll('.auth-link');
    const initialNonAuthElements = document.querySelectorAll('.non-auth-link');
    const loginBtn = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    
    // Hide all auth elements by default
    initialAuthElements.forEach(el => {
        el.classList.add('hidden');
        el.style.display = 'none';
    });
    
    // Show all non-auth elements by default
    initialNonAuthElements.forEach(el => {
        el.classList.remove('hidden');
        el.style.display = 'inline-block';
    });
    
    // Explicitly ensure login buttons are visible
    if (loginBtn) {
        loginBtn.classList.remove('hidden');
        loginBtn.setAttribute('style', 'display: inline-block !important');
    }
    
    if (mobileLoginBtn) {
        mobileLoginBtn.classList.remove('hidden');
        mobileLoginBtn.setAttribute('style', 'display: block !important');
    }
    
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
        checkAuthState(function(authState) {
            console.log('Auth state checked:', authState);
            
            // Get auth-related elements
            const authElements = document.querySelectorAll('.auth-link');
            const nonAuthElements = document.querySelectorAll('.non-auth-link');
            const profileBtn = document.getElementById('profile-btn');
            const loginBtn = document.getElementById('login-btn');
            
            // Update UI based on auth state
            if (authState.isAuthenticated) {
                console.log('User is authenticated, showing auth elements');
                
                // Show authenticated elements
                authElements.forEach(el => {
                    el.classList.remove('hidden');
                    el.style.display = 'inline-block'; // Use inline-block instead of block for better alignment
                });
                
                // Hide non-authenticated elements
                nonAuthElements.forEach(el => {
                    el.classList.add('hidden');
                    el.style.display = 'none';
                });
                
                // Ensure profile button is visible
                if (profileBtn) {
                    profileBtn.classList.remove('hidden');
                    profileBtn.style.display = 'inline-block';
                    console.log('Profile button should be visible now');
                }
                
                // Ensure login button is hidden
                if (loginBtn) {
                    loginBtn.classList.add('hidden');
                    loginBtn.style.display = 'none';
                    console.log('Login button hidden');
                }
            } else {
                console.log('User is not authenticated, hiding auth elements');
                
                // Hide authenticated elements
                authElements.forEach(el => {
                    el.classList.add('hidden');
                    el.style.display = 'none';
                });
                
                // Show non-authenticated elements
                nonAuthElements.forEach(el => {
                    el.classList.remove('hidden');
                    el.style.display = 'inline-block';
                });
                
                // Ensure login button is visible with !important to override any other styles
                if (loginBtn) {
                    loginBtn.classList.remove('hidden');
                    loginBtn.setAttribute('style', 'display: inline-block !important');
                    console.log('Login button should be visible now with important flag');
                }
                
                // Also ensure mobile login button is visible
                const mobileLoginBtn = document.getElementById('mobile-login-btn');
                if (mobileLoginBtn) {
                    mobileLoginBtn.classList.remove('hidden');
                    mobileLoginBtn.setAttribute('style', 'display: block !important');
                    console.log('Mobile login button should be visible now');
                }
            }
            
            // Setup logout functionality if available
            if (typeof setupLogout === 'function') {
                setupLogout();
            }
        });
    }, 300); // Increased delay to ensure scripts are fully loaded
});
