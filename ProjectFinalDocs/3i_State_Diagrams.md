# State Diagrams

## Overview
State diagrams represent the different states that objects or processes in ConnectSphere can transition through during their lifecycle. These diagrams help visualize how entities change state in response to events and what actions are triggered during these transitions.

## State Diagram 1: User Account Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                                  ●──────────────►                                │
│                                  │               │                               │
│                                  ▼               │                               │
│                           ┌────────────┐         │                               │
│                           │            │         │                               │
│                           │ Unverified │         │                               │
│                           │            │         │                               │
│                           └──────┬─────┘         │                               │
│                                  │               │                               │
│                                  │ email verified│                               │
│                                  ▼               │                               │
│                           ┌────────────┐         │                               │
│                           │            │         │                               │
│                           │  Verified  ├─────────┘                               │
│                           │            │ password reset                          │
│                           └──────┬─────┘                                         │
│                                  │                                               │
│                                  │ profile completed                             │
│                                  ▼                                               │
│                           ┌────────────┐         ┌────────────┐                  │
│                           │            │upgrade  │            │                  │
│                           │   Basic    ├────────►│  Premium   │                  │
│                           │            │         │            │                  │
│                           └──────┬─────┘         └──────┬─────┘                  │
│                                  │                      │                        │
│                                  │                      │                        │
│                                  ▼                      ▼                        │
│                           ┌────────────┐         ┌────────────┐                  │
│                           │            │         │            │                  │
│                           │  Inactive  │◄────────┤  Inactive  │                  │
│                           │            │         │            │                  │
│                           └──────┬─────┘         └──────┬─────┘                  │
│                                  │                      │                        │
│                                  │ login                │ login                  │
│                                  ▼                      ▼                        │
│                           ┌────────────┐         ┌────────────┐                  │
│                           │            │upgrade  │            │                  │
│                           │   Basic    ├────────►│  Premium   │                  │
│                           │            │         │            │                  │
│                           └────────────┘         └────────────┘                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### State Descriptions:

1. **Unverified**
   - **Entry Action**: User signs up with email and password
   - **Exit Action**: User clicks email verification link
   - **Activities**: None (waiting for verification)
   - **Transitions**: 
     - To Verified: Email verification link clicked
     - Self-transition: Password reset request

2. **Verified**
   - **Entry Action**: Verify email and redirect to profile creation
   - **Exit Action**: Complete profile information
   - **Activities**: Profile data entry
   - **Transitions**:
     - To Basic: Profile creation completed
     - Self-transition: Password reset

3. **Basic**
   - **Entry Action**: Load dashboard with basic features
   - **Exit Action**: None
   - **Activities**: Use basic features (messaging, profile viewing, limited AI advisor)
   - **Transitions**:
     - To Premium: User upgrades subscription
     - To Inactive: User doesn't login for extended period

4. **Premium**
   - **Entry Action**: Activate premium features
   - **Exit Action**: None
   - **Activities**: Use all features including unlimited AI advisor, priority matching
   - **Transitions**:
     - To Inactive: User doesn't login for extended period
     - To Basic: Subscription expires (not shown in diagram)

5. **Inactive (Basic)**
   - **Entry Action**: Change status to inactive
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**:
     - To Basic: User logs in again

6. **Inactive (Premium)**
   - **Entry Action**: Change status to inactive but maintain subscription
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**:
     - To Premium: User logs in again

### Implementation in ConnectSphere:
- **Authentication States**: Managed in `js/auth.js` with Supabase Auth
- **Subscription States**: Managed in `js/subscription-manager.js`
- **Profile States**: Managed in `js/database-utils.js`

