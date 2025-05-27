// Messaging system for ConnectSphere
// This file handles the real-time messaging functionality

// Main initialization when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authRequired = document.getElementById('auth-required');
    const messagingInterface = document.getElementById('messaging-interface');
    const conversationsList = document.getElementById('conversationsList');
    const noConversations = document.getElementById('noConversations');
    const conversationsSpinner = document.getElementById('conversationsSpinner');
    const noChatSelected = document.getElementById('noChatSelected');
    const activeChatView = document.getElementById('activeChatView');
    const messagesList = document.getElementById('messagesList');
    const messagesSpinner = document.getElementById('messagesSpinner');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const backToList = document.getElementById('backToList');
    const chatUsername = document.getElementById('chatUsername');
    const chatUserStatus = document.getElementById('chatUserStatus');
    const chatUserAvatar = document.getElementById('chatUserAvatar');
    const refreshChat = document.getElementById('refreshChat');
    const newMessageBtn = document.getElementById('newMessageBtn');
    const searchConversations = document.getElementById('searchConversations');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // Modal elements
    const newConversationModal = document.getElementById('newConversationModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const userSearch = document.getElementById('userSearch');
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    const searchSpinner = document.getElementById('searchSpinner');
    const noResultsFound = document.getElementById('noResultsFound');
    
    // Emoji picker elements
    const emojiButton = document.getElementById('emojiButton');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    
    // State variables
    let currentUser = null;
    let currentConversation = null;
    let currentRecipient = null;
    let conversations = [];
    let messages = [];
    let messagesSubscription = null;
    let conversationsSubscription = null;
    let typingTimeout = null;
    let lastTypingSignal = 0;
    let isLoadingMore = false;
    let hasMoreMessages = true;
    let oldestMessageTimestamp = null;
    let searchTimeout = null;
    let allUsers = [];
    
    // Initialize the app
    init();
    
    // Main initialization function
    async function init() {
        // Check if user is authenticated
        await checkUserAuth();
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up real-time subscriptions if authenticated
        if (currentUser) {
            setupRealTimeSubscriptions();
        }
    }
    
    // Check if the user is authenticated
    async function checkUserAuth() {
        try {
            console.log('Checking authentication...');
            const session = await supabaseClient.auth.getSession();
            console.log('Auth session result:', session);
            
            if (session?.data?.session) {
                console.log('User authenticated:', session.data.session.user.email);
                currentUser = session.data.session.user;
                
                // Get user profile
                const { data: profile, error: profileError } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                
                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                } else if (profile) {
                    console.log('User profile loaded:', profile.username);
                    currentUser.profile = profile;
                }
                
                // Debug DOM elements
                console.log('authRequired element:', authRequired);
                console.log('messagingInterface element:', messagingInterface);
                console.log('conversationsList element:', conversationsList);
                console.log('noConversations element:', noConversations);
                
                // Show messaging interface
                authRequired.classList.add('hidden');
                messagingInterface.classList.remove('hidden');
                
                // Load conversations
                console.log('Loading conversations...');
                loadConversations();
            } else {
                console.log('User not authenticated, showing auth required message');
                // Show auth required message
                authRequired.classList.remove('hidden');
                messagingInterface.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            // Show auth required message as fallback
            authRequired.classList.remove('hidden');
            messagingInterface.classList.add('hidden');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Send message on button click
        sendButton.addEventListener('click', sendMessage);
        
        // Send message on Enter key (but allow Shift+Enter for new line)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Back to conversation list (mobile view)
        backToList.addEventListener('click', function() {
            noChatSelected.classList.remove('hidden');
            activeChatView.classList.add('hidden');
        });
        
        // Refresh current chat
        refreshChat.addEventListener('click', function() {
            if (currentConversation) {
                loadMessages(currentConversation.id);
            }
        });
        
        // New message button
        newMessageBtn.addEventListener('click', function() {
            showNewConversationModal();
        });
        
        // Close modal button
        closeModalBtn.addEventListener('click', function() {
            hideNewConversationModal();
        });
        
        // Close modal when clicking outside
        newConversationModal.addEventListener('click', function(e) {
            if (e.target === newConversationModal) {
                hideNewConversationModal();
            }
        });
        
        // User search input
        userSearch.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            // Clear existing timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            // Set new timeout to prevent too many API calls
            searchTimeout = setTimeout(() => {
                if (query.length >= 2) {
                    searchUsers(query);
                } else {
                    searchResultsList.innerHTML = '';
                    noResultsFound.classList.add('hidden');
                }
            }, 300);
        });
        
        // Search conversations
        searchConversations.addEventListener('input', function(e) {
            const query = e.target.value.trim().toLowerCase();
            filterConversations(query);
        });
        
        // Typing indicator
        messageInput.addEventListener('input', function() {
            const now = Date.now();
            
            // Only send typing indicator every 2 seconds
            if (now - lastTypingSignal > 2000) {
                sendTypingIndicator();
                lastTypingSignal = now;
            }
            
            // Clear existing timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Set timeout to hide typing indicator after 2 seconds of inactivity
            typingTimeout = setTimeout(() => {
                // This would be used if we were implementing typing indicators
                // For now, this is just a placeholder
            }, 2000);
        });
        
        // Emoji picker toggle
        emojiButton.addEventListener('click', function() {
            emojiPicker.classList.toggle('hidden');
        });
        
        // Close emoji picker when clicking outside
        document.addEventListener('click', function(e) {
            if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
                emojiPicker.classList.add('hidden');
            }
        });
        
        // Emoji buttons
        emojiButtons.forEach(button => {
            button.addEventListener('click', function() {
                const emoji = this.textContent;
                messageInput.value += emoji;
                messageInput.focus();
            });
        });
        
        // Infinite scroll for messages
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.addEventListener('scroll', function() {
            // If scrolled to top and not already loading more messages
            if (messagesContainer.scrollTop === 0 && !isLoadingMore && hasMoreMessages) {
                loadMoreMessages();
            }
        });
    }
    
    // Set up real-time subscriptions
    function setupRealTimeSubscriptions() {
        // Subscribe to new messages in conversations the user is part of
        conversationsSubscription = supabaseClient
            .channel('conversation_updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'conversations',
                filter: `member1_id=eq.${currentUser.id}`
            }, handleConversationUpdate)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'conversations',
                filter: `member2_id=eq.${currentUser.id}`
            }, handleConversationUpdate)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'conversations',
                filter: `member1_id=eq.${currentUser.id}`
            }, handleNewConversation)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'conversations',
                filter: `member2_id=eq.${currentUser.id}`
            }, handleNewConversation)
            .subscribe();
    }
    
    // Subscribe to messages for the current conversation using Supabase realtime
    function subscribeToMessages(conversationId) {
        console.log('Setting up true real-time subscription for messages in conversation:', conversationId);
        
        // Unsubscribe from previous subscription if exists
        if (messagesSubscription) {
            messagesSubscription.unsubscribe();
        }
        
        // Create new subscription using Supabase realtime
        messagesSubscription = supabaseClient
            .channel(`messages:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, (payload) => {
                console.log('New message received from realtime:', payload);
                const newMessage = payload.new;
                
                // Skip if this message is already in our list (avoid duplicates)
                if (messages.some(m => m.id === newMessage.id)) {
                    console.log('Message already exists in UI, skipping:', newMessage.id);
                    return;
                }
                
                // Skip if this is our own message and we have a temporary version of it
                // (optimistic UI already showed it)
                if (newMessage.sender_id === currentUser.id) {
                    const tempMessage = messages.find(m => 
                        m.id.toString().startsWith('temp-') && 
                        m.sender_id === newMessage.sender_id && 
                        m.message_text === newMessage.message_text
                    );
                    
                    if (tempMessage) {
                        console.log('Replacing temporary message with real one:', tempMessage.id, '->', newMessage.id);
                        // Replace the temporary message with the real one
                        const tempIndex = messages.findIndex(m => m.id === tempMessage.id);
                        if (tempIndex !== -1) {
                            messages[tempIndex] = newMessage;
                            
                            // Update the UI element with the correct ID
                            const tempEl = document.querySelector(`.message[data-id="${tempMessage.id}"]`);
                            if (tempEl) {
                                tempEl.dataset.id = newMessage.id;
                            }
                        }
                        return;
                    }
                }
                
                // If we get here, this is a new message we haven't seen before
                // Add message to our local array
                messages.push(newMessage);
                // Add to UI
                addMessageToUI(newMessage);
                // Scroll to bottom
                scrollToBottom();
            })
            .subscribe((status) => {
                console.log(`Realtime subscription status for messages:${conversationId}:`, status);
            });
    }
    
    // Handle new message from subscription
    function handleNewMessage(payload) {
        // Handle different event types (INSERT, UPDATE, DELETE)
        if (payload.eventType === 'DELETE') {
            console.log('Message deleted:', payload.old);
            // Handle message deletion if needed
            return;
        }
        
        const newMessage = payload.new;
        console.log('Processing new message:', newMessage);
        
        // Check if this is a real message (not a temp ID)
        if (!newMessage || !newMessage.id || newMessage.id.toString().startsWith('temp-')) {
            console.log('Ignoring temporary message in real-time handler');
            return;
        }
        
        // Check if we have a temp version of this message (by checking conversation and content)
        const tempMessageIndex = messages.findIndex(m => 
            m.id && m.id.toString().startsWith('temp-') && 
            m.conversation_id === newMessage.conversation_id && 
            m.message_text === newMessage.message_text &&
            m.sender_id === newMessage.sender_id
        );
        
        if (tempMessageIndex !== -1) {
            // We found a temporary version of this message, replace it
            console.log('Replacing temporary message with real message');
            const tempId = messages[tempMessageIndex].id;
            messages[tempMessageIndex] = newMessage;
            
            // Update the UI element
            const tempEl = document.querySelector(`.message[data-id="${tempId}"]`);
            if (tempEl) {
                tempEl.dataset.id = newMessage.id;
            }
            return;
        }
        
        // Only add message if it's not already in the list and belongs to current conversation
        if (!messages.some(m => m.id === newMessage.id) && 
            currentConversation && newMessage.conversation_id === currentConversation.id) {
            console.log('Adding new message to UI');
            messages.push(newMessage);
            
            // Add message to UI
            addMessageToUI(newMessage);
            
            // Always scroll to bottom for new messages
            scrollToBottom();
            
            // Mark as read if it's from the other user
            if (newMessage.sender_id !== currentUser.id) {
                markMessageAsRead(newMessage.id);
                
                // Also update the conversation's last message info
                if (currentConversation) {
                    currentConversation.last_message_text = newMessage.message_text;
                    currentConversation.last_message_time = newMessage.created_at;
                }
            }
        } else {
            console.log('Message already exists or does not belong to current conversation');
        }
    }
    
    // Handle conversation update from subscription
    function handleConversationUpdate(payload) {
        const updatedConversation = payload.new;
        
        // Update conversation in the list
        const index = conversations.findIndex(c => c.id === updatedConversation.id);
        if (index !== -1) {
            conversations[index] = {...conversations[index], ...updatedConversation};
            
            // Update UI
            updateConversationInUI(conversations[index]);
            
            // If this is the current conversation, update UI elements
            if (currentConversation && currentConversation.id === updatedConversation.id) {
                // Update last message if changed
                if (updatedConversation.last_message_text !== currentConversation.last_message_text) {
                    currentConversation.last_message_text = updatedConversation.last_message_text;
                    currentConversation.last_message_time = updatedConversation.last_message_time;
                }
                
                // If unread count changed and we're viewing this conversation, mark as read
                if (currentUser.id === updatedConversation.member1_id && updatedConversation.unread_count_member1 > 0) {
                    markConversationAsRead(updatedConversation.id);
                } else if (currentUser.id === updatedConversation.member2_id && updatedConversation.unread_count_member2 > 0) {
                    markConversationAsRead(updatedConversation.id);
                }
            }
        }
    }
    
    // Handle new conversation from subscription
    async function handleNewConversation(payload) {
        const newConversation = payload.new;
        
        // Check if conversation already exists in our list
        const existingIndex = conversations.findIndex(c => c.id === newConversation.id);
        if (existingIndex !== -1) {
            // Conversation already exists, just update it
            conversations[existingIndex] = {...conversations[existingIndex], ...newConversation};
            updateConversationInUI(conversations[existingIndex]);
            return;
        }
        
        // Fetch the profiles for both members
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('profiles')
            .select('id, first_name, last_name, username')
            .in('id', [newConversation.member1_id, newConversation.member2_id]);
            
        if (profilesError) {
            console.error('Error fetching profiles for new conversation:', profilesError);
            return;
        }
        
        // Create a map of user ID to profile
        const profileMap = {};
        profiles.forEach(profile => {
            profileMap[profile.id] = profile;
        });
        
        // Add member profile data to the conversation
        newConversation.member1 = profileMap[newConversation.member1_id] || { id: newConversation.member1_id, username: 'Unknown User' };
        newConversation.member2 = profileMap[newConversation.member2_id] || { id: newConversation.member2_id, username: 'Unknown User' };
        
        // Add to conversations list at the beginning (most recent)
        conversations.unshift(newConversation);
        
        // Update UI - add the new conversation at the top
        if (conversationsList.firstChild) {
            // If there are existing conversations, add before the first one
            const newConversationEl = document.createElement('div');
            addConversationToUI(newConversation);
            
            // If we previously had no conversations, hide the no conversations message
            if (conversations.length === 1) {
                noConversations.classList.add('hidden');
            }
        } else {
            // If this is the first conversation, just add it and hide the no conversations message
            addConversationToUI(newConversation);
            noConversations.classList.add('hidden');
        }
    }
    
    // Load all conversations for the current user
    async function loadConversations() {
        try {
            // Show loading spinner
            conversationsSpinner.classList.remove('hidden');
            noConversations.classList.add('hidden');
            
            // Query for conversations where the current user is a participant
            const { data, error } = await supabaseClient
                .from('conversations')
                .select('*')
                .or(`member1_id.eq.${currentUser.id},member2_id.eq.${currentUser.id}`)
                .order('updated_at', { ascending: false });
                
            // If we have conversations, get the user profiles for each one
            if (!error && data && data.length > 0) {
                // Get all unique user IDs from the conversations
                const userIds = new Set();
                data.forEach(conv => {
                    userIds.add(conv.member1_id);
                    userIds.add(conv.member2_id);
                });
                
                // Fetch all profiles in one query
                const { data: profiles, error: profilesError } = await supabaseClient
                    .from('profiles')
                    .select('id, first_name, last_name, username')
                    .in('id', Array.from(userIds));
                
                if (!profilesError && profiles) {
                    // Create a map of user ID to profile
                    const profileMap = {};
                    profiles.forEach(profile => {
                        profileMap[profile.id] = profile;
                    });
                    
                    // Add member profile data to each conversation
                    data.forEach(conv => {
                        conv.member1 = profileMap[conv.member1_id] || { id: conv.member1_id, username: 'Unknown User' };
                        conv.member2 = profileMap[conv.member2_id] || { id: conv.member2_id, username: 'Unknown User' };
                    });
                }
            }
            
            if (error) {
                throw error;
            }
            
            // Process conversations
            conversations = data || [];
            
            // Hide loading spinner
            conversationsSpinner.classList.add('hidden');
            
            // Show no conversations message if empty
            if (conversations.length === 0) {
                noConversations.classList.remove('hidden');
            } else {
                noConversations.classList.add('hidden');
                
                // Clear current list
                conversationsList.innerHTML = '';
                
                // Add conversations to UI
                conversations.forEach(conversation => {
                    addConversationToUI(conversation);
                });
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            // Hide loading spinner and show error
            conversationsSpinner.classList.add('hidden');
            noConversations.classList.remove('hidden');
            noConversations.innerHTML = `
                <i class="fas fa-exclamation-circle text-3xl mb-2 text-red-500"></i>
                <p>Error loading conversations</p>
            `;
        }
    }
// Part 2 of the messaging functionality - Copy and append to messaging.js

// Add a conversation to the UI
function addConversationToUI(conversation) {
    // Determine the other user in the conversation
    const otherUser = conversation.member1_id === currentUser.id ? 
        conversation.member2 : conversation.member1;
    
    // Calculate unread count
    const unreadCount = conversation.member1_id === currentUser.id ? 
        conversation.unread_count_member1 : conversation.unread_count_member2;
    
    // Format the last message time
    const lastMessageTime = conversation.last_message_time ? 
        formatMessageTime(new Date(conversation.last_message_time)) : '';
    
    // Create conversation element
    const conversationEl = document.createElement('div');
    conversationEl.className = 'conversation-item p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer';
    conversationEl.dataset.id = conversation.id;
    conversationEl.dataset.userId = otherUser.id;
    conversationEl.dataset.username = otherUser.username;
    
    // Add HTML content
    conversationEl.innerHTML = `
        <div class="flex items-center">
            <div class="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                <i class="fas fa-user"></i>
            </div>
            <div class="ml-3 flex-1 overflow-hidden">
                <div class="flex justify-between items-baseline">
                    <h3 class="text-base font-medium text-gray-800 truncate">${otherUser.first_name} ${otherUser.last_name}</h3>
                    <span class="text-xs text-gray-500">${lastMessageTime}</span>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-sm text-gray-600 truncate max-w-[200px]">
                        ${conversation.last_message_text || 'Start a conversation...'}
                    </p>
                    ${unreadCount > 0 ? 
                        `<span class="bg-blue-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">${unreadCount}</span>` : 
                        ''}
                </div>
            </div>
        </div>
    `;
    
    // Add click event to load messages
    conversationEl.addEventListener('click', function() {
        // Update active class
        document.querySelectorAll('.conversation-item').forEach(el => {
            el.classList.remove('active');
        });
        conversationEl.classList.add('active');
        
        // Show active chat view
        noChatSelected.classList.add('hidden');
        activeChatView.classList.remove('hidden');
        
        // Set current conversation and recipient
        currentConversation = conversation;
        currentRecipient = otherUser;
        
        // Update chat header
        updateChatHeader(otherUser);
        
        // Load messages for this conversation
        loadMessages(conversation.id);
        
        // Mark conversation as read
        if (unreadCount > 0) {
            markConversationAsRead(conversation.id);
        }
    });
    
    // Add to conversations list
    conversationsList.appendChild(conversationEl);
}

// Update an existing conversation in the UI
function updateConversationInUI(conversation) {
    // Find the conversation element
    const conversationEl = document.querySelector(`.conversation-item[data-id="${conversation.id}"]`);
    if (!conversationEl) return;
    
    // Determine the other user in the conversation
    const otherUser = conversation.member1_id === currentUser.id ? 
        conversation.member2 : conversation.member1;
    
    // Calculate unread count
    const unreadCount = conversation.member1_id === currentUser.id ? 
        conversation.unread_count_member1 : conversation.unread_count_member2;
    
    // Format the last message time
    const lastMessageTime = conversation.last_message_time ? 
        formatMessageTime(new Date(conversation.last_message_time)) : '';
    
    // Update last message and time
    const lastMessageEl = conversationEl.querySelector('p');
    const timeEl = conversationEl.querySelector('.text-xs.text-gray-500');
    
    if (lastMessageEl) {
        lastMessageEl.textContent = conversation.last_message_text || 'Start a conversation...';
    }
    
    if (timeEl) {
        timeEl.textContent = lastMessageTime;
    }
    
    // Update unread count
    const unreadCountContainer = conversationEl.querySelector('.flex.justify-between.items-center');
    if (unreadCountContainer) {
        const unreadBadge = unreadCountContainer.querySelector('.bg-blue-500');
        
        if (unreadCount > 0) {
            if (unreadBadge) {
                unreadBadge.textContent = unreadCount;
            } else {
                const badgeEl = document.createElement('span');
                badgeEl.className = 'bg-blue-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center';
                badgeEl.textContent = unreadCount;
                unreadCountContainer.appendChild(badgeEl);
            }
        } else if (unreadBadge) {
            unreadBadge.remove();
        }
    }
    
    // Move conversation to top of list if it's not the current one
    if (currentConversation?.id !== conversation.id) {
        conversationsList.insertBefore(conversationEl, conversationsList.firstChild);
    }
}

// Load messages for a conversation - only once when conversation is selected
async function loadMessages(conversationId) {
    try {
        // Clear current messages
        messages = [];
        messagesList.innerHTML = '';
        
        // Show loading spinner
        messagesSpinner.classList.remove('hidden');
        
        // Query for messages in this conversation
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (error) {
            throw error;
        }
        
        // Hide loading spinner
        messagesSpinner.classList.add('hidden');
        
        // Process messages
        messages = data || [];
        
        // Render messages
        messagesList.innerHTML = '';
        messages.forEach(message => {
            addMessageToUI(message);
        });
        
        // Scroll to bottom
        scrollToBottom();
        
        // Set oldest message timestamp for pagination
        if (messages.length > 0) {
            oldestMessageTimestamp = new Date(messages[0].created_at).toISOString();
        }
        
        // Subscribe to real-time updates for new messages
        // This is the key to true real-time messaging - no refreshing needed
        subscribeToMessages(conversationId);
        
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesSpinner.classList.add('hidden');
        messagesList.innerHTML = `
            <div class="flex justify-center items-center p-4 text-red-500">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span>Error loading messages</span>
            </div>
        `;
    }
}

// Load more messages (for infinite scroll)
async function loadMoreMessages() {
    if (!currentConversation || !oldestMessageTimestamp) return;
    
    try {
        isLoadingMore = true;
        
        // Add loading indicator
        const loadingEl = document.createElement('div');
        loadingEl.className = 'flex justify-center items-center p-2';
        loadingEl.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>';
        messagesList.insertBefore(loadingEl, messagesList.firstChild);
        
        // Query for older messages
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', currentConversation.id)
            .lt('created_at', oldestMessageTimestamp)
            .order('created_at', { ascending: false })
            .limit(20);
        
        // Remove loading indicator
        loadingEl.remove();
        
        if (error) {
            throw error;
        }
        
        // Check if we have more messages
        hasMoreMessages = data.length === 20;
        
        // If we have messages, add them to the UI
        if (data.length > 0) {
            // Update oldest message timestamp
            oldestMessageTimestamp = new Date(data[data.length - 1].created_at).toISOString();
            
            // Save current scroll height
            const messagesContainer = document.getElementById('messagesContainer');
            const oldScrollHeight = messagesContainer.scrollHeight;
            
            // Add messages to the beginning of the list
            const fragment = document.createDocumentFragment();
            data.reverse().forEach(message => {
                const messageEl = createMessageElement(message);
                fragment.appendChild(messageEl);
            });
            
            // Insert at the beginning of the list
            if (messagesList.firstChild) {
                messagesList.insertBefore(fragment, messagesList.firstChild);
            } else {
                messagesList.appendChild(fragment);
            }
            
            // Maintain scroll position
            const newScrollHeight = messagesContainer.scrollHeight;
            messagesContainer.scrollTop = newScrollHeight - oldScrollHeight;
            
            // Add messages to our array
            messages = [...data.reverse(), ...messages];
        }
        
    } catch (error) {
        console.error('Error loading more messages:', error);
        
        // Show error message
        const errorEl = document.createElement('div');
        errorEl.className = 'text-center text-red-500 p-2 text-sm';
        errorEl.textContent = 'Failed to load older messages';
        messagesList.insertBefore(errorEl, messagesList.firstChild);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.remove();
            }
        }, 3000);
        
    } finally {
        isLoadingMore = false;
    }
}

// Add a message to the UI
function addMessageToUI(message) {
    const messageEl = createMessageElement(message);
    messagesList.appendChild(messageEl);
    
    // Scroll to bottom if the message is recent
    const now = new Date();
    const messageTime = new Date(message.created_at);
    const timeDiff = now - messageTime;
    
    // If message is less than 1 minute old or it's from the current user, scroll to bottom
    if (timeDiff < 60000 || message.sender_id === currentUser.id) {
        scrollToBottom();
    }
}

// Create a message element
function createMessageElement(message) {
    const isSentByMe = message.sender_id === currentUser.id;
    const messageTime = formatMessageTime(new Date(message.created_at));
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isSentByMe ? 'sent' : 'received'} mb-4`;
    messageEl.dataset.id = message.id;
    
    messageEl.innerHTML = `
        <div class="flex ${isSentByMe ? 'justify-end' : 'justify-start'}">
            <div class="message-bubble ${isSentByMe ? 'sent' : 'received'} py-2 px-4">
                ${formatMessageText(message.message_text)}
            </div>
        </div>
        <div class="flex ${isSentByMe ? 'justify-end' : 'justify-start'} mt-1">
            <span class="text-xs text-gray-500">${messageTime}</span>
            ${isSentByMe ? `
                <span class="text-xs text-gray-500 ml-2">
                    <i class="fas fa-check${message.is_read ? '-double' : ''} ${message.is_read ? 'text-blue-500' : ''}"></i>
                </span>
            ` : ''}
        </div>
    `;
    
    return messageEl;
}

// Send a new message
async function sendMessage() {
    if (!currentConversation || !currentRecipient) return;
    
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    try {
        // Clear input immediately for better UX
        messageInput.value = '';
        
        // Generate a temporary ID for optimistic UI update
        const tempId = 'temp-' + Date.now();
        
        // Create temporary message object for immediate display
        const tempMessage = {
            id: tempId,
            conversation_id: currentConversation.id,
            sender_id: currentUser.id,
            recipient_id: currentRecipient.id,
            message_text: messageText,
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        // Add to local messages array
        messages.push(tempMessage);
        
        // Add to UI immediately (optimistic update)
        addMessageToUI(tempMessage);
        scrollToBottom();
        
        // Insert message into database
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([{
                conversation_id: currentConversation.id,
                sender_id: currentUser.id,
                recipient_id: currentRecipient.id,
                message_text: messageText,
                is_read: false
            }]);
        
        if (error) throw error;
        
        // Get the newly created message with its ID
        if (data && data.length > 0) {
            const newMessage = data[0];
            console.log('Received confirmed message from server:', newMessage.id);
            
            // Find the temporary message in our array
            const tempIndex = messages.findIndex(m => m.id === tempId);
            
            if (tempIndex !== -1) {
                // Replace the temporary message with the confirmed one
                messages[tempIndex] = newMessage;
                
                // Update the UI element with the correct ID
                const tempEl = document.querySelector(`.message[data-id="${tempId}"]`);
                if (tempEl) {
                    tempEl.dataset.id = newMessage.id;
                }
            } else {
                // If we somehow don't have the temp message, add the new one
                messages.push(newMessage);
                addMessageToUI(newMessage);
            }
            
            // Also broadcast the message for immediate real-time delivery to other clients
            try {
                // Send via conversation-specific channel
                await messagesSubscription.send({
                    type: 'broadcast',
                    event: 'message',
                    payload: { message: newMessage }
                });
                
                // Also send via global channel to ensure delivery even if recipient
                // is not currently viewing this conversation
                await supabaseClient
                    .channel('global')
                    .send({
                        type: 'broadcast',
                        event: 'new_message',
                        payload: {
                            conversation_id: currentConversation.id,
                            message: newMessage
                        }
                    });
                
                console.log('Broadcast messages sent successfully to both channels');
            } catch (broadcastError) {
                console.error('Error broadcasting message:', broadcastError);
                // This is non-critical, as the database change will trigger the update anyway
            }
        }
        
        // Update the current conversation
        currentConversation.last_message_text = messageText;
        currentConversation.last_message_time = new Date().toISOString();
        
        // The message will also be received through the real-time subscription as backup
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Show error notification
        const errorEl = document.createElement('div');
        errorEl.className = 'bg-red-100 text-red-800 p-2 rounded-md text-sm text-center mb-2';
        errorEl.textContent = 'Failed to send message. Please try again.';
        
        // Add before the input area
        const inputContainer = messageInput.parentElement;
        inputContainer.parentElement.insertBefore(errorEl, inputContainer);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.remove();
            }
        }, 3000);
    }
}

