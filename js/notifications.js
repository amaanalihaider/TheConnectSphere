/**
 * Enhanced notification system for ConnectSphere
 * Features both toast notifications and a slide-out notification panel
 * Connected to Supabase database for real-time notifications
 */

// Notification state
let currentNotifications = [];
let currentUser = null;
let lastFetchTime = new Date();

// Initialize Supabase client from global variable
const supabase = supabaseClient;

/**
 * Get the current user from Supabase session
 */
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return profile || user;
  }
  return null;
}

// Initialize the notification system
document.addEventListener('DOMContentLoaded', async () => {
  // Create notification container for toast notifications
  if (!document.querySelector('.notification-container')) {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  // Create notification bell icon
  createNotificationBell();

  // Create notification panel
  createNotificationPanel();

  // Get current user
  currentUser = await getCurrentUser();
  
  console.log('Current user from auth:', currentUser);

  // Initialize with real data from Supabase
  if (currentUser && currentUser.id) {
    console.log('User authenticated, fetching notifications');
    await fetchNotifications();
  } else {
    console.log('User not authenticated, skipping notifications');
    // No longer using demo mode
    // initializeDemoNotifications();
  }

  // Setup event listeners
  setupEventListeners();

  // Create a test notification if we're authenticated but have no notifications
  if (currentUser && currentUser.id) {
    // First check if we have any notifications
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('recipient_id', currentUser.id)
      .limit(1);
    
    if (!existingNotifications || existingNotifications.length === 0) {
      console.log('No existing notifications found, creating a test notification');
      createTestNotification();
    }
  }

  // Setup real-time subscription for new notifications
  subscribeToNotifications();
});

/**
 * Create the notification bell icon
 */
function createNotificationBell() {
  // Create notification bell if it doesn't exist
  if (!document.querySelector('.notification-bell-fixed')) {
    const bell = document.createElement('div');
    bell.className = 'notification-bell notification-bell-fixed';
    bell.innerHTML = '<i class="fas fa-bell"></i>';
    bell.addEventListener('click', toggleNotificationPanel);
    document.body.appendChild(bell);
  }
}

/**
 * Create the notification panel
 */
function createNotificationPanel() {
  if (!document.querySelector('.notification-panel')) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    document.body.appendChild(overlay);

    // Create panel
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.innerHTML = `
      <div class="notification-panel-header">
        <div class="notification-panel-title">Notifications</div>
        <button class="notification-panel-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="notification-panel-body">
        <div class="notification-list">
          <!-- Notification items will be inserted here -->
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }
}

/**
 * Set up event listeners for the notification system
 */
function setupEventListeners() {
  // Bell icon click - open notification panel
  const bell = document.querySelector('.notification-bell-fixed');
  if (bell) {
    bell.addEventListener('click', toggleNotificationPanel);
  }

  // Close button click - close notification panel
  const closeBtn = document.querySelector('.notification-panel-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeNotificationPanel);
  }

  // Overlay click - close notification panel
  const overlay = document.querySelector('.notification-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeNotificationPanel);
  }

  // Escape key - close notification panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNotificationPanel();
    }
  });
}

/**
 * Toggle the notification panel open/closed
 */
function toggleNotificationPanel() {
  const panel = document.querySelector('.notification-panel');
  const overlay = document.querySelector('.notification-overlay');
  
  if (panel && overlay) {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      overlay.classList.remove('active');
    } else {
      panel.classList.add('open');
      overlay.classList.add('active');
      markAllAsRead();
    }
  }
}

/**
 * Close the notification panel
 */
function closeNotificationPanel() {
  const panel = document.querySelector('.notification-panel');
  const overlay = document.querySelector('.notification-overlay');
  
  if (panel && overlay) {
    panel.classList.remove('open');
    overlay.classList.remove('active');
  }
}

/**
 * Initialize demo notifications if not logged in
 */
function initializeDemoNotifications() {
  console.log('Initializing demo notifications');
  // Demo mode not needed anymore
}

/**
 * Create a test notification to demonstrate the notification system
 */
async function createTestNotification() {
  try {
    // Insert a test notification directly into the database
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          recipient_id: currentUser.id,
          sender_id: currentUser.id,
          type: 'welcome',
          message: 'Welcome to ConnectSphere! Your notification system is working.',
          read: false
        }
      ]);
      
    if (error) {
      console.error('Error creating test notification:', error);
    } else {
      console.log('Test notification created successfully');
      // Refresh notifications to show the new one
      fetchNotifications();
    }
  } catch (err) {
    console.error('Exception creating test notification:', err);
  }
}

/**
 * Fetch notifications from Supabase database
 */
async function fetchNotifications() {
  const timestamp = new Date().toISOString();
  console.log(`%c[NOTIFICATIONS] ${timestamp} - Starting notification fetch`, 'color: #9C27B0; font-weight: bold');
  
  if (!currentUser) {
    console.warn(`%c[NOTIFICATIONS WARNING] ${timestamp} - No current user found, skipping notification fetch`, 'color: #FF9800; font-weight: bold');
    updateNotificationPanel([]);
    updateNotificationBell([]);
    return;
  }
  
  console.log(`%c[NOTIFICATIONS] ${timestamp} - Fetching notifications for user: ${currentUser.id}`, 'color: #2196F3; font-weight: bold');
  
  try {
    // First, check if the notifications table exists using our utility function
    let tableExists = true;
    
    if (typeof window.checkTableExists === 'function') {
      console.log(`%c[NOTIFICATIONS] ${timestamp} - Using checkTableExists utility function`, 'color: #2196F3');
      tableExists = await window.checkTableExists(supabase, 'notifications');
      console.log(`%c[NOTIFICATIONS] ${timestamp} - Table check result: notifications table ${tableExists ? 'exists' : 'does not exist'}`, 'color: #2196F3');
    } else {
      console.warn(`%c[NOTIFICATIONS WARNING] ${timestamp} - Table check utility not available, assuming table exists`, 'color: #FF9800; font-weight: bold');
    }
    
    if (!tableExists) {
      console.error(`%c[NOTIFICATIONS ERROR] ${timestamp} - Notifications table does not exist in the database`, 'color: #F44336; font-weight: bold');
      console.log(`%c[NOTIFICATIONS INFO] ${timestamp} - Please ensure the notifications table is created in Supabase`, 'color: #607D8B; font-style: italic');
      
      // Show a user-friendly message
      Swal.fire({
        title: 'Notification System Unavailable',
        text: 'The notification system is currently unavailable. Please try again later.',
        icon: 'info',
        confirmButtonColor: '#8B5CF6',
      });
      
      updateNotificationPanel([]);
      updateNotificationBell([]);
      return;
    }
    
    // Fetch notifications for the current user with detailed logging
    console.log(`%c[NOTIFICATIONS] ${timestamp} - Executing query: SELECT * FROM notifications WHERE recipient_id = '${currentUser.id}' ORDER BY created_at DESC LIMIT 20`, 'color: #2196F3');
    
    const startTime = performance.now();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    const endTime = performance.now();
    
    console.log(`%c[NOTIFICATIONS PERFORMANCE] ${timestamp} - Query execution time: ${(endTime - startTime).toFixed(2)}ms`, 'color: #00BCD4; font-style: italic');
    
    if (error) {
      console.error(`%c[NOTIFICATIONS ERROR] ${timestamp} - Supabase error fetching notifications:`, 'color: #F44336; font-weight: bold', error);
      console.table({
        'Error Code': error.code || 'N/A',
        'Error Message': error.message || 'Unknown error',
        'Error Details': error.details || 'No details',
        'User ID': currentUser.id,
        'Timestamp': timestamp
      });
      
      // Show a user-friendly error message
      Swal.fire({
        title: 'Notification Error',
        text: 'There was an error fetching your notifications. Please refresh the page and try again.',
        icon: 'error',
        confirmButtonColor: '#8B5CF6',
      });
      
      updateNotificationPanel([]);
      updateNotificationBell([]);
      return;
    }
    
    // Log the raw response for debugging
    console.log(`%c[NOTIFICATIONS RAW] ${timestamp} - Raw Supabase response:`, 'color: #795548', data);
    
    console.log(`%c[NOTIFICATIONS SUCCESS] ${timestamp} - Notifications fetched: ${data ? data.length : 0} notifications found`, 'color: #4CAF50; font-weight: bold');
    
    if (data && data.length > 0) {
      // Log each notification for debugging
      console.groupCollapsed(`%c[NOTIFICATIONS DETAIL] ${timestamp} - Detailed notification data (${data.length} items)`, 'color: #2196F3');
      data.forEach((notification, index) => {
        console.log(`Notification #${index + 1}:`, {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          read: notification.read,
          created_at: notification.created_at,
          sender_id: notification.sender_id,
          recipient_id: notification.recipient_id
        });
      });
      console.groupEnd();
      
      // Store the current notifications and update UI
      currentNotifications = data;
      updateNotificationPanel(data);
      updateNotificationBell(data);
      
      // Check for any new notifications since last fetch
      const newNotifications = data.filter(notification => 
        new Date(notification.created_at) > lastFetchTime && !notification.read
      );
      
      if (newNotifications.length > 0) {
        console.log(`%c[NOTIFICATIONS] ${timestamp} - ${newNotifications.length} new notifications found since last check`, 'color: #4CAF50; font-weight: bold');
        
        // Show a toast notification for new notifications
        if (newNotifications.length === 1) {
          const notification = newNotifications[0];
          Swal.fire({
            title: 'New Notification',
            text: notification.message || 'You have a new notification',
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        } else {
          Swal.fire({
            title: 'New Notifications',
            text: `You have ${newNotifications.length} new notifications`,
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        }
      }
      
      // Update the last fetch time
      lastFetchTime = new Date();
    } else {
      console.log(`%c[NOTIFICATIONS INFO] ${timestamp} - No notifications found for user ${currentUser.id}`, 'color: #607D8B; font-style: italic');
      
      // Check if we should create a test notification for debugging
      if (window.location.search.includes('test_notification=true')) {
        console.log(`%c[NOTIFICATIONS DEBUG] ${timestamp} - Test parameter detected, creating test notification`, 'color: #9C27B0; font-weight: bold');
        createTestNotification();
      }
      
      updateNotificationPanel([]);
      updateNotificationBell([]);
    }
  } catch (error) {
    console.error(`%c[NOTIFICATIONS ERROR] ${timestamp} - Unexpected error fetching notifications:`, 'color: #F44336; font-weight: bold', error);
    console.trace('Stack trace for notification error');
    
    // Show a user-friendly error message
    Swal.fire({
      title: 'Notification System Error',
      text: 'An unexpected error occurred while fetching notifications. Please refresh the page.',
      icon: 'error',
      confirmButtonColor: '#8B5CF6',
    });
    
    updateNotificationPanel([]);
    updateNotificationBell([]);
  }
}

/**
 * Subscribe to real-time notifications from Supabase
 */
function subscribeToNotifications() {
  if (!currentUser) return;
  
  // Subscribe to notification inserts for the current user
  const subscription = supabase
    .channel('public:notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `recipient_id=eq.${currentUser.id}` 
      }, 
      (payload) => {
        console.log('Real-time notification received:', payload.new);
        // Add the new notification to our list
        currentNotifications = [payload.new, ...currentNotifications];
        updateNotificationPanel(currentNotifications);
        updateNotificationBell(currentNotifications);
        
        // Visually indicate there's a new notification by pulsing the bell
        const bell = document.querySelector('.notification-bell-fixed');
        if (bell) {
          bell.classList.add('pulse');
          setTimeout(() => {
            bell.classList.remove('pulse');
          }, 2000);
        }
      }
    )
    .subscribe();
    
  console.log('Subscribed to real-time notifications for user:', currentUser.id);
}

