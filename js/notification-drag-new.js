/**
 * Notification Drag-and-Drop Functionality
 * Exact implementation from the test file with improvements for live dragging
 */

// Drag handling variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let currentDragElement = null;
let initialTransform = 0;
let isDragging = false;
let originalPosition = { left: 0, top: 0 };
let originalParent = null;
let originalNextSibling = null;

// Settings
let dragSettings = {
    swipeDirection: 'both', // 'left', 'right', or 'both'
    swipeThreshold: 30, // percentage of notification width
    animationSpeed: 300 // milliseconds
};

/**
 * Initialize drag functionality for all notification items
 */
function initNotificationDrag() {
    // Update CSS variables for animation
    document.documentElement.style.setProperty('--animation-speed', `${dragSettings.animationSpeed}ms`);
    
    // Set up existing notifications with drag handlers
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(setupSwipeListeners);
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
}

// Add global document event listeners
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

/**
 * Handle touch start event
 */
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    currentDragElement = this;
    initialTransform = 0;
    isDragging = true;
    
    // Store original position and parent
    const rect = this.getBoundingClientRect();
    originalPosition = {
        left: rect.left,
        top: rect.top
    };
    
    // Store original parent and sibling for later restoration
    originalParent = this.parentNode;
    originalNextSibling = this.nextSibling;
    
    // Move to body to ensure it's on top of everything
    document.body.appendChild(this);
    
    // Change styling for dragging
    this.style.position = 'fixed';
    this.style.left = `${rect.left}px`;
    this.style.top = `${rect.top}px`;
    this.style.width = `${rect.width}px`;
    this.style.zIndex = '10000';
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
        const containerWidth = document.querySelector('.notification-list').offsetWidth || window.innerWidth;
        const maxDistance = containerWidth * 0.8;
        const opacity = Math.max(0.2, 1 - (Math.abs(moveX) / maxDistance));
        currentDragElement.style.opacity = opacity;
        
        // Add swipe-left class when dragging left
        currentDragElement.classList.add('swipe-left');
        currentDragElement.classList.remove('swipe-right');
        
        // Check if dragged far enough to the left to delete
        if (moveX < -elementWidth * 0.7) {
            dismissNotification(currentDragElement, 'left');
            currentDragElement = null;
            isDragging = false;
            return;
        }
    } else if (moveX > 0 && dragSettings.swipeDirection !== 'left') {
        // Add swipe-right class when dragging right
        currentDragElement.classList.add('swipe-right');
        currentDragElement.classList.remove('swipe-left');
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
    
    // Store original position and parent
    const rect = this.getBoundingClientRect();
    originalPosition = {
        left: rect.left,
        top: rect.top
    };
    
    // Store original parent and sibling for later restoration
    originalParent = this.parentNode;
    originalNextSibling = this.nextSibling;
    
    // Move to body to ensure it's on top of everything
    document.body.appendChild(this);
    
    // Change styling for dragging
    this.style.position = 'fixed';
    this.style.left = `${rect.left}px`;
    this.style.top = `${rect.top}px`;
    this.style.width = `${rect.width}px`;
    this.style.zIndex = '10000';
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
        const containerWidth = document.querySelector('.notification-list').offsetWidth || window.innerWidth;
        const maxDistance = containerWidth * 0.8;
        const opacity = Math.max(0.2, 1 - (Math.abs(moveX) / maxDistance));
        currentDragElement.style.opacity = opacity;
        
        // Add swipe-left class when dragging left
        currentDragElement.classList.add('swipe-left');
        currentDragElement.classList.remove('swipe-right');
        
        // Check if dragged far enough to the left to delete
        if (moveX < -elementWidth * 0.7) {
            dismissNotification(currentDragElement, 'left');
            currentDragElement = null;
            isDragging = false;
            return;
        }
    } else if (moveX > 0 && dragSettings.swipeDirection !== 'left') {
        // Add swipe-right class when dragging right
        currentDragElement.classList.add('swipe-right');
        currentDragElement.classList.remove('swipe-left');
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
    // Get notification ID
    const notificationId = element.dataset.id;
    
    // Store the notification panel and list for height transitions
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationList = document.querySelector('.notification-list');
    
    // Get initial heights for smooth transition
    const panelInitialHeight = notificationPanel.offsetHeight;
    const listInitialHeight = notificationList.offsetHeight;
    
    // Calculate where to animate to (off-screen to the left)
    const width = element.offsetWidth;
    const viewportWidth = window.innerWidth;
    
    // Animate the dismissal with opacity fade
    element.style.transition = `all ${dragSettings.animationSpeed}ms ease`;
    
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
        // Calculate the element's height including margin
        const elementHeight = element.offsetHeight + 8; // 8px is the margin-bottom
        
        // Set explicit heights for smooth transition
        notificationPanel.style.height = `${panelInitialHeight}px`;
        notificationList.style.height = `${listInitialHeight}px`;
        
        // Force reflow to ensure the height is applied
        notificationPanel.offsetHeight;
        
        // Before removing, ensure element is back in the flow so others move up
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.height = '0';
        element.style.margin = '0';
        element.style.padding = '0';
        element.style.border = '0';
        
        // Animate to new height
        notificationPanel.style.height = `${panelInitialHeight - elementHeight}px`;
        notificationList.style.height = `${listInitialHeight - elementHeight}px`;
        
        // After height collapses, remove from DOM
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            // Reset height to auto after animation
            notificationPanel.style.height = '';
            notificationList.style.height = '';
            
            // Update notification state in the database
            deleteNotificationFromDatabase(notificationId);
            
            // Update notification count
            updateNotificationCount();
            
            // Check if we need to show empty state
            checkEmptyState();
        }, dragSettings.animationSpeed / 2);
    }, dragSettings.animationSpeed / 2);
}