// Mark a message as read
async function markMessageAsRead(messageId) {
    try {
        const { error } = await supabaseClient
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);
        
        if (error) {
            throw error;
        }
        
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Mark all messages in a conversation as read
async function markConversationAsRead(conversationId) {
    try {
        // Get all unread messages in this conversation where the current user is the recipient
        const { data, error } = await supabaseClient
            .from('messages')
            .select('id')
            .eq('conversation_id', conversationId)
            .eq('recipient_id', currentUser.id)
            .eq('is_read', false);
        
        if (error) {
            throw error;
        }
        
        // If there are unread messages, mark them as read
        if (data && data.length > 0) {
            const messageIds = data.map(m => m.id);
            
            const { error: updateError } = await supabaseClient
                .from('messages')
                .update({ is_read: true })
                .in('id', messageIds);
            
            if (updateError) {
                throw updateError;
            }
        }
        
    } catch (error) {
        console.error('Error marking conversation as read:', error);
    }
}

// Search for users to start a new conversation
async function searchUsers(query) {
    try {
        // Show loading spinner
        searchSpinner.classList.remove('hidden');
        noResultsFound.classList.add('hidden');
        searchResultsList.innerHTML = '';
        
        // Search for users by username, first name, or last name
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('id, first_name, last_name, username')
            .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
            .neq('id', currentUser.id)
            .limit(10);
        
        // Hide loading spinner
        searchSpinner.classList.add('hidden');
        
        if (error) {
            throw error;
        }
        
        // Show results
        if (data && data.length > 0) {
            // Clear previous results
            searchResultsList.innerHTML = '';
            
            // Add users to the list
            data.forEach(user => {
                addUserToSearchResults(user);
            });
        } else {
            // Show no results message
            noResultsFound.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error searching users:', error);
        searchSpinner.classList.add('hidden');
        
        // Show error message
        searchResultsList.innerHTML = `
            <div class="text-center text-red-500 py-3">
                An error occurred while searching. Please try again.
            </div>
        `;
    }
}

// Add a user to the search results
function addUserToSearchResults(user) {
    const userEl = document.createElement('div');
    userEl.className = 'user-result p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer';
    userEl.dataset.id = user.id;
    userEl.dataset.username = user.username;
    
    userEl.innerHTML = `
        <div class="flex items-center">
            <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                <i class="fas fa-user"></i>
            </div>
            <div class="ml-3">
                <div class="font-medium text-gray-800">${user.first_name} ${user.last_name}</div>
                <div class="text-sm text-gray-500">@${user.username}</div>
            </div>
        </div>
    `;
    
    // Add click event to start a conversation
    userEl.addEventListener('click', async () => {
        await startNewConversation(user);
    });
    
    // Add to search results
    searchResultsList.appendChild(userEl);
}

// Start a new conversation with a user
async function startNewConversation(user) {
    try {
        // Close the modal
        hideNewConversationModal();
        
        // Get or create conversation
        const { data, error } = await supabaseClient.rpc(
            'get_or_create_conversation', 
            { 
                user1_id: currentUser.id, 
                user2_id: user.id 
            }
        );
        
        if (error) {
            throw error;
        }
        
        const conversationId = data;
        
        // Check if conversation already exists in our list
        const existingConversation = conversations.find(c => c.id === conversationId);
        
        if (existingConversation) {
            // Conversation exists, just open it
            const conversationEl = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
            if (conversationEl) {
                conversationEl.click();
            } else {
                // Reload conversations and then open this one
                await loadConversations();
                const reloadedConversationEl = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
                if (reloadedConversationEl) {
                    reloadedConversationEl.click();
                }
            }
        } else {
            // Fetch the new conversation
            const { data: conversationData, error: conversationError } = await supabaseClient
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();
                
            if (!conversationError && conversationData) {
                // Fetch the profiles for both members
                const { data: profiles, error: profilesError } = await supabaseClient
                    .from('profiles')
                    .select('id, first_name, last_name, username')
                    .in('id', [conversationData.member1_id, conversationData.member2_id]);
                    
                if (!profilesError && profiles) {
                    // Create a map of user ID to profile
                    const profileMap = {};
                    profiles.forEach(profile => {
                        profileMap[profile.id] = profile;
                    });
                    
                    // Add member profile data to the conversation
                    conversationData.member1 = profileMap[conversationData.member1_id] || { id: conversationData.member1_id, username: 'Unknown User' };
                    conversationData.member2 = profileMap[conversationData.member2_id] || { id: conversationData.member2_id, username: 'Unknown User' };
                }
            }
            
            if (conversationError) {
                throw conversationError;
            }
            
            // Add to conversations list
            conversations.unshift(conversationData);
            
            // Clear list and re-add all conversations
            conversationsList.innerHTML = '';
            conversations.forEach(conversation => {
                addConversationToUI(conversation);
            });
            
            // Open the new conversation
            const conversationEl = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
            if (conversationEl) {
                conversationEl.click();
            }
        }
        
    } catch (error) {
        console.error('Error starting new conversation:', error);
        
        // Show error notification
        alert('Failed to start conversation. Please try again.');
    }
}

// Show new conversation modal
function showNewConversationModal() {
    newConversationModal.classList.remove('hidden');
    userSearch.value = '';
    searchResultsList.innerHTML = '';
    noResultsFound.classList.add('hidden');
    userSearch.focus();
}

// Hide new conversation modal
function hideNewConversationModal() {
    newConversationModal.classList.add('hidden');
}

// Update chat header with recipient info
function updateChatHeader(user) {
    chatUsername.textContent = `${user.first_name} ${user.last_name}`;
    // This would be replaced with actual status if implemented
    chatUserStatus.innerHTML = `
        <span class="inline-block h-2 w-2 rounded-full bg-gray-400 mr-1"></span>
        Offline
    `;
}

// Format message time
function formatMessageTime(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the date is today
    if (date >= today) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if the date is yesterday
    if (date >= yesterday) {
        return 'Yesterday';
    }
    
    // Check if the date is within the last week
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 6);
    
    if (date >= lastWeek) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }
    
    // Otherwise, return the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Format message text
function formatMessageText(text) {
    // Convert URLs to links
    text = text.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
    );
    
    // Replace newlines with <br>
    return text.replace(/\n/g, '<br>');
}

