// Simple test file to verify JavaScript loading
console.log('Messaging test file loaded successfully');

// Initialize Supabase client
const supabaseUrl = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Basic initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing messaging system');
  
  // Check authentication
  checkAuth();
});

// Check if user is authenticated
async function checkAuth() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      console.log('User is authenticated:', session.user.email);
      document.getElementById('auth-status').textContent = 'Authenticated as: ' + session.user.email;
    } else {
      console.log('User is not authenticated');
      document.getElementById('auth-status').textContent = 'Not authenticated';
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
}
