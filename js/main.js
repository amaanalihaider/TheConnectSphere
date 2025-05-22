// Main JavaScript for The ConnectSphere

document.addEventListener('DOMContentLoaded', function() {
    // Navigation Functionality
    const joinNowBtn = document.getElementById('join-now-btn');
    
    // Direct navigation to Sign Up page
    if (joinNowBtn) {
        joinNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Join now button clicked - navigating to Sign Up page');
            window.location.href = 'signup.html';
        });
    }
    
    // No registration or login functionality needed
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Header Scroll Effect
    const header = document.getElementById('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }

    // Testimonial Slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const testimonialPrev = document.querySelector('.testimonial-prev');
    const testimonialNext = document.querySelector('.testimonial-next');
    
    if (testimonialSlides.length > 0) {
        let currentSlide = 0;
        
        // Function to show a specific slide
        function showSlide(index) {
            // Hide all slides
            testimonialSlides.forEach(slide => {
                slide.classList.add('hidden');
            });
            
            // Update dots
            testimonialDots.forEach(dot => {
                dot.classList.remove('bg-purple-600');
                dot.classList.add('bg-gray-300');
            });
            
            // Show current slide and update active dot
            testimonialSlides[index].classList.remove('hidden');
            testimonialDots[index].classList.remove('bg-gray-300');
            testimonialDots[index].classList.add('bg-purple-600');
            
            currentSlide = index;
        }
        
        // Set up dot navigation
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        // Set up prev/next buttons
        if (testimonialPrev && testimonialNext) {
            testimonialPrev.addEventListener('click', () => {
                let newIndex = currentSlide - 1;
                if (newIndex < 0) newIndex = testimonialSlides.length - 1;
                showSlide(newIndex);
            });
            
            testimonialNext.addEventListener('click', () => {
                let newIndex = currentSlide + 1;
                if (newIndex >= testimonialSlides.length) newIndex = 0;
                showSlide(newIndex);
            });
        }
        
        // Auto-advance slides every 5 seconds
        setInterval(() => {
            let newIndex = currentSlide + 1;
            if (newIndex >= testimonialSlides.length) newIndex = 0;
            showSlide(newIndex);
        }, 5000);
    }

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                
                // Toggle active class
                faqItem.classList.toggle('active');
                
                // Toggle icon rotation
                if (icon) {
                    icon.style.transform = faqItem.classList.contains('active') 
                        ? 'rotate(180deg)' 
                        : 'rotate(0)';
                }
                
                // Toggle answer visibility
                if (faqItem.classList.contains('active')) {
                    answer.classList.remove('hidden');
                } else {
                    answer.classList.add('hidden');
                }
            });
        });
        
        // Open first FAQ item by default
        if (faqQuestions.length > 0) {
            faqQuestions[0].click();
        }
    }

    // Form Validation
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            let valid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            
            if (!name.value.trim()) {
                valid = false;
                name.classList.add('border-red-500');
            } else {
                name.classList.remove('border-red-500');
            }
            
            if (!email.value.trim() || !isValidEmail(email.value)) {
                valid = false;
                email.classList.add('border-red-500');
            } else {
                email.classList.remove('border-red-500');
            }
            
            if (!subject.value.trim()) {
                valid = false;
                subject.classList.add('border-red-500');
            } else {
                subject.classList.remove('border-red-500');
            }
            
            if (!message.value.trim()) {
                valid = false;
                message.classList.add('border-red-500');
            } else {
                message.classList.remove('border-red-500');
            }
            
            if (valid) {
                // In a real application, you would send the form data to a server here
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Please fill in all required fields correctly.');
            }
        });
    }

    // Helper function to validate email
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Filter functionality for Find Yourself One page
    if (window.location.pathname.includes('find-yourself-one.html')) {
        // Age range filters
        const ageFilters = document.querySelectorAll('#age-20-30, #age-30-40, #age-40-plus');
        const genderFilters = document.querySelectorAll('#gender-male, #gender-female, #gender-other');
        const prefFilters = document.querySelectorAll('#pref-serious, #pref-casual, #pref-friendship');
        const cityFilter = document.getElementById('city-filter');
        const profileCards = document.querySelectorAll('#profiles-grid > div');
        
        // Function to apply all filters
        function applyFilters() {
            // Get selected age ranges
            const selectedAges = [];
            if (document.getElementById('age-20-30').checked) selectedAges.push('20-30');
            if (document.getElementById('age-30-40').checked) selectedAges.push('30-40');
            if (document.getElementById('age-40-plus').checked) selectedAges.push('40+');
            
            // Get selected genders
            const selectedGenders = [];
            if (document.getElementById('gender-male').checked) selectedGenders.push('male');
            if (document.getElementById('gender-female').checked) selectedGenders.push('female');
            if (document.getElementById('gender-other').checked) selectedGenders.push('other');
            
            // Get selected preferences
            const selectedPrefs = [];
            if (document.getElementById('pref-serious').checked) selectedPrefs.push('serious');
            if (document.getElementById('pref-casual').checked) selectedPrefs.push('casual');
            if (document.getElementById('pref-friendship').checked) selectedPrefs.push('friendship');
            
            // Get selected city
            const selectedCity = cityFilter ? cityFilter.value.toLowerCase() : '';
            
            // Apply filters to each profile card
            profileCards.forEach(card => {
                // Get profile data
                const name = card.querySelector('h3').textContent;
                const age = parseInt(name.split(',')[1].trim());
                const city = card.querySelector('span.text-gray-500').textContent.toLowerCase();
                const tags = Array.from(card.querySelectorAll('span.rounded-full')).map(tag => tag.textContent.toLowerCase());
                
                // Determine age range
                let ageRange = '';
                if (age >= 20 && age <= 30) ageRange = '20-30';
                else if (age > 30 && age <= 40) ageRange = '30-40';
                else if (age > 40) ageRange = '40+';
                
                // Check if profile matches all selected filters
                let matchesAge = selectedAges.length === 0 || selectedAges.includes(ageRange);
                let matchesCity = !selectedCity || city.includes(selectedCity.replace('-', ' '));
                
                // For demo purposes, we'll determine gender based on the profile image
                // In a real app, this would be stored in the profile data
                let gender = 'female';
                if (name.split(',')[0].trim() === 'Michael' || name.split(',')[0].trim() === 'James' || name.split(',')[0].trim() === 'Daniel') {
                    gender = 'male';
                }
                let matchesGender = selectedGenders.length === 0 || selectedGenders.includes(gender);
                
                // Check if any tag matches selected preferences
                let matchesPrefs = selectedPrefs.length === 0 || selectedPrefs.some(pref => tags.includes(pref));
                
                // Show/hide based on all filters
                if (matchesAge && matchesCity && matchesGender && matchesPrefs) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }
        
        // Add event listeners to all filter inputs
        ageFilters.forEach(filter => {
            filter.addEventListener('change', applyFilters);
        });
        
        genderFilters.forEach(filter => {
            filter.addEventListener('change', applyFilters);
        });
        
        prefFilters.forEach(filter => {
            filter.addEventListener('change', applyFilters);
        });
        
        if (cityFilter) {
            cityFilter.addEventListener('change', applyFilters);
        }
    }
});
