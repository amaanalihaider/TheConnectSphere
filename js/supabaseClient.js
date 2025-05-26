// Supabase client configuration

// Initialize the Supabase client
const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';

// Create the supabase client
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Auth helper functions
async function signUp(email, password, userData) {
    // Get profile image from session storage if available
    const profileImage = sessionStorage.getItem('profileImage');
    if (profileImage) {
        userData.profile_image = profileImage;
    }
    
    // Store original arrays for database insertion
    const interestsArray = userData.interests || [];
    const relationshipTypesArray = userData.relationship_types || [];
    const genderPreferencesArray = userData.gender_preferences || [];
    
    // Format metadata for Supabase Auth
    const metadataForAuth = {
        ...userData,
        // Keep simple string values for auth metadata
        interests: Array.isArray(interestsArray) ? interestsArray.join(',') : interestsArray,
        relationship_types: Array.isArray(relationshipTypesArray) ? relationshipTypesArray.join(',') : relationshipTypesArray,
        gender_preferences: Array.isArray(genderPreferencesArray) ? genderPreferencesArray.join(',') : genderPreferencesArray
    };
    
    // Format date for both auth and database
    let formattedBirthdate = userData.birthdate;
    if (userData.birthdate && typeof userData.birthdate === 'string' && !userData.birthdate.includes('T')) {
        try {
            const date = new Date(userData.birthdate);
            if (!isNaN(date.getTime())) {
                formattedBirthdate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                metadataForAuth.birthdate = formattedBirthdate;
            }
        } catch (e) {
            console.warn('Could not format birthdate:', e);
        }
    }
    
    console.log('Sending user data to Supabase Auth:', metadataForAuth);
    
    // Sign up the user with Supabase Auth
    const authResponse = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: metadataForAuth,
            emailRedirectTo: window.location.origin + '/verification-success.html'
        }
    });
    
    // If signup was successful, create profile in the database directly
    if (authResponse.data?.user && !authResponse.error) {
        try {
            console.log('Auth successful, creating profile in database');
            
            // Prepare profile data for database insertion
            const profileData = {
                id: authResponse.data.user.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                birthdate: formattedBirthdate,
                gender: userData.gender,
                city: userData.city || null,
                bio: userData.bio || null,
                interests: interestsArray,
                relationship_types: relationshipTypesArray,
                gender_preferences: genderPreferencesArray,
                profile_image: profileImage || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            console.log('Creating profile with data:', profileData);
            
            // Insert profile into the database
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .upsert([profileData], { onConflict: 'id' });
            
            if (profileError) {
                console.error('Error creating profile in database:', profileError);
                // Continue with auth response even if profile creation fails
                // The profile can be created later when the user logs in
            } else {
                console.log('Profile created successfully');
            }
        } catch (err) {
            console.error('Unexpected error creating profile:', err);
            // Continue with auth response even if profile creation fails
        }
    }
    
    return authResponse;
}

async function signIn(email, password) {
    console.log(`%c[AUTH] Login attempt for user: ${email}`, 'color: #4CAF50; font-weight: bold');
    const timestamp = new Date().toISOString();
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error(`%c[AUTH ERROR] ${timestamp} - Login failed for ${email}: ${error.message}`, 'color: #F44336; font-weight: bold');
            return { data, error };
        }
        
        console.log(`%c[AUTH SUCCESS] ${timestamp} - User logged in: ${email} (${data.user.id})`, 'color: #2196F3; font-weight: bold');
        console.table({
            'User ID': data.user.id,
            'Email': email,
            'Login Time': timestamp,
            'Session Expires': new Date(data.session.expires_at * 1000).toLocaleString()
        });
        
        return { data, error };
    } catch (err) {
        console.error(`%c[AUTH ERROR] ${timestamp} - Unexpected error during login for ${email}:`, 'color: #F44336; font-weight: bold', err);
        return { data: null, error: err };
    }
}

async function signOut() {
    try {
        // Get current user before signing out
        const { data: userData } = await supabaseClient.auth.getUser();
        const timestamp = new Date().toISOString();
        
        if (userData && userData.user) {
            console.log(`%c[AUTH] Logout attempt for user: ${userData.user.email} (${userData.user.id})`, 'color: #FF9800; font-weight: bold');
        }
        
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            console.error(`%c[AUTH ERROR] ${timestamp} - Logout failed:`, 'color: #F44336; font-weight: bold', error);
            return { error };
        }
        
        if (userData && userData.user) {
            console.log(`%c[AUTH SUCCESS] ${timestamp} - User logged out: ${userData.user.email} (${userData.user.id})`, 'color: #2196F3; font-weight: bold');
        } else {
            console.log(`%c[AUTH SUCCESS] ${timestamp} - User logged out (no user data available)`, 'color: #2196F3; font-weight: bold');
        }
        
        return { error: null };
    } catch (err) {
        const timestamp = new Date().toISOString();
        console.error(`%c[AUTH ERROR] ${timestamp} - Unexpected error during logout:`, 'color: #F44336; font-weight: bold', err);
        return { error: err };
    }
}

