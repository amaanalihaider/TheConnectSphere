document.addEventListener('DOMContentLoaded', function() {
    console.log('Find Yourself One Page - Search & Filter Functionality Initialized');
    
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
    async function setupConnectButtons() {
        // Initialize the subscription validator
        const validator = new SubscriptionValidator(supabaseClient);
        await validator.initialize();
        
        // Update subscription banner with current connection count
        await updateConnectionBanner(validator);
        
        const connectButtons = document.querySelectorAll('.connect-btn');
        
        connectButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const profileId = this.getAttribute('data-profile-id');
                console.log(`Connect requested with profile ID: ${profileId}`);
                
                // Always force a refresh of subscription data before checking
                await validator.initialize();
                
                // Check if user can create a new connection based on their subscription
                const connectionStatus = await validator.canCreateConnection();
                console.log('Connection status:', connectionStatus);
                
                if (!connectionStatus.canConnect) {
                    // Show error message with upgrade option
                    Swal.fire({
                        title: 'Connection Limit Reached',
                        html: `${connectionStatus.message}`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Upgrade Plan',
                        cancelButtonText: 'Maybe Later',
                        confirmButtonColor: '#8B5CF6',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Redirect to subscription page
                            window.location.href = 'subscription.html';
                        }
                    });
                    return;
                }
                
                // For this implementation, create the connection in the database
                try {
                    const { data: session } = await supabaseClient.auth.getSession();
                    if (!session.session) {
                        Swal.fire({
                            title: 'Authentication Required',
                            text: 'Please log in to connect with other users',
                            icon: 'warning',
                            confirmButtonColor: '#8B5CF6',
                        });
                        return;
                    }
                    
                    try {
                        const timestamp = new Date().toISOString();
                        console.log(`%c[CONNECTION] ${timestamp} - Starting connection process between users ${session.session.user.id} and ${profileId}`, 'color: #2196F3; font-weight: bold');
                        
                        // Prevent self-connections
                        if (session.session.user.id === profileId) {
                            console.log(`%c[CONNECTION WARNING] ${timestamp} - Self-connection attempt prevented`, 'color: #FF9800; font-weight: bold');
                            Swal.fire({
                                title: 'Invalid Connection',
                                text: 'You cannot connect with yourself.',
                                icon: 'warning',
                                confirmButtonColor: '#8B5CF6',
                            });
                            return;
                        }
                        
                        // Ensure database utility functions are loaded
                        if (typeof window.checkConnectionExists !== 'function') {
                            console.error(`%c[CONNECTION ERROR] ${timestamp} - checkConnectionExists utility function not available, attempting to load it`, 'color: #F44336; font-weight: bold');
                            
                            // Try to dynamically load the database-utils.js script
                            const script = document.createElement('script');
                            script.src = 'js/database-utils.js';
                            script.async = false;
                            document.head.appendChild(script);
                            
                            // Wait a moment for the script to load
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            // Check again if the function is available
                            if (typeof window.checkConnectionExists !== 'function') {
                                console.error(`%c[CONNECTION ERROR] ${timestamp} - Failed to load checkConnectionExists function`, 'color: #F44336; font-weight: bold');
                                Swal.fire({
                                    title: 'Connection Error',
                                    text: 'Could not load required functions. Please refresh the page and try again.',
                                    icon: 'error',
                                    confirmButtonColor: '#8B5CF6',
                                });
                                return;
                            } else {
                                console.log(`%c[CONNECTION] ${timestamp} - Successfully loaded checkConnectionExists function`, 'color: #4CAF50; font-weight: bold');
                            }
                        }
                        
                        // Check if connection already exists
                        const connectionCheck = await window.checkConnectionExists(supabaseClient, session.session.user.id, profileId);
                        
                        if (connectionCheck.error) {
                            console.error(`%c[CONNECTION ERROR] ${timestamp} - Error checking connection:`, 'color: #F44336; font-weight: bold', connectionCheck.error);
                            throw new Error(`Error checking existing connection: ${JSON.stringify(connectionCheck.error)}`);
                        }
                        
                        // If connection exists, show message and return
                        if (connectionCheck.exists) {
                            console.log(`%c[CONNECTION] ${timestamp} - Connection already exists, preventing duplicate`, 'color: #2196F3');
                            Swal.fire({
                                title: 'Already Connected',
                                text: 'You have already sent a connection request to this user.',
                                icon: 'info',
                                confirmButtonColor: '#8B5CF6',
                            });
                            return;
                        }
                        
                        // If we have existing connections that might conflict, delete them
                        if (connectionCheck.data && connectionCheck.data.length > 0) {
                            console.log(`%c[CONNECTION] ${timestamp} - Found ${connectionCheck.data.length} potential conflicting connections, cleaning up`, 'color: #2196F3');
                            
                            for (const conn of connectionCheck.data) {
                                const deleteResult = await window.deleteConnection(supabaseClient, conn.id);
                                if (!deleteResult.success) {
                                    console.warn(`%c[CONNECTION WARNING] ${timestamp} - Failed to delete connection ${conn.id}:`, 'color: #FF9800', deleteResult.error);
                                }
                            }
                        }
                    } catch (error) {
                        console.error(`%c[CONNECTION ERROR] ${timestamp} - Error in connection check:`, 'color: #F44336; font-weight: bold', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Could not verify connection status. Please try again.',
                            icon: 'error',
                            confirmButtonColor: '#8B5CF6',
                        });
                        return;
                    }
                    
                    try {
                        const timestamp = new Date().toISOString();
                        console.log(`%c[CONNECTION] ${timestamp} - Creating new connection from ${session.session.user.id} to ${profileId}`, 'color: #2196F3; font-weight: bold');
                        
                        // Create connection record
                        const { data, error } = await supabaseClient
                            .from('connections')
                            .insert([
                                {
                                    initiator_user_id: session.session.user.id,
                                    target_user_id: profileId,
                                    status: 'pending'
                                }
                            ]);
                        
                        if (error) {
                            console.error(`%c[CONNECTION ERROR] ${timestamp} - Error creating connection:`, 'color: #F44336; font-weight: bold', error);
                            
                            // Check if this is a duplicate connection error
                            if (error.code === '23505' && error.message.includes('duplicate key value')) {
                                console.log(`%c[CONNECTION WARNING] ${timestamp} - Duplicate connection caught by database constraint`, 'color: #FF9800; font-weight: bold');
                                
                                // Use our utility function to clean up conflicting connections
                                try {
                                    console.log(`%c[CONNECTION] ${timestamp} - Attempting to clean up conflicting connections`, 'color: #2196F3');
                                    
                                    // Get existing connections
                                    const connectionCheck = await window.checkConnectionExists(supabaseClient, session.session.user.id, profileId);
                                    
                                    if (connectionCheck.data && connectionCheck.data.length > 0) {
                                        console.log(`%c[CONNECTION] ${timestamp} - Found ${connectionCheck.data.length} conflicting connections to clean up`, 'color: #2196F3');
                                        
                                        // Delete each conflicting connection
                                        for (const conn of connectionCheck.data) {
                                            const deleteResult = await window.deleteConnection(supabaseClient, conn.id);
                                            if (!deleteResult.success) {
                                                console.error(`%c[CONNECTION ERROR] ${timestamp} - Failed to delete connection ${conn.id}:`, 'color: #F44336; font-weight: bold', deleteResult.error);
                                            } else {
                                                console.log(`%c[CONNECTION SUCCESS] ${timestamp} - Deleted connection ${conn.id}`, 'color: #4CAF50');
                                            }
                                        }
                                        
                                        // Try creating the connection again after cleanup
                                        console.log(`%c[CONNECTION] ${timestamp} - Retrying connection creation after cleanup`, 'color: #2196F3');
                                        const { data: retryData, error: retryError } = await supabaseClient
                                            .from('connections')
                                            .insert([
                                                {
                                                    initiator_user_id: session.session.user.id,
                                                    target_user_id: profileId,
                                                    status: 'pending'
                                                }
                                            ]);
                                        
                                        if (!retryError) {
                                            console.log(`%c[CONNECTION SUCCESS] ${timestamp} - Connection created successfully after cleanup`, 'color: #4CAF50; font-weight: bold');
                                            
                                            // Create notification for the target user
                                            if (typeof window.createNotification === 'function') {
                                                try {
                                                    const notificationResult = await window.createNotification(supabaseClient, {
                                                        type: 'connection_request',
                                                        message: `You have a new connection request`,
                                                        sender_id: session.session.user.id,
                                                        recipient_id: profileId
                                                    });
                                                    
                                                    if (notificationResult.success) {
                                                        console.log(`%c[NOTIFICATION SUCCESS] ${timestamp} - Connection notification created`, 'color: #4CAF50');
                                                    } else {
                                                        console.error(`%c[NOTIFICATION ERROR] ${timestamp} - Failed to create notification:`, 'color: #F44336', notificationResult.error);
                                                    }
                                                } catch (notifError) {
                                                    console.error(`%c[NOTIFICATION ERROR] ${timestamp} - Exception creating notification:`, 'color: #F44336', notifError);
                                                }
                                            }
                                            
                                            // Success! Show success message
                                            Swal.fire({
                                                title: 'Connection Sent!',
                                                text: 'Your connection request has been sent.',
                                                icon: 'success',
                                                confirmButtonColor: '#8B5CF6',
                                            });
                                            
                                            // Update the connection banner
                                            await updateConnectionBanner(validator);
                                            return;
                                        } else {
                                            console.error(`%c[CONNECTION ERROR] ${timestamp} - Retry failed:`, 'color: #F44336; font-weight: bold', retryError);
                                        }
                                    }
                                } catch (cleanupError) {
                                    console.error(`%c[CONNECTION ERROR] ${timestamp} - Error during connection cleanup:`, 'color: #F44336; font-weight: bold', cleanupError);
                                }
                                
                                // If we get here, either the cleanup failed or the retry failed
                                Swal.fire({
                                    title: 'Already Connected',
                                    text: 'You have already sent a connection request to this user.',
                                    icon: 'info',
                                    confirmButtonColor: '#8B5CF6',
                                });
                            } else {
                                throw new Error(`Connection creation failed: ${JSON.stringify(error)}`);
                            }
                            return;
                        }
                        
                        console.log(`%c[CONNECTION SUCCESS] ${timestamp} - Connection created successfully`, 'color: #4CAF50; font-weight: bold');
                        
                        // Create notification for the target user
                        if (typeof window.createNotification === 'function') {
                            try {
                                const notificationResult = await window.createNotification(supabaseClient, {
                                    type: 'connection_request',
                                    message: `You have a new connection request`,
                                    sender_id: session.session.user.id,
                                    recipient_id: profileId
                                });
                                
                                if (notificationResult.success) {
                                    console.log(`%c[NOTIFICATION SUCCESS] ${timestamp} - Connection notification created`, 'color: #4CAF50');
                                } else {
                                    console.error(`%c[NOTIFICATION ERROR] ${timestamp} - Failed to create notification:`, 'color: #F44336', notificationResult.error);
                                }
                            } catch (notifError) {
                                console.error(`%c[NOTIFICATION ERROR] ${timestamp} - Exception creating notification:`, 'color: #F44336', notifError);
                            }
                        }
                        
                        // Show success message
                        Swal.fire({
                            title: 'Connection Sent!',
                            text: 'Your connection request has been sent.',
                            icon: 'success',
                            confirmButtonColor: '#8B5CF6',
                        });
                    } catch (error) {
                        console.error(`%c[CONNECTION ERROR] ${timestamp} - Unexpected error in connection creation:`, 'color: #F44336; font-weight: bold', error);
                        Swal.fire({
                            title: 'Connection Failed',
                            text: 'Could not send connection request. Please try again.',
                            icon: 'error',
                            confirmButtonColor: '#8B5CF6',
                        });
                        return;
                    }
                    
                    // Update the connection banner
                    await updateConnectionBanner(validator);
                    
                } catch (error) {
                    console.error('Error connecting with user:', error);
                    alert('Error connecting with user. Please try again.');
                }
            });
        });
    }
    
    // Function to update the connection banner with current usage
    async function updateConnectionBanner(validator) {
        const subscriptionBanner = document.getElementById('subscription-banner');
        const connectionCount = document.getElementById('connection-count');
        
        if (!subscriptionBanner || !connectionCount) return;
        
        try {
            // Get the connection status
            const connectionStatus = await validator.canCreateConnection();
            
            // Show the banner
            subscriptionBanner.classList.remove('hidden');
            
            // Update the connection count
            connectionCount.textContent = `${connectionStatus.currentCount || 0}/${connectionStatus.maxCount || 0}`;
            
            // If user is at or near their limit, highlight this
            if (connectionStatus.currentCount >= connectionStatus.maxCount) {
                connectionCount.classList.add('text-red-600', 'font-bold');
            } else if (connectionStatus.currentCount >= connectionStatus.maxCount * 0.8) {
                connectionCount.classList.add('text-yellow-600', 'font-bold');
            } else {
                connectionCount.classList.remove('text-red-600', 'text-yellow-600', 'font-bold');
            }
        } catch (error) {
            console.error('Error updating connection banner:', error);
        }
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
            },
            {
                id: '7',
                first_name: 'James',
                last_name: 'Anderson',
                birthdate: '1980-02-14',
                city: 'Houston',
                bio: 'Chef and wine enthusiast. I love hosting dinner parties and meeting new people.',
                interests: ['Cooking', 'Wine', 'Food', 'Socializing'],
                relationship_types: ['Friendship', 'Serious']
            },
            {
                id: '8',
                first_name: 'Lisa',
                last_name: 'Martinez',
                birthdate: '1998-09-28',
                city: 'New York',
                bio: 'Art student and part-time barista. Looking for creative and open-minded people.',
                interests: ['Art', 'Coffee', 'Museums', 'Photography'],
                relationship_types: ['Friendship', 'Casual']
            },
            {
                id: '9',
                first_name: 'Robert',
                last_name: 'Garcia',
                birthdate: '1978-04-02',
                city: 'Chicago',
                bio: 'Business consultant who loves jazz and good conversations. Looking for meaningful connections.',
                interests: ['Jazz', 'Business', 'Travel', 'Food'],
                relationship_types: ['Serious']
            },
            {
                id: '10',
                first_name: 'Jennifer',
                last_name: 'Lopez',
                birthdate: '1991-06-20',
                city: 'Los Angeles',
                bio: 'Fitness trainer and health food enthusiast. I enjoy outdoor activities and staying active.',
                interests: ['Fitness', 'Health', 'Hiking', 'Cooking'],
                relationship_types: ['Friendship', 'Casual', 'Serious']
            },
            {
                id: '11',
                first_name: 'Thomas',
                last_name: 'Lee',
                birthdate: '1986-10-12',
                city: 'San Francisco',
                bio: 'Software developer and gaming enthusiast. Looking for fellow gamers and tech lovers.',
                interests: ['Technology', 'Gaming', 'Coding', 'Anime'],
                relationship_types: ['Friendship', 'Casual']
            },
            {
                id: '12',
                first_name: 'Amanda',
                last_name: 'Clark',
                birthdate: '1994-01-25',
                city: 'Seattle',
                bio: 'Environmental scientist and nature lover. I spend most of my weekends hiking or camping.',
                interests: ['Environment', 'Hiking', 'Camping', 'Photography'],
                relationship_types: ['Serious', 'Friendship']
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
