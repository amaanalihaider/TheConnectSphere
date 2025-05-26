/**
 * Notification Demo for ConnectSphere
 * DISABLED - No longer showing demo notifications
 */

// Demo notifications are disabled
// Keeping this file to avoid breaking any references


/**
 * Show a notification
 * This is a simplified version of the function in notifications.js
 * Included here to ensure the demo works even if there are issues with the main notification system
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
}

// Show a demo notification
function showDemoNotification() {
  // Notification types to cycle through
  const notificationTypes = [
    'connection-request',
    'connection-accepted',
    'message'
  ];
  
  // Sample messages for each type
  const messages = {
    'connection-request': [
      'John Smith wants to connect with you',
      'Emma Johnson sent you a connection request',
      'Alex Williams wants to connect with you'
    ],
    'connection-accepted': [
      'Sarah Davis accepted your connection request',
      'Michael Brown is now connected with you',
      'Your connection request was accepted by David Wilson'
    ],
    'message': [
      'You received a new message',
      'Jessica Taylor sent you a message',
      'You have a new unread message from Ryan Moore'
    ]
  };
  
  // Randomly select notification type and message
  const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  const message = messages[type][Math.floor(Math.random() * messages[type].length)];
  
  // Show the notification
  showNotification(message, type);
  
  console.log('Demo notification shown:', { type, message });
}
