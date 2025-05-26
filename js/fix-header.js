// Fix for header visibility issue
document.addEventListener('DOMContentLoaded', function() {
    // Get the header element
    const header = document.getElementById('header');
    
    if (header) {
        // Make sure the header is visible
        header.style.display = 'block';
        header.style.visibility = 'visible';
        header.style.opacity = '1';
        
        // Remove any classes that might be hiding it
        header.classList.remove('hidden');
        
        console.log('Header visibility fix applied');
    } else {
        console.error('Header element not found');
    }
    
    // Fix for mobile menu button
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            console.log('Mobile menu toggled');
        });
    }
});
