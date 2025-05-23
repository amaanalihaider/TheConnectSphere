document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Supabase client
    const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Function to calculate age from birthdate
    function calculateAge(birthdate) {
        if (!birthdate) return 'N/A';
        
        const birthDate = new Date(birthdate);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
    
    // Function to get random profile images
    function getRandomImage() {
        const images = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
        ];
        
        return images[Math.floor(Math.random() * images.length)];
    }
    
    // Function to create a profile card from database profile
    function createProfileCard(profile) {
        // Calculate age from birthdate
        const age = calculateAge(profile.birthdate);
        
        // Create interests tags from array
        let interestTags = '';
        if (profile.interests && profile.interests.length > 0) {
            profile.interests.forEach(interest => {
                interestTags += `<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">${interest}</span>`;
            });
        }
        
        // Create relationship type tags
        if (profile.relationship_types && profile.relationship_types.length > 0) {
            profile.relationship_types.forEach(type => {
                interestTags += `<span class="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">${type}</span>`;
            });
        }
        
        // Create card HTML
        const cardHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105">
                <img src="${getRandomImage()}" alt="Profile Image" class="w-full h-64 object-cover">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xl font-bold text-purple-600">${profile.first_name || 'User'}, ${age}</h3>
                        <span class="text-sm text-gray-500">${profile.city || 'Unknown Location'}</span>
                    </div>
                    <p class="text-gray-600 mb-4">${profile.bio || 'No bio available'}</p>
                    <div class="flex flex-wrap gap-2">
                        ${interestTags}
                    </div>
                    <button class="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2 rounded-md hover:shadow-lg transition duration-300">
                        Connect
                    </button>
                </div>
            </div>
        `;
        
        return cardHTML;
    }
    
    // Setup connect buttons event handlers
    function setupConnectButtons() {
        const connectButtons = document.querySelectorAll('button.bg-gradient-to-r');
        
        connectButtons.forEach(button => {
            if (!button.hasAttribute('data-initialized')) {
                button.setAttribute('data-initialized', 'true');
                button.addEventListener('click', function() {
                    // Mock connection functionality
                    const profileName = this.closest('.p-6').querySelector('h3').textContent;
                    alert(`Connection request sent to ${profileName}! They will be notified of your interest.`);
                    
                    // Change button text
                    this.textContent = 'Request Sent';
                    this.disabled = true;
                    this.classList.add('opacity-75');
                });
            }
        });
    }
    
    // Function to setup search and filter functionality
    function setupSearchAndFilters() {
        const searchInput = document.getElementById('profile-search');
        const searchBtn = document.getElementById('search-btn');
        const profileCards = document.querySelectorAll('#profiles-grid > div.bg-white');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', function() {
                const searchTerm = searchInput.value.toLowerCase();
                
                // Simple search implementation (front-end only)
                profileCards.forEach(card => {
                    const name = card.querySelector('h3').textContent.toLowerCase();
                    const city = card.querySelector('span.text-gray-500').textContent.toLowerCase();
                    const description = card.querySelector('p.text-gray-600').textContent.toLowerCase();
                    const tags = Array.from(card.querySelectorAll('span.rounded-full')).map(tag => tag.textContent.toLowerCase());
                    
                    // Check if any field contains the search term
                    const matchesSearch = 
                        name.includes(searchTerm) || 
                        city.includes(searchTerm) || 
                        description.includes(searchTerm) || 
                        tags.some(tag => tag.includes(searchTerm));
                    
                    // Show/hide based on search match
                    if (matchesSearch || searchTerm === '') {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
            
            // Allow search on Enter key
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    searchBtn.click();
                }
            });
        }
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const cityFilter = document.getElementById('city-filter');
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function() {
                // Reset all checkboxes
                filterCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Reset city select
                if (cityFilter) {
                    cityFilter.value = '';
                }
                
                // Reset search
                if (searchInput) {
                    searchInput.value = '';
                }
                
                // Show all profiles
                profileCards.forEach(card => {
                    card.classList.remove('hidden');
                });
            });
        }
    }
    
    // Function to fetch profiles from Supabase
    async function fetchProfiles() {
        try {
            const { data: profiles, error } = await supabaseClient
                .from('profiles')
                .select('*');
                
            if (error) {
                console.error('Error fetching profiles:', error);
                return;
            }
            
            if (profiles && profiles.length > 0) {
                const profilesGrid = document.getElementById('profiles-grid');
                
                // Add real profiles from database at the beginning
                profiles.forEach(profile => {
                    profilesGrid.insertAdjacentHTML('afterbegin', createProfileCard(profile));
                });
                
                console.log(`Added ${profiles.length} real profiles from the database`);
                
                // Re-initialize the event listeners for the new cards
                setupConnectButtons();
            }
        } catch (err) {
            console.error('Error fetching profiles:', err);
        }
    }
    
    // Initialize everything
    setupConnectButtons();
    setupSearchAndFilters();
    fetchProfiles();
    
    // Initialize AOS animations
    AOS.init();
});
