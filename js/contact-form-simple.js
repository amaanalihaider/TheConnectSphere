// Simple Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Get Supabase client from global variable
        const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
        
        // Create a new Supabase client directly
        const supabase = supabaseClient(supabaseUrl, supabaseKey);
        
        // Add success and error message elements
        const formContainer = contactForm.parentElement;
        
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded';
        successMessage.style.display = 'none';
        successMessage.innerHTML = '<p class="font-bold">Success!</p><p>Your message has been sent successfully. We\'ll get back to you soon.</p>';
        formContainer.insertBefore(successMessage, contactForm);
        
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded';
        errorMessage.style.display = 'none';
        errorMessage.innerHTML = '<p class="font-bold">Error!</p><p>There was a problem sending your message. Please try again later.</p>';
        formContainer.insertBefore(errorMessage, contactForm);
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center';
        loadingIndicator.style.display = 'none';
        loadingIndicator.innerHTML = `
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            <span class="ml-2 text-purple-700">Sending...</span>
        `;
        contactForm.style.position = 'relative';
        contactForm.appendChild(loadingIndicator);
        
        // Handle form submission
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Hide previous messages
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            
            // Get form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Validate form data
            if (!name || !email || !subject || !message) {
                errorMessage.innerHTML = '<p class="font-bold">Error!</p><p>Please fill in all fields.</p>';
                errorMessage.style.display = 'block';
                return;
            }
            
            if (!isValidEmail(email)) {
                errorMessage.innerHTML = '<p class="font-bold">Error!</p><p>Please enter a valid email address.</p>';
                errorMessage.style.display = 'block';
                return;
            }
            
            // Show loading indicator
            loadingIndicator.style.display = 'flex';
            
            try {
                // Store in local storage temporarily (for demo purposes)
                const contactData = {
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    created_at: new Date().toISOString()
                };
                
                // Store in local storage as a fallback
                const storedContacts = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
                storedContacts.push(contactData);
                localStorage.setItem('contactSubmissions', JSON.stringify(storedContacts));
                
                // Try to store in Supabase if available
                if (supabase) {
                    try {
                        const { data, error } = await supabase
                            .from('contact_submissions')
                            .insert([contactData]);
                            
                        if (error) {
                            console.warn('Supabase storage failed, using local storage as fallback:', error);
                        } else {
                            console.log('Contact form data stored in Supabase:', data);
                        }
                    } catch (err) {
                        console.warn('Error with Supabase, using local storage as fallback:', err);
                    }
                }
                
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
                
                // Show success message
                successMessage.style.display = 'block';
                
                // Reset form
                contactForm.reset();
                
            } catch (error) {
                console.error('Error submitting form:', error);
                
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
                
                // Show error message
                errorMessage.style.display = 'block';
            }
        });
    }
    
    // Helper function to validate email
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Simple Supabase client function
    function supabaseClient(url, key) {
        try {
            if (window.supabase) {
                return window.supabase.createClient(url, key);
            } else if (window.supabaseClient) {
                return window.supabaseClient;
            } else {
                console.warn('Supabase library not found, will use local storage fallback');
                return null;
            }
        } catch (error) {
            console.error('Error creating Supabase client:', error);
            return null;
        }
    }
});