Key code from `js/auth.js`:
```javascript
// Check user state
const checkUserState = async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (!session) {
    return 'unauthenticated';
  }
  
  const user = session.user;
  
  // Check if email is verified (all Supabase users are auto-verified if using magic link or OAuth)
  // For email/password users, we check a custom field
  const isVerified = user.email_confirmed_at || user.app_metadata?.email_verified;
  
  if (!isVerified) {
    return 'unverified';
  }
  
  // Check if profile exists
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error || !profile) {
    return 'verified';
  }
  
  // Check if user is premium
  const { data: subscription } = await supabaseClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
  
  if (subscription) {
    // Check last login time to determine if inactive
    const lastLogin = new Date(user.last_sign_in_at);
    const now = new Date();
    const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
    
    return daysSinceLogin > 30 ? 'inactive_premium' : 'premium';
  } else {
    // Check last login time to determine if inactive
    const lastLogin = new Date(user.last_sign_in_at);
    const now = new Date();
    const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
    
    return daysSinceLogin > 30 ? 'inactive_basic' : 'basic';
  }
};
```

## State Diagram 2: Connection Request Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                                     ●                                            │
│                                     │                                            │
│                                     │ user sends request                         │
│                                     ▼                                            │
│                           ┌────────────────┐                                     │
│                           │                │                                     │
│                           │    Pending     │                                     │
│                           │                │                                     │
│                           └───────┬────────┘                                     │
│                                   │                                              │
│                 ┌─────────────────┴────────────────────┐                         │
│                 │                                      │                         │
│                 │ recipient accepts                    │ recipient declines      │
│                 ▼                                      ▼                         │
│        ┌─────────────────┐                    ┌─────────────────┐                │
│        │                 │                    │                 │                │
│        │    Accepted     │                    │    Declined     │                │
│        │                 │                    │                 │                │
│        └────────┬────────┘                    └────────┬────────┘                │
│                 │                                      │                         │
│                 │ conversation                         │ user sends              │
│                 │ created                              │ new request (after delay)│
│                 ▼                                      ▼                         │
│        ┌─────────────────┐                             ●                         │
│        │                 │                                                       │
│        │    Connected    │                                                       │
│        │                 │                                                       │
│        └────────┬────────┘                                                       │
│                 │                                                                │
│                 │ either user blocks                                             │
│                 │ or disconnects                                                 │
│                 ▼                                                                │
│        ┌─────────────────┐                                                       │
│        │                 │                                                       │
│        │  Disconnected   │                                                       │
│        │                 │                                                       │
│        └────────┬────────┘                                                       │
│                 │                                                                │
│                 │ user sends                                                     │
│                 │ reconnect request                                              │
│                 ▼                                                                │
│                 ●                                                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### State Descriptions:

1. **Pending**
   - **Entry Action**: User sends connection request
   - **Exit Action**: Recipient responds to request
   - **Activities**: None (waiting for response)
   - **Transitions**:
     - To Accepted: Recipient accepts request
     - To Declined: Recipient declines request

2. **Accepted**
   - **Entry Action**: Update connection status
   - **Exit Action**: Create conversation
   - **Activities**: None
   - **Transitions**:
     - To Connected: System creates conversation between users

3. **Declined**
   - **Entry Action**: Update connection status
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**:
     - To Initial State: User sends new request (after delay)

4. **Connected**
   - **Entry Action**: Enable messaging
   - **Exit Action**: None
   - **Activities**: Messaging, viewing profile, etc.
   - **Transitions**:
     - To Disconnected: Either user blocks or disconnects

5. **Disconnected**
   - **Entry Action**: Disable messaging
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**:
     - To Initial State: User sends reconnect request

### Implementation in ConnectSphere:
- **Connection Management**: Implemented in `js/connections.js`
- **Messaging System**: Implemented in `/tests/msg-test/js/messaging.js`