/**
 * Reset a notification to its original position
 */
function resetNotificationPosition(element) {
    // Return to original position in the notification list
    element.style.transition = `all ${dragSettings.animationSpeed}ms ease`;
    element.style.left = `${originalPosition.left}px`;
    element.style.top = `${originalPosition.top}px`;
    element.style.opacity = '1';
    element.classList.remove('dragging', 'swipe-left', 'swipe-right');
    
    // After animation, restore to original position in DOM
    setTimeout(() => {
        // Restore to original parent
        if (originalParent) {
            if (originalNextSibling) {
                originalParent.insertBefore(element, originalNextSibling);
            } else {
                originalParent.appendChild(element);
            }
        }
        
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.width = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
        element.style.transition = '';
        element.style.transform = '';
    }, dragSettings.animationSpeed);
}

/**
 * Delete notification from database
 */
async function deleteNotificationFromDatabase(notificationId) {
    if (!notificationId) return;
    
    try {
        // Remove from local state
        currentNotifications = currentNotifications.filter(n => n.id != notificationId);
        
        // Remove from database
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);
            
        if (error) {
            console.error('Error deleting notification:', error);
        } else {
            console.log('Notification deleted:', notificationId);
        }
    } catch (err) {
        console.error('Failed to delete notification:', err);
    }
}

/**
 * Update notification count
 */
function updateNotificationCount() {
    // Update the notification bell count
    updateNotificationBell(currentNotifications);
    
    // Check if we need to show the empty state
    checkEmptyState();
}

/**
 * Check if we need to show the empty state
 */
function checkEmptyState() {
    const notificationList = document.querySelector('.notification-list');
    if (notificationList && notificationList.querySelectorAll('.notification-item').length === 0 && !notificationList.querySelector('.empty-state')) {
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
    const notificationList = document.querySelector('.notification-list');
    const emptyState = notificationList ? notificationList.querySelector('.empty-state') : null;
    if (emptyState) {
        emptyState.remove();
    }
}
