/**
 * Notification Swipe Test
 * Implementing swipe-to-dismiss functionality for notifications
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notificationList = document.getElementById('notification-list');
    const addNotificationBtn = document.getElementById('add-notification');
    const clearAllBtn = document.getElementById('clear-all');
    const swipeDirectionSelect = document.getElementById('swipe-direction');
    const swipeThresholdSlider = document.getElementById('swipe-threshold');
    const thresholdValueDisplay = document.getElementById('threshold-value');
    const animationSpeedSlider = document.getElementById('animation-speed');
    const speedValueDisplay = document.getElementById('speed-value');

    // Settings
    let settings = {
        swipeDirection: 'both', // 'left', 'right', or 'both'
        swipeThreshold: 30, // percentage of notification width
        animationSpeed: 300 // milliseconds
    };

    // Sample notification data
    const sampleNotifications = [
        {
            id: 1,
            type: 'connection-request',
            icon: 'fa-user-plus',
            content: '<strong>Sarah Johnson</strong> sent you a connection request',
            time: '2 minutes ago'
        },
        {
            id: 2,
            type: 'message',
            icon: 'fa-comment',
            content: '<strong>Michael Chen</strong> sent you a new message',
            time: '15 minutes ago'
        },
        {
            id: 3,
            type: 'connection-accepted',
            icon: 'fa-check-circle',
            content: '<strong>Emma Watson</strong> accepted your connection request',
            time: '1 hour ago'
        },
        {
            id: 4,
            type: 'message',
            icon: 'fa-comment',
            content: '<strong>David Miller</strong> mentioned you in a comment',
            time: '3 hours ago'
        }
    ];

    // Drag handling variables
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let currentDragElement = null;
    let initialTransform = 0;
    let isDragging = false;
    let originalPosition = { left: 0, top: 0 };

    // Initialize the notification panel
    initializeNotifications();

    // Event listeners for settings
    swipeDirectionSelect.addEventListener('change', updateSettings);
    swipeThresholdSlider.addEventListener('input', updateSettings);
    animationSpeedSlider.addEventListener('input', updateSettings);

    // Event listeners for buttons
    addNotificationBtn.addEventListener('click', addRandomNotification);
    clearAllBtn.addEventListener('click', clearAllNotifications);

    /**
     * Initialize the notification panel with event listeners
     */
    function initializeNotifications() {
        // Update settings displays
        updateSettings();
        
        // Add empty state if no notifications
        checkEmptyState();
    }

    /**
     * Update settings based on user input
     */
    function updateSettings() {
        settings.swipeDirection = swipeDirectionSelect.value;
        settings.swipeThreshold = parseInt(swipeThresholdSlider.value);
        settings.animationSpeed = parseInt(animationSpeedSlider.value);
        
        // Update display values
        thresholdValueDisplay.textContent = `${settings.swipeThreshold}%`;
        speedValueDisplay.textContent = `${settings.animationSpeed}ms`;
        
        // Update CSS variables
        document.documentElement.style.setProperty('--animation-speed', `${settings.animationSpeed}ms`);
    }

    /**
     * Add a random notification from the sample data
     */
    function addRandomNotification() {
        // Select a random notification from samples
        const randomIndex = Math.floor(Math.random() * sampleNotifications.length);
        const notification = { ...sampleNotifications[randomIndex] };
        
        // Generate a unique ID
        notification.id = Date.now();
        
        // Add to the list
        addNotification(notification);
    }

    /**
     * Add a notification to the panel
     */
    function addNotification(notification) {
        // Remove empty state if it exists
        removeEmptyState();
        
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item ${notification.type} new`;
        notificationElement.dataset.id = notification.id;
        
        notificationElement.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <p>${notification.content}</p>
                <div class="notification-time">${notification.time}</div>
            </div>
        `;
        
        // Add to the list
        notificationList.prepend(notificationElement);
        
        // Add touch event listeners for swipe
        setupSwipeListeners(notificationElement);
    }

    /**
     * Set up drag event listeners for a notification
     */
    function setupSwipeListeners(element) {
        // Make the element draggable
        element.style.cursor = 'grab';
        
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Mouse events for desktop testing
        element.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    /**
     * Handle touch start event
     */
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        currentDragElement = this;
        initialTransform = 0;
        isDragging = true;
        
        // Store original position
        const rect = this.getBoundingClientRect();
        originalPosition = {
            left: rect.left,
            top: rect.top
        };
        
        // Change styling for dragging
        this.style.position = 'fixed';
        this.style.left = `${rect.left}px`;
        this.style.top = `${rect.top}px`;
        this.style.width = `${rect.width}px`;
        this.style.zIndex = '1000';
        this.style.opacity = '1';
        this.style.transform = 'none';
        this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        
        // Add a dragging class
        this.classList.add('dragging');
        this.classList.remove('swipe-left', 'swipe-right');
    }

    /**
     * Handle touch move event
     */
    function handleTouchMove(e) {
        if (!currentDragElement || !isDragging) return;
        
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
        
        // Calculate movement distance
        const moveX = touchEndX - touchStartX;
        const moveY = touchEndY - touchStartY;
        
        // Update element position to follow finger/cursor
        const newLeft = originalPosition.left + moveX;
        const newTop = originalPosition.top + moveY;
        
        currentDragElement.style.left = `${newLeft}px`;
        currentDragElement.style.top = `${newTop}px`;
        
        // Calculate opacity based on how far left the element has moved
        // We'll focus on horizontal movement to the left for deletion
        if (moveX < 0) {
            const elementWidth = currentDragElement.offsetWidth;
            const containerWidth = notificationList.offsetWidth;
            const maxDistance = containerWidth * 0.8;
            const opacity = Math.max(0.2, 1 - (Math.abs(moveX) / maxDistance));
            currentDragElement.style.opacity = opacity;
            
            // Check if dragged far enough to the left to delete
            if (moveX < -elementWidth * 0.7) {
                dismissNotification(currentDragElement, 'left');
                currentDragElement = null;
                isDragging = false;
                return;
            }
        }
    }

    /**
     * Handle touch end event
     */
    function handleTouchEnd() {
        if (!currentDragElement || !isDragging) return;
        
        // Get current position relative to original position
        const rect = currentDragElement.getBoundingClientRect();
        const moveX = rect.left - originalPosition.left;
        
        // Check if we should delete or reset
        const elementWidth = currentDragElement.offsetWidth;
        
        if (moveX < -elementWidth * 0.5) {
            // Moved far enough left to delete
            dismissNotification(currentDragElement, 'left');
        } else {
            // Return to original position
            resetNotificationPosition(currentDragElement);
        }
        
        // Reset drag state
        isDragging = false;
        currentDragElement = null;
    }

    /**
     * Handle mouse down event (for desktop testing)
     */
    function handleMouseDown(e) {
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        currentDragElement = this;
        initialTransform = 0;
        isDragging = true;
        
        // Store original position
        const rect = this.getBoundingClientRect();
        originalPosition = {
            left: rect.left,
            top: rect.top
        };
        
        // Change styling for dragging
        this.style.position = 'fixed';
        this.style.left = `${rect.left}px`;
        this.style.top = `${rect.top}px`;
        this.style.width = `${rect.width}px`;
        this.style.zIndex = '1000';
        this.style.opacity = '1';
        this.style.transform = 'none';
        this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        
        // Add a dragging class
        this.classList.add('dragging');
        this.classList.remove('swipe-left', 'swipe-right');
        
        // Prevent text selection during drag
        e.preventDefault();
    }

    /**
     * Handle mouse move event (for desktop testing)
     */
    function handleMouseMove(e) {
        if (!currentDragElement || !isDragging) return;
        
        touchEndX = e.clientX;
        touchEndY = e.clientY;
        
        // Calculate movement distance
        const moveX = touchEndX - touchStartX;
        const moveY = touchEndY - touchStartY;
        
        // Update element position to follow cursor
        const newLeft = originalPosition.left + moveX;
        const newTop = originalPosition.top + moveY;
        
        currentDragElement.style.left = `${newLeft}px`;
        currentDragElement.style.top = `${newTop}px`;
        
        // Calculate opacity based on how far left the element has moved
        // We'll focus on horizontal movement to the left for deletion
        if (moveX < 0) {
            const elementWidth = currentDragElement.offsetWidth;
            const containerWidth = notificationList.offsetWidth;
            const maxDistance = containerWidth * 0.8;
            const opacity = Math.max(0.2, 1 - (Math.abs(moveX) / maxDistance));
            currentDragElement.style.opacity = opacity;
            
            // Check if dragged far enough to the left to delete
            if (moveX < -elementWidth * 0.7) {
                dismissNotification(currentDragElement, 'left');
                currentDragElement = null;
                isDragging = false;
                return;
            }
        }
    }

    /**
     * Handle mouse up event (for desktop testing)
     */
    function handleMouseUp(e) {
        if (!currentDragElement || !isDragging) return;
        
        // Get current position relative to original position
        const rect = currentDragElement.getBoundingClientRect();
        const moveX = rect.left - originalPosition.left;
        
        // Check if we should delete or reset
        const elementWidth = currentDragElement.offsetWidth;
        
        if (moveX < -elementWidth * 0.5) {
            // Moved far enough left to delete
            dismissNotification(currentDragElement, 'left');
        } else {
            // Return to original position
            resetNotificationPosition(currentDragElement);
        }
        
        // Reset drag state
        isDragging = false;
        currentDragElement = null;
    }

    /**
     * Dismiss a notification with animation
     */
    function dismissNotification(element, direction) {
        // Calculate where to animate to (off-screen to the left)
        const width = element.offsetWidth;
        const viewportWidth = window.innerWidth;
        
        // Animate the dismissal with opacity fade
        element.style.transition = `all ${settings.animationSpeed}ms ease`;
        
        if (direction === 'left') {
            // Move off-screen to the left
            element.style.left = `-${width}px`;
        } else {
            // Move off-screen to the right
            element.style.left = `${viewportWidth}px`;
        }
        
        element.style.opacity = '0';
        element.classList.add('removing');
        
        // After animation, remove the element
        setTimeout(() => {
            // Before removing, ensure element is back in the flow so others move up
            element.style.position = '';
            element.style.left = '';
            element.style.top = '';
            element.style.height = '0';
            element.style.margin = '0';
            element.style.padding = '0';
            element.style.border = '0';
            
            // After height collapses, remove from DOM
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                
                // Check if we need to show empty state
                checkEmptyState();
            }, settings.animationSpeed / 2);
        }, settings.animationSpeed / 2);
    }

    /**
     * Reset a notification to its original position
     */
    function resetNotificationPosition(element) {
        // Return to original position in the notification list
        element.style.transition = `all ${settings.animationSpeed}ms ease`;
        element.style.left = `${originalPosition.left}px`;
        element.style.top = `${originalPosition.top}px`;
        element.style.opacity = '1';
        element.classList.remove('dragging', 'swipe-left', 'swipe-right');
        
        // After animation, restore normal positioning
        setTimeout(() => {
            element.style.position = '';
            element.style.left = '';
            element.style.top = '';
            element.style.width = '';
            element.style.zIndex = '';
            element.style.boxShadow = '';
            element.style.transition = '';
            element.style.transform = '';
        }, settings.animationSpeed);
    }

    /**
     * Clear all notifications
     */
    function clearAllNotifications() {
        const notifications = notificationList.querySelectorAll('.notification-item');
        
        // Add removing class to all notifications
        notifications.forEach(notification => {
            notification.classList.add('removing');
        });
        
        // After animation, remove from DOM
        setTimeout(() => {
            notificationList.innerHTML = '';
            checkEmptyState();
        }, settings.animationSpeed);
    }

    /**
     * Check if we need to show the empty state
     */
    function checkEmptyState() {
        const notifications = notificationList.querySelectorAll('.notification-item');
        if (notifications.length === 0 && !notificationList.querySelector('.empty-state')) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = 'No notifications yet';
            notificationList.appendChild(emptyState);
        }
    }

    /**
     * Remove the empty state if it exists
     */
    function removeEmptyState() {
        const emptyState = notificationList.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    // Add initial sample notifications
    sampleNotifications.forEach(addNotification);
});
