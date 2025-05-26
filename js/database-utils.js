/**
 * Utility functions for database operations
 */

/**
 * Check if a table exists in the database
 * @param {Object} supabase - Supabase client instance
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} - True if table exists, false otherwise
 */
async function checkTableExists(supabase, tableName) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`%c[DATABASE] ${timestamp} - Checking if table '${tableName}' exists`, 'color: #2196F3');
    
    // Use a simple query to check if the table exists
    // If the table doesn't exist, it will throw an error
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL code for undefined_table
        console.log(`%c[DATABASE] ${timestamp} - Table '${tableName}' does not exist (confirmed by query error)`, 'color: #2196F3');
        return false;
      }
      
      // For other errors, log but don't assume table doesn't exist
      console.error(`%c[DATABASE ERROR] ${timestamp} - Error checking if table ${tableName} exists:`, 'color: #F44336; font-weight: bold', error);
      
      // Try an alternative method - use RPC call to check table existence
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('table_exists', { table_name: tableName });
        
        if (rpcError) {
          console.error(`%c[DATABASE ERROR] ${timestamp} - RPC error checking if table ${tableName} exists:`, 'color: #F44336; font-weight: bold', rpcError);
          // If both methods fail, assume table doesn't exist to be safe
          return false;
        }
        
        return rpcData === true;
      } catch (rpcCatchError) {
        console.error(`%c[DATABASE ERROR] ${timestamp} - RPC catch error:`, 'color: #F44336; font-weight: bold', rpcCatchError);
        // If both methods fail, assume table doesn't exist to be safe
        return false;
      }
    }
    
    // If we got here, the table exists
    console.log(`%c[DATABASE SUCCESS] ${timestamp} - Table '${tableName}' exists`, 'color: #4CAF50');
    return true;
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`%c[DATABASE ERROR] ${timestamp} - Unexpected error checking if table ${tableName} exists:`, 'color: #F44336; font-weight: bold', error);
    // In case of unexpected errors, assume the table doesn't exist to be safe
    return false;
  }
}

/**
 * Check if a connection already exists between two users
 * @param {Object} supabase - Supabase client instance
 * @param {string} initiatorId - ID of the user initiating the connection
 * @param {string} targetId - ID of the user being connected to
 * @returns {Promise<Object>} - Object with exists boolean and connection data if found
 */
async function checkConnectionExists(supabase, initiatorId, targetId) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`%c[DATABASE] ${timestamp} - Checking if connection exists between users ${initiatorId} and ${targetId}`, 'color: #2196F3');
    
    // First, check if the connections table exists
    const tableExists = await checkTableExists(supabase, 'connections');
    if (!tableExists) {
      console.error(`%c[DATABASE ERROR] ${timestamp} - Connections table does not exist`, 'color: #F44336; font-weight: bold');
      return { exists: false, data: null, error: 'Connections table does not exist' };
    }
    
    // Check for connection in either direction (A->B or B->A) using exact match
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`initiator_user_id.eq.${initiatorId},initiator_user_id.eq.${targetId}`)
      .or(`target_user_id.eq.${targetId},target_user_id.eq.${initiatorId}`);
      
    // Log the query for debugging
    console.log(`%c[DATABASE] ${timestamp} - Connection query executed with initiator=${initiatorId}, target=${targetId}`, 'color: #2196F3');
    
    if (error) {
      console.error(`%c[DATABASE ERROR] ${timestamp} - Error checking connection:`, 'color: #F44336; font-weight: bold', error);
      return { exists: false, data: null, error };
    }
    
    // Filter to find connections between these two specific users
    const connections = data ? data.filter(conn => 
      (conn.initiator_user_id === initiatorId && conn.target_user_id === targetId) || 
      (conn.initiator_user_id === targetId && conn.target_user_id === initiatorId)
    ) : [];
    
    const exists = connections.length > 0;
    console.log(`%c[DATABASE] ${timestamp} - Connection between users ${initiatorId} and ${targetId} ${exists ? 'exists' : 'does not exist'}`, 'color: #2196F3');
    
    if (exists) {
      console.log(`%c[DATABASE] ${timestamp} - Found ${connections.length} existing connection(s)`, 'color: #2196F3', connections);
    }
    
    return { 
      exists, 
      data: exists ? connections : null,
      error: null
    };
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`%c[DATABASE ERROR] ${timestamp} - Unexpected error checking connection:`, 'color: #F44336; font-weight: bold', error);
    return { exists: false, data: null, error };
  }
}

/**
 * Delete a connection between users
 * @param {Object} supabase - Supabase client instance
 * @param {string} connectionId - ID of the connection to delete
 * @returns {Promise<Object>} - Result of the deletion operation
 */
async function deleteConnection(supabase, connectionId) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`%c[DATABASE] ${timestamp} - Deleting connection with ID: ${connectionId}`, 'color: #2196F3');
    
    const { data, error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);
    
    if (error) {
      console.error(`%c[DATABASE ERROR] ${timestamp} - Error deleting connection:`, 'color: #F44336; font-weight: bold', error);
      return { success: false, error };
    }
    
    console.log(`%c[DATABASE SUCCESS] ${timestamp} - Connection deleted successfully`, 'color: #4CAF50; font-weight: bold');
    return { success: true, data };
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`%c[DATABASE ERROR] ${timestamp} - Unexpected error deleting connection:`, 'color: #F44336; font-weight: bold', error);
    return { success: false, error };
  }
}

/**
 * Create a notification for a user
 * @param {Object} supabase - Supabase client instance
 * @param {Object} notification - Notification object with type, message, sender_id, and recipient_id
 * @returns {Promise<Object>} - Result of the notification creation
 */
async function createNotification(supabase, notification) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`%c[DATABASE] ${timestamp} - Creating notification`, 'color: #2196F3', notification);
    
    // Check if notifications table exists
    const tableExists = await checkTableExists(supabase, 'notifications');
    if (!tableExists) {
      console.error(`%c[DATABASE ERROR] ${timestamp} - Notifications table does not exist`, 'color: #F44336; font-weight: bold');
      return { success: false, error: 'Notifications table does not exist' };
    }
    
    // Create the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          type: notification.type,
          message: notification.message,
          sender_id: notification.sender_id,
          recipient_id: notification.recipient_id,
          read: false,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error(`%c[DATABASE ERROR] ${timestamp} - Error creating notification:`, 'color: #F44336; font-weight: bold', error);
      return { success: false, error };
    }
    
    console.log(`%c[DATABASE SUCCESS] ${timestamp} - Notification created successfully`, 'color: #4CAF50; font-weight: bold');
    return { success: true, data };
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`%c[DATABASE ERROR] ${timestamp} - Unexpected error creating notification:`, 'color: #F44336; font-weight: bold', error);
    return { success: false, error };
  }
}

// Export functions to the window object for global access
window.checkTableExists = checkTableExists;
window.checkConnectionExists = checkConnectionExists;
window.deleteConnection = deleteConnection;
window.createNotification = createNotification;