/**
 * Update the notification panel with notifications
 * @param {Array} notifications - Array of notification objects
 */
function updateNotificationPanel(notifications) {
  const panel = document.querySelector('.notification-panel');
  if (!panel) {
    console.log('Notification panel not found in DOM');
    return;
  }

  const notificationList = panel.querySelector('.notification-list');
  if (!notificationList) {
    console.log('Notification list element not found in panel');
    return;
  }
  
  // Clear existing notifications
  notificationList.innerHTML = '';
  
  if (!notifications || notifications.length === 0) {
    notificationList.innerHTML = '<div class="empty-state">No notifications</div>';
    return;
  }

  // Debug - log all notifications to console
  console.log('Rendering notifications in panel:', notifications);

  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Create notification items
  sortedNotifications.forEach(notification => {
    // Debug - log each notification being processed
    console.log('Processing notification:', notification);
    
    const item = document.createElement('div');
    // Add type class to the notification item
    item.className = `notification-item ${notification.type} ${notification.read ? '' : 'unread'}`;
    item.dataset.id = notification.id;
    
    // Add icon based on notification type
    let icon = 'bell';
    if (notification.type === 'connection-request') icon = 'user-plus';
    if (notification.type === 'connection-accepted') icon = 'handshake';
    if (notification.type === 'message') icon = 'envelope';
    
    item.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="notification-content">
        <p>${notification.message}</p>
        <span class="notification-time">${formatTimeAgo(notification.created_at)}</span>
      </div>
    `;
    
    notificationList.appendChild(item);
  });
  
  // Attach event listeners to mark as read when clicked
  attachNotificationClickHandlers();
  
  // If the panel is closed, make sure to show a visual indicator that there are notifications
  if (!panel.classList.contains('active') && notifications.some(n => !n.read)) {
    const bell = document.querySelector('.notification-bell-fixed');
    if (bell) {
      bell.classList.add('pulse');
    }
  }
}
/**
 * Attach click handlers to notification items to mark them as read when clicked
 */
function attachNotificationClickHandlers() {
  const notificationItems = document.querySelectorAll('.notification-item');
  
  notificationItems.forEach(item => {
    item.addEventListener('click', async function() {
      const notificationId = this.dataset.id;
      const notification = currentNotifications.find(n => n.id == notificationId);
      
      if (notification && !notification.read) {
        // Update in UI
        notification.read = true;
        this.classList.remove('unread');
        
        // Update in database
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);
            
          if (error) {
            console.error('Error marking notification as read:', error);
          } else {
            console.log('Notification marked as read:', notificationId);
            updateNotificationBell(currentNotifications);
          }
        } catch (err) {
          console.error('Failed to mark notification as read:', err);
        }
      }
    });
  });
}

/**
 * Update the notification bell icon based on unread notifications
 * @param {Array} notifications - Array of notification objects
 */
function updateNotificationBell(notifications) {
  const bell = document.querySelector('.notification-bell-fixed');
  if (!bell) {
    console.log('Notification bell not found in DOM');
    return;
  }
  
  if (!notifications) {
    console.log('No notifications provided to updateNotificationBell');
    return;
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Add or update the unread count indicator
  if (unreadCount > 0) {
    let countBadge = bell.querySelector('.notification-count');
    
    if (!countBadge) {
      countBadge = document.createElement('span');
      countBadge.className = 'notification-count';
      bell.appendChild(countBadge);
    }
    
    countBadge.textContent = unreadCount;
  } else {
    const countBadge = bell.querySelector('.notification-count');
    if (countBadge) {
      countBadge.remove();
    }
  }
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead() {
  if (!currentUser) {
    // Demo mode - just update UI
    currentNotifications.forEach(notification => {
      notification.read = true;
    });
    
    // Update UI
    const unreadItems = document.querySelectorAll('.notification-panel-item.unread');
    unreadItems.forEach(item => {
      item.classList.remove('unread');
    });
    
    updateNotificationBell(currentNotifications);
    return;
  }
  
  // Get all unread notification IDs
  const unreadIds = currentNotifications
    .filter(notification => !notification.read)
    .map(notification => notification.id);
  
  if (unreadIds.length === 0) return;
  
  try {
    // Update notifications in database
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);
    
    if (error) throw error;
    
    // Update UI
    const unreadItems = document.querySelectorAll('.notification-panel-item.unread');
    unreadItems.forEach(item => {
      item.classList.remove('unread');
    });
    
    // Update local state
    currentNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    updateNotificationBell(currentNotifications);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (connection-request, connection-accepted, message)
 * @param {number} duration - How long the notification should stay visible (in ms)
 */
function showNotification(message, type = 'connection-request', duration = 3000) {
  // Get or create notification container
  let container = document.querySelector('.notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div>${message}</div>
    <div class="progress"></div>
  `;

  // Add to container
  container.appendChild(notification);

  // Trigger animation to show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Set timeout to remove notification
  setTimeout(() => {
    notification.classList.add('hide');
    notification.classList.remove('show');

    // Remove from DOM after transition
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);

  // Add to sample notifications
  const newNotification = {
    id: Date.now(),
    type: type,
    message: message,
    created_at: new Date().toISOString(),
    read: false
  };
  sampleNotifications.unshift(newNotification);
  
  // Update bell and panel
  updateNotificationBell(sampleNotifications);
  if (document.querySelector('.notification-panel.open')) {
    updateNotificationPanel(sampleNotifications);
  }
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago")
 * @param {Date} date - The date to format
 * @returns {string} The formatted time string
 */
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  if (seconds < 10) return 'just now';
  
  return Math.floor(seconds) + ' seconds ago';
}

/**
 * Check for new notifications from the database
 * This function is called periodically to fetch new notifications
 */
async function checkForNewNotifications() {
  if (!currentUser || !currentUser.id) {
    console.log('No authenticated user, skipping new notifications check');
    return;
  }
  
  try {
    console.log('Checking for new notifications since', lastFetchTime.toISOString());
    
    // Fetch notifications that are newer than our last fetch time
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', currentUser.id)
      .gt('created_at', lastFetchTime.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error checking for new notifications:', error);
      return;
    }
    
    if (data && data.length > 0) {
      // Add new notifications to our list
      currentNotifications = [...data, ...currentNotifications];
      
      // Update UI
      updateNotificationPanel(currentNotifications);
      updateNotificationBell(currentNotifications);
      
      // Show toast for new notifications
      data.forEach(notification => {
        showNotification(notification.message, notification.type);
      });
      
      // Update the last fetch time
      lastFetchTime = new Date();
    }
  } catch (error) {
    console.error('Error checking for new notifications:', error);
  }
}

// Set up periodic checks for new notifications
let notificationCheckInterval;

function setupPeriodicNotificationChecks() {
  // Clear any existing interval
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
  
  // Check for new notifications every minute (60000ms)
  notificationCheckInterval = setInterval(async () => {
    if (currentUser) {
      await checkForNewNotifications();
    }
  }, 60000);
  
  // Do an initial check
  checkForNewNotifications();
}

// Setup periodic checks when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure we have the user info first
  setTimeout(() => {
    setupPeriodicNotificationChecks();
  }, 2000);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
});
