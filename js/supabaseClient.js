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
    return await supabaseClient.auth.signInWithPassword({
        email,
        password
    });
}

async function signOut() {
    return await supabaseClient.auth.signOut();
}

async function getCurrentUser() {
    return await supabaseClient.auth.getUser();
}

async function getSession() {
    return await supabaseClient.auth.getSession();
}
