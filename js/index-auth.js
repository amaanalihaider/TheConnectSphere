// Initialize auth functionality for index page
document.addEventListener('DOMContentLoaded', function() {
    // Check if auth.js is loaded and setup logout functionality
    if (typeof setupLogout === 'function') {
        // Set up logout confirmation dialog
        setupLogout();
        console.log('Logout functionality initialized');
    } else {
        console.error('Auth.js not loaded properly - setupLogout function not found');
    }
});
