// Contact Form Handler using Supabase Edge Functions
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Clear any existing UI elements to prevent duplication
        const formContainer = contactForm.parentElement;
        
        // Remove existing messages if they exist
        const existingSuccess = document.getElementById('contact-success-message');
        const existingError = document.getElementById('contact-error-message');
        const existingSpinner = document.getElementById('contact-loading-spinner');
        
        if (existingSuccess) existingSuccess.remove();
        if (existingError) existingError.remove();
        if (existingSpinner) existingSpinner.remove();
        
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.id = 'contact-success-message';
        successMessage.className = 'success-message';
        successMessage.innerHTML = '<p><strong>Thank you!</strong> Your message has been sent successfully. We\'ll respond as soon as possible.</p>';
        successMessage.style.display = 'none';
        formContainer.prepend(successMessage);
        
        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.id = 'contact-error-message';
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = '<p><strong>Oops!</strong> There was a problem sending your message. Please try again later.</p>';
        errorMessage.style.display = 'none';
        formContainer.prepend(errorMessage);
        
        // Create loading spinner element
        const loadingSpinner = document.createElement('div');
        loadingSpinner.id = 'contact-loading-spinner';
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.innerHTML = '<div class="spinner-border"></div><p>Sending your message...</p>';
        loadingSpinner.style.position = 'absolute';
        loadingSpinner.style.top = '0';
        loadingSpinner.style.left = '0';
        loadingSpinner.style.right = '0';
        loadingSpinner.style.bottom = '0';
        loadingSpinner.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        loadingSpinner.style.display = 'none';
        loadingSpinner.style.flexDirection = 'column';
        loadingSpinner.style.alignItems = 'center';
        loadingSpinner.style.justifyContent = 'center';
        loadingSpinner.style.zIndex = '10';
        contactForm.style.position = 'relative';
        contactForm.appendChild(loadingSpinner);

        // Get Supabase client for Edge Function
        const getSupabaseClient = () => {
            if (window.supabaseClient) {
                console.log('Contact form: Using existing supabaseClient');
                return window.supabaseClient;
            }
            
            if (typeof supabase !== 'undefined') {
                const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
                const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
                console.log('Contact form: Creating new Supabase client');
                const client = supabase.createClient(supabaseUrl, supabaseKey);
                window.supabaseClient = client;
                console.log('Contact form: Supabase client created successfully');
                return client;
            }
            
            throw new Error('Supabase library not available');
        };

        // Submit form directly to the database now that RLS is disabled
        const submitContactForm = async (contactData) => {
            try {
                const client = getSupabaseClient();
                console.log('Submitting to contact_submissions table:', contactData);
                
                // Insert directly into the database table
                const { data, error } = await client
                    .from('contact_submissions')
                    .insert([contactData]);
                
                if (error) {
                    console.error('Error inserting into database:', error);
                    throw error;
                }
                
                console.log('Form submission saved to database successfully');
                return { data, error: null };
            } catch (err) {
                console.error('Error submitting form:', err);
                return { data: null, error: err };
            }
        };

        // Handle form submission
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Hide any existing messages
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            
            // Form validation
            let valid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            
            // Validate name
            if (!name.value.trim()) {
                valid = false;
                name.classList.add('border-red-500');
            } else {
                name.classList.remove('border-red-500');
            }
            
            // Validate email
            if (!email.value.trim() || !isValidEmail(email.value)) {
                valid = false;
                email.classList.add('border-red-500');
            } else {
                email.classList.remove('border-red-500');
            }
            
            // Validate subject
            if (!subject.value.trim()) {
                valid = false;
                subject.classList.add('border-red-500');
            } else {
                subject.classList.remove('border-red-500');
            }
            
            // Validate message
            if (!message.value.trim()) {
                valid = false;
                message.classList.add('border-red-500');
            } else {
                message.classList.remove('border-red-500');
            }
            
            if (valid) {
                // Show loading spinner
                loadingSpinner.style.display = 'flex';
                
                try {
                    // Prepare contact data
                    const contactData = {
                        name: name.value.trim(),
                        email: email.value.trim(),
                        subject: subject.value.trim(),
                        message: message.value.trim(),
                        created_at: new Date().toISOString()
                    };
                    
                    // Submit form to database
                    const { data, error } = await submitContactForm(contactData);
                    console.log('Database submission result:', { data, error });
                    
                    // Hide loading spinner
                    loadingSpinner.style.display = 'none';
                    
                    if (error) {
                        console.error('Error submitting contact form:', error);
                        errorMessage.innerHTML = `<p><strong>Oops!</strong> ${error.message || 'There was a problem sending your message. Please try again later.'}</p>`;
                        errorMessage.style.display = 'block';
                    } else {
                        // Success! Show success message and reset form
                        successMessage.style.display = 'block';
                        contactForm.reset();
                    }
                } catch (err) {
                    // Hide loading spinner
                    loadingSpinner.style.display = 'none';
                    
                    // Show error message
                    console.error('Unexpected error in contact form submission:', err);
                    errorMessage.innerHTML = `<p><strong>Oops!</strong> ${err.message || 'An unexpected error occurred. Please try again later.'}</p>`;
                    errorMessage.style.display = 'block';
                }
            } else {
                // Show validation error
                errorMessage.innerHTML = '<p><strong>Oops!</strong> Please fill in all required fields correctly.</p>';
                errorMessage.style.display = 'block';
            }
        });
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});
