// Authentication helper functions
// Using the global supabaseClient variable

// Create user profile in the database
async function createProfile(userId, profileData) {
    if (!userId) {
        console.error('No user ID provided to create profile');
        return { data: null, error: new Error('No user ID provided') };
    }
    
    try {
        // Check if profile already exists
        const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();
        
        if (existingProfile) {
            // Update existing profile
            const { data, error } = await supabaseClient
                .from('profiles')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            if (error) {
                console.error('Error updating profile:', error);
                return { data: null, error };
            }
            
            console.log('Profile updated successfully:', profileData);
            return { data: { id: userId, ...profileData }, error: null };
        } else {
            // Create new profile
            const { data, error } = await supabaseClient
                .from('profiles')
                .insert([
                    {
                        id: userId,
                        ...profileData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);
            
            if (error) {
                console.error('Error creating profile:', error);
                return { data: null, error };
            }
            
            console.log('Profile created successfully:', profileData);
            return { data: { id: userId, ...profileData }, error: null };
        }
    } catch (err) {
        console.error('Unexpected error creating/updating profile:', err);
        return { data: null, error: err };
    }
}

// Create or update user profile preferences
async function createOrUpdateUserProfilePreferences(userId, preferences) {
    if (!userId) {
        console.error('No user ID provided to update preferences');
        return { data: null, error: new Error('No user ID provided') };
    }
    
    try {
        // Check if profile exists
        const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();
        
        if (existingProfile) {
            // Update existing profile with new preferences
            const { data, error } = await supabaseClient
                .from('profiles')
                .update({
                    ...preferences,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            if (error) {
                console.error('Error updating preferences:', error);
                return { data: null, error };
            }
            
            console.log('Preferences updated successfully:', preferences);
            return { data: { id: userId, ...preferences }, error: null };
        } else {
            // Create new profile with preferences
            const { data, error } = await supabaseClient
                .from('profiles')
                .insert([
                    {
                        id: userId,
                        ...preferences,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);
            
            if (error) {
                console.error('Error creating profile with preferences:', error);
                return { data: null, error };
            }
            
            console.log('Profile with preferences created successfully:', preferences);
            return { data: { id: userId, ...preferences }, error: null };
        }
    } catch (err) {
        console.error('Unexpected error updating preferences:', err);
        return { data: null, error: err };
    }
}

// Save gender preferences
async function saveGenderPreferences(userId, genderPreferences) {
    if (!userId) {
        console.error('No user ID provided to save gender preferences');
        return { data: null, error: new Error('No user ID provided') };
    }
    
    try {
        // Check if profile exists
        const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();
        
        if (existingProfile) {
            // Update existing profile with gender preferences
            const { data, error } = await supabaseClient
                .from('profiles')
                .update({
                    gender_preferences: genderPreferences,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
            
            if (error) {
                console.error('Error updating gender preferences:', error);
                return { data: null, error };
            }
            
            console.log('Gender preferences updated successfully:', genderPreferences);
            return { data: { id: userId, gender_preferences: genderPreferences }, error: null };
        } else {
            // Create new profile with gender preferences
            const { data, error } = await supabaseClient
                .from('profiles')
                .insert([
                    {
                        id: userId,
                        gender_preferences: genderPreferences,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);
            
            if (error) {
                console.error('Error creating profile with gender preferences:', error);
                return { data: null, error };
            }
            
            console.log('Profile with gender preferences created successfully:', genderPreferences);
            return { data: { id: userId, gender_preferences: genderPreferences }, error: null };
        }
    } catch (err) {
        console.error('Unexpected error saving gender preferences:', err);
        return { data: null, error: err };
    }
}

// Check authentication state and update UI accordingly
function checkAuthState(callback) {
    supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) {
            console.error('Error checking auth state:', error);
            callback({ isAuthenticated: false });
        } else {
            callback({
                isAuthenticated: !!data.session,
                session: data.session
            });
        }
    });
}

// Get current user data
async function getUserData() {
    const { data, error } = await supabaseClient.auth.getUser();
    
    if (error) {
        console.error('Error getting user data:', error);
        return null;
    }
    
    return data.user;
}

// Get user profile data
async function getUserProfile(userId) {
    if (!userId) {
        const userData = await getUserData();
        userId = userData?.id;
    }
    
    if (!userId) {
        console.error('No user ID available to fetch profile');
        return { data: null, error: new Error('No user ID available') };
    }
    
    try {
        // First try to get profile from the database
        const { data: profileData, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile from database:', profileError);
        }
        
        // If profile exists in database, return it
        if (profileData) {
            console.log('Profile found in database:', profileData);
            return { data: profileData, error: null };
        }
        
        // Fallback to user metadata if no profile in database
        const { data: userData } = await supabaseClient.auth.getUser();
        
        if (userData && userData.user) {
            // Get profile image from user metadata or session storage
            let profileImage = userData.user.user_metadata?.profile_image;
            
            // If not in user metadata, try session storage
            if (!profileImage) {
                profileImage = sessionStorage.getItem('profileImage');
            }
            
            // Parse JSON strings from metadata if needed
            const parseArrayField = (field) => {
                if (!field) return [];
                if (Array.isArray(field)) return field;
                if (typeof field === 'string') {
                    try {
                        // Check if it's a JSON string
                        if (field.startsWith('[') && field.endsWith(']')) {
                            return JSON.parse(field);
                        }
                        // Otherwise, split by comma
                        return field.split(',').map(item => item.trim()).filter(Boolean);
                    } catch (e) {
                        console.warn(`Error parsing field: ${field}`, e);
                        return [];
                    }
                }
                return [];
            };
            
            const metadata = userData.user.user_metadata || {};
            
            const userProfile = {
                id: userData.user.id,
                email: userData.user.email,
                first_name: metadata.first_name || '',
                last_name: metadata.last_name || '',
                username: metadata.username || userData.user.email.split('@')[0],
                birthdate: metadata.birthdate || '',
                gender: metadata.gender || '',
                city: metadata.city || '',
                bio: metadata.bio || '',
                interests: parseArrayField(metadata.interests),
                relationship_types: parseArrayField(metadata.relationship_types),
                gender_preferences: parseArrayField(metadata.gender_preferences),
                profile_image: profileImage,
                user_metadata: metadata
            };
            
            console.log('Parsed user profile:', userProfile);
            
            return { data: userProfile, error: null };
        }
    } catch (err) {
        console.error('Unexpected error fetching user profile:', err);
        return { data: null, error: err };
    }
    
    return { data: null, error: null };
}

// Handle auth redirect (for email verification)
async function handleAuthRedirect() {
    const { isAuthenticated } = await new Promise(resolve => checkAuthState(resolve));
    const currentPath = window.location.pathname;
    
    // Pages that require authentication
    const authRequiredPages = [
        '/my-profile.html',
        '/find-yourself-one.html'
    ];
    
    // Pages that should redirect to home if already authenticated
    const nonAuthPages = [
        '/login.html',
        '/signup.html'
    ];
    
    const requiresAuth = authRequiredPages.some(page => currentPath.endsWith(page));
    const isNonAuthPage = nonAuthPages.some(page => currentPath.endsWith(page));
    
    if (requiresAuth && !isAuthenticated) {
        // Redirect to login if trying to access protected page without auth
        window.location.href = 'login.html';
        return false;
    } else if (isNonAuthPage && isAuthenticated) {
        // Redirect to home if already logged in and trying to access login/signup
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Update UI based on authentication state
function updateAuthUI(user) {
    checkAuthState(({ isAuthenticated }) => {
        console.log('Updating UI based on auth state:', isAuthenticated);
        
        // Elements to show when authenticated
        const authElements = document.querySelectorAll('.auth-link');
        const nonAuthElements = document.querySelectorAll('.non-auth-link');
        const loginBtn = document.getElementById('login-btn');
        const profileBtn = document.getElementById('profile-btn');
            
        if (isAuthenticated) {
            console.log('User is authenticated, showing auth elements');
            
            // Show authenticated elements
            authElements.forEach(el => {
                el.classList.remove('hidden');
                el.style.display = 'inline-block';
            });
                
            // Hide non-authenticated elements
            nonAuthElements.forEach(el => {
                el.classList.add('hidden');
                el.style.display = 'none';
            });
            
            // Ensure profile button is visible
            if (profileBtn) {
                profileBtn.classList.remove('hidden');
                profileBtn.style.display = 'inline-block';
                console.log('Profile button should be visible now');
            }
                
            // Update profile link if available
            const profileLink = document.getElementById('profile-link');
            if (profileLink) {
                profileLink.href = 'my-profile.html';
            }
        } else {
            console.log('User is not authenticated, hiding auth elements');
            
            // Hide authenticated elements
            authElements.forEach(el => {
                el.classList.add('hidden');
                el.style.display = 'none';
            });
                
            // Show non-authenticated elements
            nonAuthElements.forEach(el => {
                el.classList.remove('hidden');
                el.style.display = 'inline-block';
            });
            
            // Ensure login button is visible with !important to override any other styles
            if (loginBtn) {
                loginBtn.classList.remove('hidden');
                loginBtn.setAttribute('style', 'display: inline-block !important');
                console.log('Login button should be visible now with important flag');
            }
            
            // Also ensure mobile login button is visible
            const mobileLoginBtn = document.getElementById('mobile-login-btn');
            if (mobileLoginBtn) {
                mobileLoginBtn.classList.remove('hidden');
                mobileLoginBtn.setAttribute('style', 'display: block !important');
                console.log('Mobile login button should be visible now');
            }
        }
    });
}

// Set up logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // First check if we have an active session
                const { data: sessionData } = await supabaseClient.auth.getSession();
                
                // If no active session, just redirect to home
                if (!sessionData?.session) {
                    console.log('No active session found, redirecting to home');
                    window.location.href = 'index.html';
                    return;
                }
                
                // Otherwise, try to sign out
                const { error } = await supabaseClient.auth.signOut();
                
                if (error) {
                    console.error('Error signing out:', error);
                    // Don't show alert to user, just log the error
                }
                
                // Redirect to home page after logout attempt (even if there was an error)
                window.location.href = 'index.html';
            } catch (err) {
                console.error('Unexpected error during logout:', err);
                // Don't show alert to user, just redirect
                window.location.href = 'index.html';
            }
        });
    }
}


