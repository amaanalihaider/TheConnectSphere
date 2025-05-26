/**
 * Dropdown Menu Script for ConnectSphere
 * Handles the functionality of dropdown menus in the navigation bar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Desktop dropdown
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileDropdownContainer = document.getElementById('profile-dropdown-container');
    
    // Mobile dropdown
    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    const mobileProfileDropdown = document.getElementById('mobile-profile-dropdown');
    
    // Function to show desktop dropdown
    function showDesktopDropdown() {
        profileDropdown.classList.remove('hidden');
        
        // Add event listener to close dropdown when clicking outside
        document.addEventListener('click', closeDesktopDropdownOnClickOutside);
    }
    
    // Function to hide desktop dropdown
    function hideDesktopDropdown() {
        profileDropdown.classList.add('hidden');
        
        // Remove event listener when dropdown is closed
        document.removeEventListener('click', closeDesktopDropdownOnClickOutside);
    }
    
    // Function to close dropdown when clicking outside
    function closeDesktopDropdownOnClickOutside(event) {
        if (!profileDropdownContainer.contains(event.target)) {
            hideDesktopDropdown();
        }
    }
    
    // Toggle desktop dropdown on click
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (profileDropdown.classList.contains('hidden')) {
                showDesktopDropdown();
            } else {
                hideDesktopDropdown();
            }
        });
    }
    
    // Toggle mobile dropdown on click
    if (mobileProfileBtn) {
        mobileProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (mobileProfileDropdown.classList.contains('hidden')) {
                mobileProfileDropdown.classList.remove('hidden');
            } else {
                mobileProfileDropdown.classList.add('hidden');
            }
        });
    }
    
    // Update auth-related elements visibility
    function updateAuthUI() {
        // If auth.js has already set up the auth links, we need to update our new elements
        const authLinks = document.querySelectorAll('.auth-link');
        const nonAuthLinks = document.querySelectorAll('.non-auth-link');
        
        // Check if user is logged in (this is a simplified check, actual implementation depends on your auth system)
        const isLoggedIn = authLinks.length > 0 && !authLinks[0].classList.contains('hidden');
        
        // Update dropdown container visibility
        if (profileDropdownContainer) {
            if (isLoggedIn) {
                profileDropdownContainer.classList.remove('hidden');
            } else {
                profileDropdownContainer.classList.add('hidden');
            }
        }
        
        // Update mobile profile section visibility
        const mobileProfileSection = document.getElementById('mobile-profile-section');
        if (mobileProfileSection) {
            if (isLoggedIn) {
                mobileProfileSection.classList.remove('hidden');
            } else {
                mobileProfileSection.classList.add('hidden');
            }
        }
    }
    
    // Call updateAuthUI when DOM is loaded
    updateAuthUI();
    
    // Also call updateAuthUI when auth state changes (if your auth system supports events)
    document.addEventListener('authStateChanged', updateAuthUI);
    
    // Fallback: Check auth state periodically
    setInterval(updateAuthUI, 1000);
});
