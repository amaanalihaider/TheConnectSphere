// Newsletter Subscription Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get the newsletter form
    const newsletterForm = document.querySelector('.footer-newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get the email input
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            // Validate email
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            try {
                // Show loading indicator
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnHtml = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;
                
                // Submit to Supabase
                try {
                    const response = await fetch(`${supabaseClient.supabaseUrl}/rest/v1/newsletter_subscribers`, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseClient.supabaseKey,
                            'Authorization': `Bearer ${supabaseClient.supabaseKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({ email })
                    });
                    
                    if (response.status === 409) {
                        // 409 Conflict - Email already exists
                        showToast('You\'re already subscribed to our newsletter!', 'info');
                        
                        // Reset button
                        submitBtn.innerHTML = originalBtnHtml;
                        submitBtn.disabled = false;
                        return;
                    }
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error subscribing to newsletter');
                    }
                    
                    const data = await response.json();
                    
                    // Success - the webhook will trigger the welcome email
                    showToast('Thanks for subscribing to our newsletter!', 'success');
                    emailInput.value = ''; // Clear the input
                } catch (insertError) {
                    console.error('Error inserting to database:', insertError);
                    showToast('Error subscribing to newsletter. Please try again later.', 'error');
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                    return;
                }
                
                // Reset button
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
                
            } catch (err) {
                console.error('Subscription error:', err);
                showToast('Something went wrong. Please try again later.', 'error');
                
                // Reset button if there was an error
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                submitBtn.disabled = false;
            }
        });
    }
    
    // Helper functions
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showToast(message, type = 'info') {
        // Check if SweetAlert2 is available
        if (typeof Swal !== 'undefined') {
            const toastConfig = {
                text: message,
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                icon: type
            };
            Swal.fire(toastConfig);
        } else {
            // Fallback to alert if SweetAlert2 is not available
            alert(message);
        }
    }
    
    // No longer using sendWelcomeEmail function as this is now handled by the webhook and Edge Function
});
