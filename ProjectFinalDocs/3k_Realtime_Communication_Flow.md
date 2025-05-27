# Real-time Communication Flow Diagram

## Overview
This document illustrates the real-time communication architecture in ConnectSphere, specifically focusing on how the messaging system utilizes Supabase's real-time subscriptions to provide instant message delivery without requiring page refreshes.

## Real-time Messaging Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ConnectSphere System                                       │
│                                                                                                 │
│  ┌────────────────────┐                                          ┌────────────────────┐         │
│  │                    │                                          │                    │         │
│  │   Sender Client    │                                          │  Recipient Client  │         │
│  │                    │                                          │                    │         │
│  └──────────┬─────────┘                                          └─────────┬──────────┘         │
│             │                                                              │                    │
│             │                                                              │                    │
│             │                                                              │                    │
│             │                                                              │                    │
│             │  1. Initialize WebSocket Connection                          │                    │
│             │ ────────────────────────────────────────────────────────►   │                    │
│             │                                                              │                    │
│             │  2. Subscribe to channel(s)                                  │                    │
│             │ ────────────────────────────────────────────────────────►   │                    │
│             │                                                              │                    │
│             │  3. Send message                                             │                    │
│             │ ───────────┐                                                 │                    │
│             │            │                                                 │                    │
│             │            │                                                 │                    │
│             │            │                                                 │                    │
│             │            │      ┌────────────────────────────┐             │                    │
│             │            │      │                            │             │                    │
│             │            └─────►│     Supabase Database      │             │                    │
│             │                   │                            │             │                    │
│             │                   └──────────────┬─────────────┘             │                    │
│             │                                  │                           │                    │
│             │                                  │                           │                    │
│             │                                  │                           │                    │
│             │                                  │                           │                    │
│             │  4. PostgreSQL Notification      │                           │                    │
│             │ ◄─────────────────────────────────                           │                    │
│             │                                  │                           │                    │
│             │                                  │                           │                    │
│             │                                  │  5. Broadcast changes     │                    │
│             │                                  └─────────────────────────► │                    │
│             │                                                              │                    │
│             │                                                              │                    │
│             │  6. Update UI with received message                          │                    │
│             │ ◄──────────────────────────────────────────────────────────  │                    │
│             │                                                              │                    │
│  ┌──────────┴─────────┐                                          ┌─────────┴──────────┐         │
│  │                    │                                          │                    │         │
│  │     Sender UI      │                                          │   Recipient UI     │         │
│  │    (Updated)       │                                          │   (Updated)        │         │
│  │                    │                                          │                    │         │
│  └────────────────────┘                                          └────────────────────┘         │
│                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Process Description

1. **Initialize WebSocket Connection**:
   - Both sender and recipient clients establish WebSocket connections with Supabase when they log in
   - This connection remains open for the duration of the session

2. **Subscribe to Channel(s)**:
   - Clients subscribe to specific channels based on their conversations
   - For example: `channel('conversation-${conversationId}')`
   - This creates a "listening" connection for specific database changes

3. **Send Message**:
   - Sender client inserts a new message into the `messages` table
   - The message contains: conversation_id, sender_id, content, timestamp

4. **PostgreSQL Notification**:
   - Supabase's PostgreSQL database triggers a notification upon insert
   - This notification is pushed to the Supabase real-time server

5. **Broadcast Changes**:
   - Supabase real-time server broadcasts the change to all subscribed clients
   - Clients only receive changes for the channels they're subscribed to
   - The recipient client receives the new message data

6. **Update UI**:
   - Both sender and recipient clients update their UI with the new message
   - Sender sees confirmation that message was sent
   - Recipient sees the new message appear instantly

## Implementation in ConnectSphere

### Client-Side Code (JavaScript)

```javascript
// Initialize Supabase client with real-time enabled
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Subscribe to conversation changes
const subscribeToConversation = (conversationId) => {
  return supabaseClient
    .channel(`conversation-${conversationId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, 
      (payload) => {
        // Update UI with new message
        displayMessage(payload.new);
      }
    )
    .subscribe();
};

// Send a message
const sendMessage = async (conversationId, content) => {
  const { data, error } = await supabaseClient
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error sending message:', error);
    return false;
  }
  
  return true;
};
```

### Database Triggers

Supabase automatically handles the real-time subscriptions without requiring custom triggers. The system leverages PostgreSQL's built-in notification system (LISTEN/NOTIFY) to deliver changes to subscribers.

## Advantages of This Approach

1. **Instant Updates**: Messages appear instantly without page refreshes
2. **Efficient Resource Usage**: WebSocket connections use fewer resources than polling
3. **Selective Subscriptions**: Clients only receive updates for their conversations
4. **Offline Detection**: Connection status can be monitored to detect when a user goes offline
5. **Scalability**: Supabase's real-time infrastructure scales to handle many concurrent connections

## Extension to Other Real-time Features

This same pattern is used for other real-time features in ConnectSphere:

1. **Connection Requests**: Instant notifications when someone sends a connection request
2. **Status Updates**: Real-time updates when a user's status changes
3. **Typing Indicators**: Shows when another user is typing in a conversation
4. **Read Receipts**: Updates when messages are read by the recipient

## Technical Considerations

1. **Connection Management**: Handling reconnection if WebSocket connections drop
2. **Message Ordering**: Ensuring messages are displayed in the correct order
3. **Offline Functionality**: Queuing messages when offline for later delivery
4. **Subscription Cleanup**: Properly unsubscribing when leaving conversations

## How This Architecture Addresses Design Constraints

1. **Real-time Constraint**: The WebSocket-based approach provides true real-time communication without polling.

2. **Scalability Constraint**: The architecture scales efficiently as Supabase handles the broadcasting infrastructure.

3. **Resource Constraint**: WebSockets are more efficient than HTTP polling for real-time updates.

4. **User Experience Constraint**: Users see messages instantly, creating a seamless messaging experience.

5. **Security Constraint**: All real-time communications are authenticated, and Row Level Security ensures users only access authorized data.
