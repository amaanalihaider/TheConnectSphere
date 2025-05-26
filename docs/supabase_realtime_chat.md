# Real-Time Chat Implementation with Supabase

This document outlines the steps to implement a one-on-one real-time chat feature in ConnectSphere using Supabase's Realtime functionality.

## Overview

Supabase provides real-time capabilities through its Realtime feature, which leverages PostgreSQL's logical replication. This allows us to build a chat system where messages appear instantly without requiring page refreshes, creating a smooth user experience similar to modern messaging platforms.

## Implementation Steps

### 1. Database Setup

First, we need to create the necessary database tables to store chat messages and conversation data:

```sql
-- Create a messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional: Add a conversation_id if you want to group messages
  conversation_id UUID REFERENCES conversations(id)
);

-- Optional: Create a conversations table to track distinct conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create a participants table to track who's in each conversation
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES auth.users(id),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable row-level security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can see messages they sent or received" 
ON messages FOR SELECT 
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can insert messages they send" 
ON messages FOR INSERT 
WITH CHECK (sender_id = auth.uid());

-- Add policies for conversations and participants as needed
```

### 2. Set Up Realtime Subscriptions

Create a JavaScript function to subscribe to new messages:

```javascript
// Initialize Supabase client (you already have this in ConnectSphere)
// const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

// Subscribe to new messages where the current user is the receiver
function subscribeToMessages(currentUserId) {
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`
      },
      (payload) => {
        // Handle new message
        console.log('New message received!', payload);
        // Update UI with new message
        displayNewMessage(payload.new);
      }
    )
    .subscribe();
    
  return subscription;
}
```

### 3. Create Message Sending Function

```javascript
async function sendMessage(senderId, receiverId, content) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          sender_id: senderId, 
          receiver_id: receiverId, 
          content: content 
        }
      ]);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}
```

### 4. Create Chat UI Components

Develop the necessary UI components:

1. A message list container to display the chat history
2. A text input for composing messages
3. A send button
4. User indicators to show who sent each message (e.g., different colored message bubbles)
5. Timestamps for messages

### 5. Fetch Previous Messages

Create a function to load the chat history:

```javascript
async function fetchMessages(userId, otherUserId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}
```

### 6. Update Read Status

Implement a function to mark messages as read:

```javascript
async function markMessagesAsRead(messageIds) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .in('id', messageIds)
      .eq('receiver_id', currentUserId); // Only mark messages where you're the receiver
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return null;
  }
}
```

### 7. Handle User Presence (Optional)

Implement online status indicators:

```javascript
const channel = supabase.channel('online-users')

// Join the channel and set your status
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Current state: ', state)
  updateOnlineUsersList(state);
})

// Listen for changes to the state
channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
  console.log('A user has joined', newPresences)
  updateUserOnlineStatus(key, true);
})

channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
  console.log('A user has left', leftPresences)
  updateUserOnlineStatus(key, false);
})

// Track your own status
channel.track({ user_id: currentUserId, online_at: new Date().toISOString() })
```

### 8. Testing on Same Device with Different Browsers

To test the chat functionality during development:

1. Open the application in two different browsers (e.g., Chrome and Firefox)
2. Log in as different users in each browser
3. Navigate to the chat interface in both browsers
4. Send messages from one browser to the other
5. Verify that messages appear in real-time without refreshing

### 9. Additional Features for Future Implementation

- Typing indicators: Show when the other user is typing
- Message delivery confirmations
- Unread message counts
- Message search functionality
- Media attachments (images, files)
- Message deletion/editing
- Group chats

## Integration with ConnectSphere

When implementing this feature in ConnectSphere:

1. Create a new "Messages" or "Chat" page in the main navigation
2. Add a chat interface that lists conversations on the left and the active conversation on the right
3. Show notifications for new messages in the header
4. Allow users to initiate chats from profile pages

## Benefits for ConnectSphere

Adding real-time chat will:

1. Increase user engagement and time spent on the platform
2. Facilitate deeper connections between users
3. Provide a more seamless experience comparable to dedicated messaging apps
4. Create opportunities for premium features (e.g., enhanced chat capabilities for subscribers)

## Technical Considerations

- Ensure proper error handling for network interruptions
- Implement message queuing for offline support
- Consider rate limiting to prevent spam
- Implement proper security measures to prevent message interception
