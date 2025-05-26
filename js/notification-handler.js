/**
 * Custom notification handler for ConnectSphere
 * Ensures both notification bells (navbar and fixed) trigger the notification panel
 * and displays the notification count
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the notification system to initialize
    setTimeout(function() {
        // Get the notification bells
        const navbarBell = document.getElementById('notification-bell');
        const fixedBell = document.querySelector('.notification-bell-fixed');
        
        // Function to toggle the notification panel
        function toggleNotificationPanel() {
            const panel = document.querySelector('.notification-panel');
            const overlay = document.querySelector('.notification-overlay');
            
            if (panel) {
                panel.classList.toggle('open');
                
                if (overlay) {
                    overlay.classList.toggle('active');
                }
                
                // If opening the panel, update its content
                if (panel.classList.contains('open') && typeof updateNotificationPanel === 'function') {
                    updateNotificationPanel(currentNotifications || []);
                }
            }
        }
        
        // Function to update notification count on bells
        function updateNotificationCount(notifications) {
            if (!notifications) return;
            
            // Count unread notifications
            const unreadCount = notifications.filter(notification => !notification.read).length;
            
            // Update navbar bell
            if (navbarBell) {
                if (unreadCount > 0) {
                    navbarBell.classList.add('has-unread');
                    navbarBell.setAttribute('data-count', unreadCount > 99 ? '99+' : unreadCount);
                } else {
                    navbarBell.classList.remove('has-unread');
                    navbarBell.removeAttribute('data-count');
                }
            }
            
            // Update fixed bell
            if (fixedBell) {
                if (unreadCount > 0) {
                    fixedBell.classList.add('has-unread');
                    fixedBell.setAttribute('data-count', unreadCount > 99 ? '99+' : unreadCount);
                } else {
                    fixedBell.classList.remove('has-unread');
                    fixedBell.removeAttribute('data-count');
                }
            }
            
            // No longer logging notification count updates
        }
        
        // Add click event to the navbar bell
        if (navbarBell) {
            navbarBell.addEventListener('click', function(e) {
                e.preventDefault();
                toggleNotificationPanel();
                // No longer logging notification bell clicks
            });
            // Notification handler attached to navbar bell
        }
        
        // Override the updateNotificationBell function to include count
        if (typeof window.updateNotificationBell === 'function') {
            const originalUpdateBell = window.updateNotificationBell;
            window.updateNotificationBell = function(notifications) {
                // Call original function
                originalUpdateBell(notifications);
                // Update count
                updateNotificationCount(notifications);
            };
        }
        
        // Check if we already have notifications and update count
        if (typeof window.currentNotifications !== 'undefined') {
            updateNotificationCount(window.currentNotifications);
        }
        
        // Expose functions globally
        window.toggleNotificationPanelFromNavbar = toggleNotificationPanel;
        window.updateNotificationCount = updateNotificationCount;
        
    }, 1000); // Wait 1 second to ensure the notification system is initialized
});
