// Authentication navigation helper

// Local implementation of checkAuthState function
function checkAuthState(callback) {
    if (!supabaseClient) {
        console.error('Supabase client not available');
        callback({ isAuthenticated: false, user: null });
        return;
    }
    
    supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) {
            console.error('Error checking auth state:', error);
            callback({ isAuthenticated: false, user: null });
            return;
        }
        
        if (data && data.session) {
            supabaseClient.auth.getUser().then(({ data: userData, error: userError }) => {
                if (userError) {
                    console.error('Error getting user data:', userError);
                    callback({ isAuthenticated: false, user: null });
                    return;
                }
                
                callback({ isAuthenticated: true, user: userData.user });
            });
        } else {
            callback({ isAuthenticated: false, user: null });
        }
    }).catch(err => {
        console.error('Unexpected error in checkAuthState:', err);
        callback({ isAuthenticated: false, user: null });
    });
}

// Initialize auth navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth navigation initialization started');
    
    // Initially make all non-auth elements visible and auth elements hidden
    // This prevents the flash of incorrect state
    const initialAuthElements = document.querySelectorAll('.auth-link');
    const initialNonAuthElements = document.querySelectorAll('.non-auth-link');
    const loginBtn = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const authLinks = document.querySelector('.auth-links');
    const nonAuthLinks = document.querySelector('.non-auth-links');
    
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
    
    // Handle new navigation containers
    if (authLinks) {
        authLinks.classList.add('hidden');
        authLinks.style.display = 'none';
    }
    
    if (nonAuthLinks) {
        nonAuthLinks.classList.remove('hidden');
        nonAuthLinks.style.display = 'flex';
    }
    
    // Wait a short time to ensure all scripts are loaded
    setTimeout(function() {
        // Check if supabaseClient is available
        if (typeof supabaseClient === 'undefined') {
            console.error('Supabase client not loaded properly');
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
                
                // Handle new navigation elements
                const nonAuthLinks = document.querySelector('.non-auth-links');
                const authLinks = document.querySelector('.auth-links');
                
                if (nonAuthLinks) {
                    nonAuthLinks.classList.add('hidden');
                    nonAuthLinks.style.display = 'none';
                    console.log('Non-auth links container hidden');
                }
                
                if (authLinks) {
                    authLinks.classList.remove('hidden');
                    authLinks.style.display = 'flex';
                    console.log('Auth links container shown');
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
                
                // Handle new navigation elements
                const nonAuthLinks = document.querySelector('.non-auth-links');
                const authLinks = document.querySelector('.auth-links');
                
                if (nonAuthLinks) {
                    nonAuthLinks.classList.remove('hidden');
                    nonAuthLinks.style.display = 'flex';
                    console.log('Non-auth links container shown');
                }
                
                if (authLinks) {
                    authLinks.classList.add('hidden');
                    authLinks.style.display = 'none';
                    console.log('Auth links container hidden');
                }
            }
            
            // Setup logout functionality if available
            if (typeof setupLogout === 'function') {
                setupLogout();
            }
        });
    }, 300); // Increased delay to ensure scripts are fully loaded
});
