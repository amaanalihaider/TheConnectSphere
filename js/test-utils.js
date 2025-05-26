/**
 * Test utility functions for debugging database operations
 */

/**
 * Test the database-utils.js functions
 */
async function testDatabaseUtils() {
  const timestamp = new Date().toISOString();
  console.log(`%c[TEST] ${timestamp} - Starting database utils test`, 'color: #9C27B0; font-weight: bold');
  
  if (!window.supabase) {
    console.error(`%c[TEST ERROR] ${timestamp} - Supabase client not available`, 'color: #F44336; font-weight: bold');
    return;
  }
  
  // Test table existence check
  if (typeof window.checkTableExists === 'function') {
    console.log(`%c[TEST] ${timestamp} - Testing checkTableExists function`, 'color: #2196F3');
    
    try {
      const notificationsExists = await window.checkTableExists(window.supabase, 'notifications');
      console.log(`%c[TEST RESULT] ${timestamp} - Notifications table exists: ${notificationsExists}`, 'color: #4CAF50');
      
      const connectionsExists = await window.checkTableExists(window.supabase, 'connections');
      console.log(`%c[TEST RESULT] ${timestamp} - Connections table exists: ${connectionsExists}`, 'color: #4CAF50');
      
      const nonExistentTable = await window.checkTableExists(window.supabase, 'non_existent_table');
      console.log(`%c[TEST RESULT] ${timestamp} - Non-existent table exists: ${nonExistentTable}`, 'color: #4CAF50');
    } catch (error) {
      console.error(`%c[TEST ERROR] ${timestamp} - Error testing checkTableExists:`, 'color: #F44336; font-weight: bold', error);
    }
  } else {
    console.error(`%c[TEST ERROR] ${timestamp} - checkTableExists function not available`, 'color: #F44336; font-weight: bold');
  }
  
  // Test connection check
  if (typeof window.checkConnectionExists === 'function' && window.currentUser) {
    console.log(`%c[TEST] ${timestamp} - Testing checkConnectionExists function`, 'color: #2196F3');
    
    try {
      // Get a random user ID that's not the current user
      const { data: users, error: usersError } = await window.supabase
        .from('profiles')
        .select('id')
        .neq('id', window.currentUser.id)
        .limit(1);
      
      if (usersError) {
        console.error(`%c[TEST ERROR] ${timestamp} - Error getting test user:`, 'color: #F44336; font-weight: bold', usersError);
      } else if (users && users.length > 0) {
        const testUserId = users[0].id;
        console.log(`%c[TEST] ${timestamp} - Using test user ID: ${testUserId}`, 'color: #2196F3');
        
        const connectionCheck = await window.checkConnectionExists(window.supabase, window.currentUser.id, testUserId);
        console.log(`%c[TEST RESULT] ${timestamp} - Connection exists: ${connectionCheck.exists}`, 'color: #4CAF50', connectionCheck);
      } else {
        console.log(`%c[TEST WARNING] ${timestamp} - No other users found for connection test`, 'color: #FF9800; font-weight: bold');
      }
    } catch (error) {
      console.error(`%c[TEST ERROR] ${timestamp} - Error testing checkConnectionExists:`, 'color: #F44336; font-weight: bold', error);
    }
  } else {
    console.log(`%c[TEST WARNING] ${timestamp} - checkConnectionExists function not available or user not logged in`, 'color: #FF9800; font-weight: bold');
  }
  
  console.log(`%c[TEST] ${timestamp} - Database utils test completed`, 'color: #9C27B0; font-weight: bold');
}

// Export the test function to the window object
window.testDatabaseUtils = testDatabaseUtils;

// The test function is still available via the console
// You can run it by typing window.testDatabaseUtils() in the browser console
// The button has been removed as requested

// Ensure no tests run automatically
document.addEventListener('DOMContentLoaded', function() {
  // Prevent any automatic test runs
  console.log('Test utilities loaded but not running automatically');
});
