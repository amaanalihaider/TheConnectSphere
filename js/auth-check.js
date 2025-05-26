/**
 * Simple auth check script for ConnectSphere
 * Adds 'logged-in' class to body when user is authenticated
 * Dispatches 'userLoggedIn' event when authentication is detected
 */

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});

// Check user authentication status
async function checkAuthStatus() {
  try {
    // Get current session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    // If we have a session, user is logged in
    if (session) {
      document.body.classList.add('logged-in');
      
      // Dispatch event for other scripts to listen for
      const event = new CustomEvent('userLoggedIn', { 
        detail: { user: session.user } 
      });
      document.dispatchEvent(event);
    } else {
      document.body.classList.remove('logged-in');
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    document.body.classList.add('logged-in');
    
    // Dispatch event for other scripts to listen for
    const customEvent = new CustomEvent('userLoggedIn', { 
      detail: { user: session.user } 
    });
    document.dispatchEvent(customEvent);
  } else if (event === 'SIGNED_OUT') {
    document.body.classList.remove('logged-in');
  }
});