// Filter conversations based on search query
function filterConversations(query) {
    const conversationElements = document.querySelectorAll('.conversation-item');
    
    if (!query) {
        // Show all conversations
        conversationElements.forEach(el => {
            el.classList.remove('hidden');
        });
        return;
    }
    
    // Filter conversations
    let hasVisibleConversation = false;
    
    conversationElements.forEach(el => {
        const username = el.dataset.username.toLowerCase();
        const conversationId = el.dataset.id;
        
        // Check if conversation matches query
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        
        const otherUser = conversation.member1_id === currentUser.id ? 
            conversation.member2 : conversation.member1;
        
        const fullName = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
        const lastMessage = (conversation.last_message_text || '').toLowerCase();
        
        if (username.includes(query) || fullName.includes(query) || lastMessage.includes(query)) {
            el.classList.remove('hidden');
            hasVisibleConversation = true;
        } else {
            el.classList.add('hidden');
        }
    });
    
    // Show/hide no conversations message
    if (hasVisibleConversation) {
        noConversations.classList.add('hidden');
    } else {
        noConversations.innerHTML = `
            <i class="fas fa-search text-3xl mb-2"></i>
            <p>No conversations match your search</p>
        `;
        noConversations.classList.remove('hidden');
    }
}

// Send typing indicator
function sendTypingIndicator() {
    // This would be implemented if we had a typing indicators feature
    // For now, this is just a placeholder
}

// Setup a global message listener to catch all messages regardless of current conversation
function setupGlobalMessageListener() {
    console.log('Setting up global message listener');
    
    // Create a global channel to listen for all message events
    const globalChannel = supabaseClient
        .channel('global')
        .on('broadcast', { event: 'new_message' }, (payload) => {
            console.log('Global message received:', payload);
            
            // If this message is for the current conversation, handle it
            if (currentConversation && payload.payload.conversation_id === currentConversation.id) {
                if (!messages.some(m => m.id === payload.payload.message.id)) {
                    handleNewMessage({ new: payload.payload.message });
                }
            } else {
                // If it's for another conversation, update the conversation list to show new message indicator
                const conversationIndex = conversations.findIndex(c => c.id === payload.payload.conversation_id);
                if (conversationIndex !== -1) {
                    conversations[conversationIndex].last_message_text = payload.payload.message.message_text;
                    conversations[conversationIndex].last_message_time = payload.payload.message.created_at;
                    conversations[conversationIndex].has_unread = true;
                    
                    // Update the conversation list UI
                    updateConversationListUI();
                }
            }
        })
        .subscribe((status) => {
            console.log('Global channel subscription status:', status);
        });
}

// Scroll messages container to bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

});
