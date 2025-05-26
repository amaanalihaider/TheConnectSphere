// Navigation fix for Sign In button
document.addEventListener('DOMContentLoaded', function() {
    // Fix for Sign In button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Login button clicked - navigating to login page');
            window.location.href = 'login.html';
        });
    }
    
    // Check if user is already logged in
    if (typeof supabaseClient !== 'undefined') {
        supabaseClient.auth.getSession().then(({ data, error }) => {
            if (data && data.session) {
                // User is logged in, show profile button
                const authLinks = document.querySelector('.auth-links');
                const nonAuthLinks = document.querySelector('.non-auth-links');
                
                if (authLinks) {
                    authLinks.classList.remove('hidden');
                    authLinks.style.display = 'block';
                }
                
                if (nonAuthLinks) {
                    nonAuthLinks.classList.add('hidden');
                    nonAuthLinks.style.display = 'none';
                }
                
                console.log('User is logged in, showing profile button');
            }
        });
    }
});