## State Diagram 3: Message Delivery Process

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                                     ●                                            │
│                                     │                                            │
│                                     │ user composes message                      │
│                                     ▼                                            │
│                           ┌────────────────┐                                     │
│                           │                │                                     │
│                           │    Composed    │                                     │
│                           │                │                                     │
│                           └───────┬────────┘                                     │
│                                   │                                              │
│                                   │ user sends message                           │
│                                   ▼                                              │
│                           ┌────────────────┐                                     │
│                           │                │                                     │
│                           │    Sending     │                                     │
│                           │                │                                     │
│                           └───────┬────────┘                                     │
│                                   │                                              │
│                 ┌─────────────────┴────────────────────┐                         │
│                 │                                      │                         │
│                 │ successful                           │ failed                  │
│                 ▼                                      ▼                         │
│        ┌─────────────────┐                    ┌─────────────────┐                │
│        │                 │                    │                 │                │
│        │      Sent       │                    │     Failed      │                │
│        │                 │                    │                 │                │
│        └────────┬────────┘                    └────────┬────────┘                │
│                 │                                      │                         │
│                 │ delivered to recipient               │ user retries            │
│                 ▼                                      ▼                         │
│        ┌─────────────────┐                             ●                         │
│        │                 │                                                       │
│        │    Delivered    │                                                       │
│        │                 │                                                       │
│        └────────┬────────┘                                                       │
│                 │                                                                │
│                 │ recipient reads message                                        │
│                 ▼                                                                │
│        ┌─────────────────┐                                                       │
│        │                 │                                                       │
│        │      Read       │                                                       │
│        │                 │                                                       │
│        └────────────────┘                                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### State Descriptions:

1. **Composed**
   - **Entry Action**: User types message
   - **Exit Action**: None
   - **Activities**: Text editing, emoji selection
   - **Transitions**:
     - To Sending: User clicks send button

2. **Sending**
   - **Entry Action**: Submit message to Supabase
   - **Exit Action**: None
   - **Activities**: Loading indicator displayed
   - **Transitions**:
     - To Sent: Message successfully saved in database
     - To Failed: Network error or other failure

3. **Failed**
   - **Entry Action**: Display error message
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**:
     - To Initial State: User retries sending

4. **Sent**
   - **Entry Action**: Update message status
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**:
     - To Delivered: Recipient's client receives message

5. **Delivered**
   - **Entry Action**: Update message status
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**:
     - To Read: Recipient opens conversation and views message

6. **Read**
   - **Entry Action**: Update message status
   - **Exit Action**: None
   - **Activities**: None
   - **Transitions**: None (final state)

### Implementation in ConnectSphere:
- **Message States**: Implemented in `/tests/msg-test/js/messaging.js`
- **Real-time Updates**: Implemented using Supabase subscriptions

Key code from `/tests/msg-test/js/messaging.js`:
```javascript
// Send message function
const sendMessage = async (conversationId, content) => {
  try {
    // Update UI to show sending state
    const tempId = 'temp-' + Date.now();
    displayMessage({
      id: tempId,
      sender_id: currentUser.id,
      content,
      status: 'sending',
      created_at: new Date().toISOString()
    });
    
    // Send to database
    const { data, error } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content,
        status: 'sent'
      })
      .select()
      .single();
    
    if (error) {
      // Update UI to show failed state
      updateMessageStatus(tempId, 'failed');
      console.error('Error sending message:', error);
      return false;
    }
    
    // Replace temp message with actual message
    replaceMessage(tempId, {
      ...data,
      status: 'sent'
    });
    
    return true;
  } catch (err) {
    console.error('Error in sendMessage:', err);
    return false;
  }
};

// Subscribe to message status updates
const subscribeToMessageStatusUpdates = () => {
  return supabaseClient
    .channel('message-status-changes')
    .on('postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`
      }, 
      (payload) => {
        // Update UI when message status changes
        updateMessageStatus(payload.new.id, payload.new.status);
      }
    )
    .subscribe();
};
```

## How State Diagrams Address Design Constraints

1. **Authentication Constraint**: The User Account Lifecycle diagram shows the authentication states and transitions.

2. **Authorization Constraint**: The distinction between Basic and Premium states enforces the authorization constraint.

3. **UI Modification Constraint**: State diagrams focus on behavior rather than UI, supporting separation of concerns.

4. **Centralized Data Constraint**: All state transitions reflect changes in the central Supabase database.

5. **Modifiability Constraint**: The clear separation of states makes it easy to modify individual states or add new ones without affecting the entire system.
