document.addEventListener('DOMContentLoaded', function() {
    console.log('Subscription page initialized');
    
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Get all subscription buttons
    const subscribeButtons = document.querySelectorAll('.btn-subscribe');
    
    // Add click event to each subscribe button
    subscribeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get plan details from data attributes
            const plan = this.getAttribute('data-plan');
            const price = this.getAttribute('data-price');
            
            // Store plan details in session storage for payment page
            sessionStorage.setItem('selectedPlan', plan);
            sessionStorage.setItem('selectedPrice', price);
            
            console.log(`Selected plan: ${plan}, Price: $${price}`);
            
            // Add animation before redirecting
            button.classList.add('animate-pulse');
            
            // Redirect to payment page after a brief delay
            setTimeout(() => {
                window.location.href = 'payment.html';
            }, 300);
        });
    });
    
    // Check authentication status and update UI accordingly
    async function checkAuthStatus() {
        try {
            const { data } = await supabaseClient.auth.getSession();
            const session = data.session;
            
            if (!session) {
                // User is not logged in, show a message
                const subscribeButtons = document.querySelectorAll('.btn-subscribe');
                
                subscribeButtons.forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Show login required message
                        alert('Please log in to subscribe to a plan.');
                        
                        // Redirect to login page
                        window.location.href = 'login.html?redirect=subscription.html';
                    });
                });
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        }
    }
    
    // Check authentication status
    checkAuthStatus();
});
