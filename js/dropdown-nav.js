document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
    
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Mobile dropdown toggles
    const mobileDropdownButtons = document.querySelectorAll('.mobile-dropdown-button');
    
    mobileDropdownButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('hidden');
            
            // Toggle icon rotation
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });
    });
    
    // Scroll behavior
    window.addEventListener('scroll', function() {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Profile dropdown toggle (for desktop)
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn && profileDropdown) {
        // For touch devices
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (profileDropdown.classList.contains('show') && 
                !profileBtn.contains(e.target) && 
                !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }
});
