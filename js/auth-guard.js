// auth-guard.js - Protects routes that require authentication

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth Guard initialized');
    
    // Initialize the Supabase client
    const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    // Pages that require authentication
    const protectedPages = [
        'find-yourself-one.html',
        'my-profile.html',
        'matches.html'
    ];
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Current page:', currentPage);
    
    // Check if this page requires authentication
    if (protectedPages.includes(currentPage)) {
        console.log('This page requires authentication');
        
        // Get the main content element
        const mainContent = document.querySelector('main');
        if (!mainContent) {
            console.error('Main content element not found');
            return;
        }
        
        // Save the original content
        const originalContent = mainContent.innerHTML;
        
        // Show loading indicator while we check authentication
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-16 text-center">
                <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
                    <i class="fas fa-circle-notch fa-spin text-purple-500 text-3xl mb-3"></i>
                    <p>Checking authentication...</p>
                </div>
            </div>
        `;
        
        // Check if user is logged in
        supabaseClient.auth.getSession().then(({ data }) => {
            const session = data.session;
            
            if (!session) {
                console.log('User not authenticated, showing login message');
                // Show unauthorized message
                mainContent.innerHTML = `
                    <div class="container mx-auto px-4 py-16 text-center">
                        <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto shadow-md">
                            <i class="fas fa-lock text-red-500 text-4xl mb-4"></i>
                            <h2 class="text-2xl font-bold text-red-600 mb-3">Authentication Required</h2>
                            <p class="text-gray-700 mb-6">Please sign in to access this page.</p>
                            <a href="login.html?redirect=${currentPage}" class="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-md hover:shadow-lg transition duration-300 inline-block">
                                Sign In Now
                            </a>
                        </div>
                    </div>
                `;
                
                // Redirect after a brief delay
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=' + currentPage;
                }, 3000);
            } else {
                // User is authenticated, restore original content
                console.log('User is authenticated, showing content');
                mainContent.innerHTML = originalContent;
                
                // Initialize any functionality that depends on authentication
                if (typeof initializeAuthenticatedFeatures === 'function') {
                    initializeAuthenticatedFeatures();
                }
                
                // Update navigation
                updateNavigation(true);
            }
        }).catch(error => {
            console.error('Error checking authentication:', error);
            // Show error message
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-16 text-center">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto shadow-md">
                        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                        <h2 class="text-2xl font-bold text-red-600 mb-3">Authentication Error</h2>
                        <p class="text-gray-700 mb-6">There was an error checking your authentication status. Please try again.</p>
                        <a href="login.html" class="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-md hover:shadow-lg transition duration-300 inline-block">
                            Sign In
                        </a>
                    </div>
                </div>
            `;
        });
    } else {
        // Not a protected page, just update navigation
        updateNavigation();
    }
    
    // Update navigation based on authentication status
    function updateNavigation(isAuthenticated) {
        if (isAuthenticated === undefined) {
            // If not provided, check auth status
            supabaseClient.auth.getSession().then(({ data }) => {
                const session = data.session;
                updateNavButtons(!!session);
            }).catch(error => {
                console.error('Error checking auth for navigation:', error);
                updateNavButtons(false);
            });
        } else {
            // Use provided auth status
            updateNavButtons(isAuthenticated);
        }
    }
    
    // Update navigation buttons based on auth status
    function updateNavButtons(isAuthenticated) {
        // Get navigation elements
        const signupButton = document.querySelector('a[href="signup.html"]');
        const loginButton = document.querySelector('a[href="login.html"]');
        const logoutButton = document.querySelector('.logout-button');
        
        if (isAuthenticated) {
            // User is signed in, hide signup/login buttons
            if (signupButton) signupButton.style.display = 'none';
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            console.log('Navigation updated for authenticated user');
        } else {
            // User is not signed in
            if (signupButton) signupButton.style.display = 'block';
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            console.log('Navigation updated for unauthenticated user');
        }
    }
});
