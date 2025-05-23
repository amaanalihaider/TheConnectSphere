document.addEventListener('DOMContentLoaded', function() {
    console.log('Find Yourself One Page - Search & Filter Functionality Initialized');
    
    // Define a global function that auth-guard.js can call to initialize features
    // that require authentication
    window.initializeAuthenticatedFeatures = function() {
        console.log('Initializing authenticated features');
        fetchProfiles();
    };
    
    // Update navigation based on authentication status
    const updateNavigation = async () => {
        try {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            
            // Get navigation elements
            const signupButton = document.querySelector('a[href="signup.html"]');
            const loginButton = document.querySelector('a[href="login.html"]');
            const logoutButton = document.querySelector('.logout-button');
            
            if (user) {
                // User is signed in, hide signup/login buttons
                if (signupButton) signupButton.style.display = 'none';
                if (loginButton) loginButton.style.display = 'none';
                if (logoutButton) logoutButton.style.display = 'block';
            } else {
                // User is not signed in
                if (signupButton) signupButton.style.display = 'block';
                if (loginButton) loginButton.style.display = 'block';
                if (logoutButton) logoutButton.style.display = 'none';
            }
        } catch (err) {
            console.error('Error updating navigation:', err);
        }
    };
    
    // Update navigation
    updateNavigation();
    
    // Initialize the Supabase client
    const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    // Store all profiles to enable client-side filtering
    let allProfiles = [];
    
    // Current filter state
    let filterState = {
        searchTerm: '',
        ageRanges: [],
        city: '',
        interests: [],
        relationshipTypes: []
    };
    
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
    
    // Format interests array to display nicely
    function formatInterests(interests) {
        if (!interests || interests.length === 0) return 'Not specified';
        
        return interests.join(', ');
    }
    
    // Function to create a profile card
    function createProfileCard(profile) {
        // Calculate age from birthdate
        const age = typeof calculateAge(profile.birthdate) === 'number' 
            ? calculateAge(profile.birthdate) 
            : 'N/A';
        
        // Format interests
        const interests = formatInterests(profile.interests);
        
        // Format relationship types
        const relationshipTypes = profile.relationship_types && profile.relationship_types.length > 0 
            ? profile.relationship_types.join(', ') 
            : 'Not specified';
        
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105" data-aos="fade-up">
                <div class="relative">
                    <img src="${getRandomImage()}" alt="${profile.first_name}'s profile" class="w-full h-60 object-cover">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h3 class="text-white text-xl font-bold">${profile.first_name} ${profile.last_name || ''}</h3>
                        <p class="text-white text-sm">${profile.city || 'Location not specified'}, ${age} years</p>
                    </div>
                </div>
                
                <div class="p-4">
                    <div class="mb-3">
                        <h4 class="font-medium text-gray-700 mb-1">Bio</h4>
                        <p class="text-gray-600 text-sm">${profile.bio || 'No bio provided'}</p>
                    </div>
                    
                    <div class="mb-3">
                        <h4 class="font-medium text-gray-700 mb-1">Interests</h4>
                        <p class="text-gray-600 text-sm">${interests}</p>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-medium text-gray-700 mb-1">Looking For</h4>
                        <p class="text-gray-600 text-sm">${relationshipTypes}</p>
                    </div>
                    
                    <button class="connect-btn w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-md hover:shadow-lg transition duration-300" data-profile-id="${profile.id}">
                        Connect with ${profile.first_name}
                    </button>
                </div>
            </div>
        `;
    }
    
    // Function to handle connect button clicks
    function setupConnectButtons() {
        const connectButtons = document.querySelectorAll('.connect-btn');
        
        connectButtons.forEach(button => {
            button.addEventListener('click', function() {
                const profileId = this.getAttribute('data-profile-id');
                console.log(`Connect requested with profile ID: ${profileId}`);
                
                // For now, just show an alert
                alert(`Connection request sent to profile ID: ${profileId}`);
            });
        });
    }
    
    // Apply filters to profiles
    function applyFilters() {
        console.log('Applying filters with state:', filterState);
        
        // If we don't have profiles, don't do anything
        if (!allProfiles || allProfiles.length === 0) {
            console.log('No profiles available to filter');
            return;
        }
        
        // Filter profiles based on current filter state
        const filteredProfiles = allProfiles.filter(profile => {
            // Search term filter (name, city, interests, bio)
            if (filterState.searchTerm) {
                const searchTerm = filterState.searchTerm.toLowerCase();
                const firstName = (profile.first_name || '').toLowerCase();
                const lastName = (profile.last_name || '').toLowerCase();
                const city = (profile.city || '').toLowerCase();
                const bio = (profile.bio || '').toLowerCase();
                
                // Check interests array
                let interestsMatch = false;
                if (profile.interests && profile.interests.length > 0) {
                    interestsMatch = profile.interests.some(interest => 
                        interest.toLowerCase().includes(searchTerm)
                    );
                }
                
                if (!firstName.includes(searchTerm) && 
                    !lastName.includes(searchTerm) && 
                    !city.includes(searchTerm) && 
                    !bio.includes(searchTerm) && 
                    !interestsMatch) {
                    return false;
                }
            }
            
            // City filter
            if (filterState.city && profile.city !== filterState.city) {
                return false;
            }
            
            // Age range filter
            if (filterState.ageRanges.length > 0) {
                const age = calculateAge(profile.birthdate);
                if (typeof age === 'number') {
                    let ageMatches = false;
                    
                    for (const range of filterState.ageRanges) {
                        if (range === '20-30' && age >= 20 && age <= 30) {
                            ageMatches = true;
                            break;
                        } else if (range === '30-40' && age >= 30 && age <= 40) {
                            ageMatches = true;
                            break;
                        } else if (range === '40+' && age >= 40) {
                            ageMatches = true;
                            break;
                        }
                    }
                    
                    if (!ageMatches) return false;
                }
            }
            
            // Interests filter
            if (filterState.interests.length > 0 && profile.interests) {
                let hasInterest = false;
                
                for (const interest of filterState.interests) {
                    if (profile.interests.includes(interest)) {
                        hasInterest = true;
                        break;
                    }
                }
                
                if (!hasInterest) return false;
            }
            
            // Relationship type filter
            if (filterState.relationshipTypes.length > 0 && profile.relationship_types) {
                let hasRelationshipType = false;
                
                for (const type of filterState.relationshipTypes) {
                    if (profile.relationship_types.includes(type)) {
                        hasRelationshipType = true;
                        break;
                    }
                }
                
                if (!hasRelationshipType) return false;
            }
            
            // If all filters pass, include this profile
            return true;
        });
        
        console.log(`Filtered from ${allProfiles.length} to ${filteredProfiles.length} profiles`);
        
        // Display the filtered profiles
        displayProfiles(filteredProfiles);
    }
    
    // Display profiles in the grid
    function displayProfiles(profiles) {
        const profilesGrid = document.getElementById('profiles-grid');
        if (!profilesGrid) {
            console.error('Profiles grid not found');
            return;
        }
        
        // Clear existing profiles
        profilesGrid.innerHTML = '';
        
        // Show no results message if no profiles
        if (profiles.length === 0) {
            profilesGrid.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    <i class="fas fa-search text-purple-500 text-3xl mb-3"></i>
                    <p>No profiles match your filters. Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }
        
        // Add profiles to the grid
        profiles.forEach(profile => {
            profilesGrid.insertAdjacentHTML('beforeend', createProfileCard(profile));
        });
        
        // Set up connect buttons
        setupConnectButtons();
    }
    
    // Fetch profiles from database or use mock data for testing
    async function fetchProfiles() {
        try {
            // Show loading state
            const profilesGrid = document.getElementById('profiles-grid');
            if (profilesGrid) {
                profilesGrid.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-500">
                        <i class="fas fa-circle-notch fa-spin text-purple-500 text-3xl mb-3"></i>
                        <p>Loading profiles...</p>
                    </div>
                `;
            }
            
            // First try to fetch from Supabase
            let profiles = [];
            
            try {
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .select('*');
                    
                if (error) {
                    throw error;
                }
                
                if (data && data.length > 0) {
                    profiles = data;
                    console.log(`Successfully fetched ${profiles.length} profiles from Supabase`);
                } else {
                    console.log('No profiles found in Supabase, using mock data');
                    // Fall back to mock data
                    profiles = getMockProfiles();
                }
            } catch (supabaseError) {
                console.warn('Supabase fetch failed, using mock data:', supabaseError);
                // Fall back to mock data
                profiles = getMockProfiles();
            }
            
            // Store all profiles for filtering
            allProfiles = profiles;
            
            // Apply any existing filters
            applyFilters();
            
        } catch (err) {
            console.error('Error fetching profiles:', err);
            
            // Display error message
            const profilesGrid = document.getElementById('profiles-grid');
            if (profilesGrid) {
                profilesGrid.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-500">
                        <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
                        <p>Error loading profiles. Please try again later.</p>
                    </div>
                `;
            }
        }
    }
    
    // Function to get mock profiles for testing
    function getMockProfiles() {
        return [
            {
                id: '1',
                first_name: 'John',
                last_name: 'Doe',
                birthdate: '1990-05-15',
                city: 'New York',
                bio: 'I love hiking and outdoor adventures. Looking to meet someone with similar interests.',
                interests: ['Travel', 'Hiking', 'Photography', 'Music'],
                relationship_types: ['Serious', 'Casual']
            },
            {
                id: '2',
                first_name: 'Jane',
                last_name: 'Smith',
                birthdate: '1988-12-10',
                city: 'Los Angeles',
                bio: 'Tech enthusiast and coffee lover. I enjoy quiet evenings and meaningful conversations.',
                interests: ['Technology', 'Coffee', 'Reading', 'Art'],
                relationship_types: ['Serious']
            },
            {
                id: '3',
                first_name: 'Michael',
                last_name: 'Brown',
                birthdate: '1995-08-22',
                city: 'Chicago',
                bio: 'Musician and foodie. Always looking for new restaurants to try!',
                interests: ['Music', 'Food', 'Concerts', 'Cooking'],
                relationship_types: ['Friendship', 'Casual']
            },
            {
                id: '4',
                first_name: 'Emily',
                last_name: 'Johnson',
                birthdate: '1992-03-30',
                city: 'San Francisco',
                bio: 'Software engineer who loves climbing and yoga. Looking for adventure buddies!',
                interests: ['Technology', 'Climbing', 'Yoga', 'Travel'],
                relationship_types: ['Friendship', 'Serious']
            },
            {
                id: '5',
                first_name: 'David',
                last_name: 'Wilson',
                birthdate: '1985-11-05',
                city: 'Seattle',
                bio: 'Coffee shop owner and book lover. I enjoy rainy days and philosophical discussions.',
                interests: ['Coffee', 'Reading', 'Philosophy', 'Art'],
                relationship_types: ['Serious']
            },
            {
                id: '6',
                first_name: 'Sarah',
                last_name: 'Taylor',
                birthdate: '1993-07-17',
                city: 'Miami',
                bio: 'Beach lover and fitness enthusiast. Looking for someone to share adventures with.',
                interests: ['Beach', 'Fitness', 'Travel', 'Dancing'],
                relationship_types: ['Casual', 'Friendship']
            }
        ];
    }
    
    // Set up search and filter functionality
    function setupSearchAndFilters() {
        console.log('Setting up search and filters');
        
        // Get all filter elements
        const searchInput = document.getElementById('profile-search');
        const searchButton = document.getElementById('search-btn');
        const searchForm = document.getElementById('search-form');
        const cityFilter = document.getElementById('city-filter');
        const clearFiltersButton = document.getElementById('clear-filters');
        
        // Log elements for debugging
        console.log('Search elements:', { 
            searchInput: !!searchInput, 
            searchButton: !!searchButton,
            searchForm: !!searchForm,
            cityFilter: !!cityFilter,
            clearFiltersButton: !!clearFiltersButton
        });
        
        // Age range checkboxes
        const age2030Checkbox = document.getElementById('age-20-30');
        const age3040Checkbox = document.getElementById('age-30-40');
        const age40PlusCheckbox = document.getElementById('age-40-plus');
        
        // Interest checkboxes
        const interestCheckboxes = [
            { id: 'interest-travel', value: 'Travel' },
            { id: 'interest-music', value: 'Music' },
            { id: 'interest-food', value: 'Food' },
            { id: 'interest-sports', value: 'Sports' },
            { id: 'interest-tech', value: 'Technology' },
            { id: 'interest-art', value: 'Art' }
        ];
        
        // Relationship type checkboxes
        const relationshipCheckboxes = [
            { id: 'type-serious', value: 'Serious' },
            { id: 'type-casual', value: 'Casual' },
            { id: 'type-friendship', value: 'Friendship' }
        ];
        
        // Search form submit
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (searchInput) {
                    filterState.searchTerm = searchInput.value.trim().toLowerCase();
                    console.log('Search form submitted with term:', filterState.searchTerm);
                    applyFilters();
                }
            });
        }
        
        // Search input event
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterState.searchTerm = this.value.trim().toLowerCase();
                console.log('Search input changed to:', filterState.searchTerm);
                applyFilters();
            });
        }
        
        // Search button click
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                if (searchInput) {
                    filterState.searchTerm = searchInput.value.trim().toLowerCase();
                    console.log('Search button clicked with term:', filterState.searchTerm);
                    applyFilters();
                }
            });
        }
        
        // City filter change
        if (cityFilter) {
            cityFilter.addEventListener('change', function() {
                filterState.city = this.value;
                console.log('City filter changed to:', filterState.city);
                applyFilters();
            });
        }
        
        // Age range checkboxes
        [
            { el: age2030Checkbox, value: '20-30' },
            { el: age3040Checkbox, value: '30-40' },
            { el: age40PlusCheckbox, value: '40+' }
        ].forEach(item => {
            if (item.el) {
                item.el.addEventListener('change', function() {
                    updateAgeRangeFilters();
                    applyFilters();
                });
            }
        });
        
        // Interest checkboxes
        interestCheckboxes.forEach(item => {
            const checkbox = document.getElementById(item.id);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    updateInterestFilters();
                    applyFilters();
                });
            }
        });
        
        // Relationship type checkboxes
        relationshipCheckboxes.forEach(item => {
            const checkbox = document.getElementById(item.id);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    updateRelationshipTypeFilters();
                    applyFilters();
                });
            }
        });
        
        // Clear filters button
        if (clearFiltersButton) {
            clearFiltersButton.addEventListener('click', function() {
                console.log('Clear filters button clicked');
                resetAllFilters();
            });
        }
        
        // Helper function to update age range filters
        function updateAgeRangeFilters() {
            filterState.ageRanges = [];
            
            if (age2030Checkbox && age2030Checkbox.checked) {
                filterState.ageRanges.push('20-30');
                console.log('Added 20-30 age filter');
            }
            
            if (age3040Checkbox && age3040Checkbox.checked) {
                filterState.ageRanges.push('30-40');
                console.log('Added 30-40 age filter');
            }
            
            if (age40PlusCheckbox && age40PlusCheckbox.checked) {
                filterState.ageRanges.push('40+');
                console.log('Added 40+ age filter');
            }
            
            console.log('Updated age range filters:', filterState.ageRanges);
        }
        
        // Helper function to update interest filters
        function updateInterestFilters() {
            filterState.interests = [];
            
            interestCheckboxes.forEach(item => {
                const checkbox = document.getElementById(item.id);
                if (checkbox && checkbox.checked) {
                    filterState.interests.push(item.value);
                    console.log(`Added ${item.value} interest filter`);
                }
            });
            
            console.log('Updated interest filters:', filterState.interests);
        }
        
        // Helper function to update relationship type filters
        function updateRelationshipTypeFilters() {
            filterState.relationshipTypes = [];
            
            relationshipCheckboxes.forEach(item => {
                const checkbox = document.getElementById(item.id);
                if (checkbox && checkbox.checked) {
                    filterState.relationshipTypes.push(item.value);
                    console.log(`Added ${item.value} relationship type filter`);
                }
            });
            
            console.log('Updated relationship type filters:', filterState.relationshipTypes);
        }
    }
    
    // Reset all filters to default state
    function resetAllFilters() {
        console.log('Resetting all filters');
        
        // Reset filter state
        filterState = {
            searchTerm: '',
            ageRanges: [],
            city: '',
            interests: [],
            relationshipTypes: []
        };
        
        // Reset UI elements
        const searchInput = document.getElementById('profile-search');
        const cityFilter = document.getElementById('city-filter');
        
        if (searchInput) searchInput.value = '';
        if (cityFilter) cityFilter.value = '';
        
        // Uncheck all age checkboxes
        ['age-20-30', 'age-30-40', 'age-40-plus'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
        
        // Uncheck all interest checkboxes
        ['interest-travel', 'interest-music', 'interest-food', 'interest-sports', 'interest-tech', 'interest-art'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
        
        // Uncheck all relationship type checkboxes
        ['type-serious', 'type-casual', 'type-friendship'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
        
        // Apply the reset filters
        applyFilters();
    }
    
    // Initialize everything
    console.log('Initializing search and filter functionality');
    
    // First set up all event listeners
    setupSearchAndFilters();
    
    // Then fetch profiles
    fetchProfiles();
    
    // Set up connect buttons
    setupConnectButtons();
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        console.log('Initializing AOS animations');
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    } else {
        console.warn('AOS library not available');
    }
});