async function getCurrentUser() {
    return await supabaseClient.auth.getUser();
}

async function getSession() {
    return await supabaseClient.auth.getSession();
}

// Social authentication functions
window.signInWithGoogle = async function() {
    return await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/verification-success.html'
        }
    });
}

// Check authentication state - this function is used by authNavigation.js
async function checkAuthState(callback) {
    const timestamp = new Date().toISOString();
    console.log(`%c[AUTH CHECK] ${timestamp} - Checking authentication state`, 'color: #9C27B0; font-style: italic');
    
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error(`%c[AUTH ERROR] ${timestamp} - Error checking auth state:`, 'color: #F44336; font-weight: bold', error);
            callback({ isAuthenticated: false, user: null });
            return;
        }
        
        if (data.session) {
            // Session exists, user is logged in
            const { data: userData, error: userError } = await supabaseClient.auth.getUser();
            
            if (userError) {
                console.error(`%c[AUTH ERROR] ${timestamp} - Error getting user data:`, 'color: #F44336; font-weight: bold', userError);
                callback({ isAuthenticated: false, user: null });
                return;
            }
            
            // Log session information
            const sessionInfo = {
                'User ID': userData.user.id,
                'Email': userData.user.email,
                'Session Expires': new Date(data.session.expires_at * 1000).toLocaleString(),
                'Time Remaining': Math.floor((data.session.expires_at * 1000 - Date.now()) / 60000) + ' minutes',
                'Provider': userData.user.app_metadata.provider || 'email',
                'Last Sign In': new Date(userData.user.last_sign_in_at).toLocaleString()
            };
            
            console.log(`%c[AUTH SUCCESS] ${timestamp} - User authenticated: ${userData.user.email} (${userData.user.id})`, 'color: #4CAF50; font-weight: bold');
            console.table(sessionInfo);
            
            // Check if session is about to expire (less than 30 minutes)
            const minutesRemaining = Math.floor((data.session.expires_at * 1000 - Date.now()) / 60000);
            if (minutesRemaining < 30) {
                console.warn(`%c[AUTH WARNING] ${timestamp} - Session expiring soon: ${minutesRemaining} minutes remaining`, 'color: #FF9800; font-weight: bold');
            }
            
            callback({ isAuthenticated: true, user: userData.user });
        } else {
            console.log(`%c[AUTH INFO] ${timestamp} - No active session found`, 'color: #607D8B; font-style: italic');
            callback({ isAuthenticated: false, user: null });
        }
    } catch (err) {
        console.error(`%c[AUTH ERROR] ${timestamp} - Unexpected error in checkAuthState:`, 'color: #F44336; font-weight: bold', err);
        callback({ isAuthenticated: false, user: null });
    }
}

// Make the checkAuthState function globally accessible
window.checkAuthState = checkAuthState;

// Handle OAuth callback
window.handleOAuthCallback = async function() {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error('Error checking session after OAuth:', error);
        return { data: null, error };
    }
    
    // If user is authenticated after OAuth callback
    if (data.session) {
        try {
            // Check if profile exists
            const { data: profileData, error: profileError } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', data.session.user.id)
                .single();
            
            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'not found'
                console.error('Error checking for existing profile:', profileError);
            }
            
            // If profile doesn't exist, create it from OAuth data
            if (!profileData) {
                const user = data.session.user;
                const metadata = user.user_metadata || {};
                
                // Prepare profile data from OAuth
                const profileData = {
                    id: user.id,
                    first_name: metadata.full_name?.split(' ')[0] || '',
                    last_name: metadata.full_name?.split(' ').slice(1).join(' ') || '',
                    username: metadata.preferred_username || metadata.email?.split('@')[0] || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                // Insert profile into database
                const { error: insertError } = await supabaseClient
                    .from('profiles')
                    .insert([profileData]);
                
                if (insertError) {
                    console.error('Error creating profile from OAuth data:', insertError);
                } else {
                    console.log('Profile created successfully from OAuth data');
                }
            }
            
            return { data: data.session, error: null };
        } catch (err) {
            console.error('Unexpected error in OAuth callback handling:', err);
            return { data: data.session, error: err };
        }
    }
    
    return { data: null, error: new Error('No session found after OAuth callback') };
}
