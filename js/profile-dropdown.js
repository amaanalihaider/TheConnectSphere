// Profile Dropdown Handler
document.addEventListener('DOMContentLoaded', function() {
    // Function to update profile dropdown with user information
    function updateProfileDropdown(user) {
        if (!user) return;
        
        // Get profile dropdown elements
        const profileNameElement = document.querySelector('#profile-dropdown .font-medium.text-gray-800');
        const profileEmailElement = document.querySelector('#profile-dropdown .text-xs.text-gray-500');
        
        if (profileNameElement && profileEmailElement) {
            // Get user information
            const firstName = user.user_metadata?.first_name || '';
            const lastName = user.user_metadata?.last_name || '';
            const fullName = firstName && lastName ? `${firstName} ${lastName}` : 
                             firstName || lastName || user.email?.split('@')[0] || 'User';
            
            // Update profile dropdown with user information
            profileNameElement.textContent = fullName;
            profileEmailElement.textContent = user.email || '';
            
            console.log('Profile dropdown updated with user information');
        }
    }
    
    // Check if supabaseClient is available
    if (typeof supabaseClient !== 'undefined') {
        // Listen for auth state changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Get user data
                supabaseClient.auth.getUser().then(({ data: userData, error }) => {
                    if (error) {
                        console.error('Error getting user data:', error);
                        return;
                    }
                    
                    if (userData && userData.user) {
                        updateProfileDropdown(userData.user);
                    }
                });
            }
        });
        
        // Also check current auth state to update dropdown on page load
        supabaseClient.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error('Error checking session:', error);
                return;
            }
            
            if (data && data.session) {
                supabaseClient.auth.getUser().then(({ data: userData, error: userError }) => {
                    if (userError) {
                        console.error('Error getting user data:', userError);
                        return;
                    }
                    
                    if (userData && userData.user) {
                        updateProfileDropdown(userData.user);
                    }
                });
            }
        });
    } else {
        console.error('Supabase client not available for profile dropdown');
    }
});
