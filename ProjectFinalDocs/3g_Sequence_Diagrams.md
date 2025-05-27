# Sequence Diagrams

## Overview
Sequence diagrams illustrate the interactions between objects in a time-ordered sequence, showing how operations are carried out within ConnectSphere. These diagrams are critical for understanding the dynamic behavior of the system and how components collaborate to implement key use cases.

## Sequence Diagram 1: User Authentication Flow

```
┌────────┐      ┌───────────┐     ┌────────────────┐     ┌───────────┐     ┌──────────────┐
│  User  │      │ Login UI  │     │ Auth Component │     │ Supabase  │     │ Profile Comp │
└───┬────┘      └─────┬─────┘     └───────┬────────┘     └─────┬─────┘     └──────┬───────┘
    │                 │                   │                    │                  │
    │ Enter Credentials                   │                    │                  │
    │─────────────────>                   │                    │                  │
    │                 │                   │                    │                  │
    │                 │ Validate Input    │                    │                  │
    │                 │─────────────────>│                    │                  │
    │                 │                   │                    │                  │
    │                 │                   │ signInWithPassword()                  │
    │                 │                   │───────────────────>                   │
    │                 │                   │                    │                  │
    │                 │                   │                    │ Authenticate     │
    │                 │                   │                    │───────────────>│
    │                 │                   │                    │                  │
    │                 │                   │                    │ Return JWT Token │
    │                 │                   │                    │<───────────────│
    │                 │                   │                    │                  │
    │                 │                   │ Return Auth Result │                  │
    │                 │                   │<───────────────────                   │
    │                 │                   │                    │                  │
    │                 │                   │ getProfile()       │                  │
    │                 │                   │───────────────────────────────────────>
    │                 │                   │                    │                  │
    │                 │                   │                    │ getUserProfile() │
    │                 │                   │                    │───────────────>│
    │                 │                   │                    │                  │
    │                 │                   │                    │ Return Profile   │
    │                 │                   │                    │<───────────────│
    │                 │                   │                    │                  │
    │                 │                   │ Return Profile Data│                  │
    │                 │                   │<───────────────────────────────────────
    │                 │                   │                    │                  │
    │                 │ Redirect to Home  │                    │                  │
    │                 │<─────────────────│                    │                  │
    │                 │                   │                    │                  │
    │ Show Dashboard  │                   │                    │                  │
    │<────────────────                    │                    │                  │
    │                 │                   │                    │                  │
```

### Explanation:
1. User enters credentials (email/password) in the Login UI
2. Login UI validates the input format (client-side validation)
3. Auth Component calls Supabase's `signInWithPassword()` method
4. Supabase authenticates the credentials against the auth.users table
5. Supabase returns a JWT token upon successful authentication
6. Auth Component requests the user's profile data
7. Profile Component retrieves the profile data from Supabase
8. Login UI redirects to the home page upon successful authentication
9. Dashboard is displayed to the user

### Implementation in ConnectSphere:
- **Login UI**: Implemented in `login.html`
- **Auth Component**: Implemented in `js/auth.js` and `js/supabaseClient.js`
- **Profile Component**: Implemented in `js/database-utils.js`

Key code from `js/auth.js`:
```javascript
const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Fetch user profile after successful login
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) throw profileError;
    
    return { success: true, user: data.user, profile };
  } catch (error) {
    console.error("Error signing in:", error);
    return { success: false, error };
  }
};
```

## Sequence Diagram 2: Real-time Messaging Flow

```
┌────────┐      ┌───────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────┐
│ User A │      │ Chat UI A │     │ Messaging     │     │ Supabase      │     │ Chat UI B │
└───┬────┘      └─────┬─────┘     │ Component     │     │ Real-time     │     └─────┬──────┘
    │                 │           └─────┬─────────┘     └─────┬─────────┘           │
    │                 │                 │                     │                     │
    │                 │<----- setupRealtimeSubscription() ---->                     │
    │                 │                 │                     │                     │
    │                 │                 │       Subscribe to WebSocket Channel      │
    │                 │                 │                     │<------------------->│
    │                 │                 │                     │                     │
    │ Type Message    │                 │                     │                     │
    │─────────────────>                 │                     │                     │
    │                 │                 │                     │                     │
    │                 │ sendMessage()   │                     │                     │
    │                 │────────────────>│                     │                     │
    │                 │                 │                     │                     │
    │                 │                 │ Insert into         │                     │
    │                 │                 │ messages table      │                     │
    │                 │                 │───────────────────>│                     │
    │                 │                 │                     │                     │
    │                 │                 │ Confirm Insertion   │                     │
    │                 │                 │<───────────────────│                     │
    │                 │                 │                     │                     │
    │                 │ Update Local UI │                     │                     │
    │                 │<────────────────│                     │                     │
    │                 │                 │                     │                     │
    │ See Message Sent│                 │                     │                     │
    │<────────────────│                 │                     │                     │
    │                 │                 │                     │                     │
    │                 │                 │                     │ Broadcast INSERT    │
    │                 │                 │                     │ event via WebSocket │
    │                 │                 │                     │───────────────────>│
    │                 │                 │                     │                     │
    │                 │                 │                     │ handleNewMessage()  │
    │                 │                 │                     │                   ┌─┘
    │                 │                 │                     │                   │
    │                 │                 │                     │                   │
    │                 │                 │                     │                   V
    │                 │                 │                     │       displayMessage()
    │                 │                 │                     │                   ┌─┘
    │                 │                 │                     │                   │
    │                 │                 │                     │                   V
    │                 │                 │                     │       User B sees
    │                 │                 │                     │       new message
    │                 │                 │                   │ Show New Message│
    │                 │                 │                   │                 │───┐
    │                 │                 │                   │                 │   │
    │                 │                 │                   │                 │<──┘
    │                 │                 │                   │                 │
```

### Explanation:
1. User A types a message in Chat UI A
2. Chat UI A calls the Messaging Component to send the message
3. Messaging Component inserts the message into the Supabase database
4. Supabase confirms the message insertion
5. Chat UI A updates to show the sent message
6. Supabase sends a real-time event to Chat UI B
7. Chat UI B processes the incoming message
8. Chat UI B displays the new message to User B

### Implementation in ConnectSphere:
- **Chat UI**: Implemented in `/tests/msg-test/index.html`
- **Messaging Component**: Implemented in `/tests/msg-test/js/messaging.js`
- **Supabase Real-time**: Implemented through Supabase subscriptions

Key code from `/tests/msg-test/js/messaging.js`:
```javascript
// Sending a message
const sendMessage = async (conversationId, senderId, content) => {
  try {
    const { data, error } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        is_read: false
      });
      
    if (error) throw error;
    return { success: true, message: data };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
};

// Setting up real-time subscription
const setupMessageSubscription = (conversationId, callback) => {
  return supabaseClient
    .channel(`conversation-${conversationId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};
```

## Sequence Diagram 3: Subscription and Payment Process

```
┌────────┐      ┌────────────┐     ┌───────────────┐     ┌───────────┐     ┌──────────────┐
│  User  │      │ Subscription│     │ Payment       │     │ Payment   │     │ Supabase     │
│        │      │ Component   │     │ Component     │     │ Gateway   │     │ Database     │
└───┬────┘      └─────┬──────┘     └───────┬───────┘     └─────┬─────┘     └──────┬───────┘
    │                 │                    │                   │                  │
    │ Select Plan     │                    │                   │                  │
    │─────────────────>                    │                   │                  │
    │                 │                    │                   │                  │
    │                 │ Create Pending     │                   │                  │
    │                 │ Subscription       │                   │                  │
    │                 │────────────────────────────────────────────────────────>│
    │                 │                    │                   │                  │
    │                 │                    │                   │                  │
    │                 │ Redirect to Payment│                   │                  │
    │                 │──────────────────>│                   │                  │
    │                 │                    │                   │                  │
    │                 │                    │ Process Payment   │                  │
    │                 │                    │──────────────────>                   │
    │                 │                    │                   │                  │
    │                 │                    │                   │ Validate Payment │
    │                 │                    │                   │────┐             │
    │                 │                    │                   │    │             │
    │                 │                    │                   │<───┘             │
    │                 │                    │                   │                  │
    │                 │                    │ Payment Result    │                  │
    │                 │                    │<──────────────────                   │
    │                 │                    │                   │                  │
    │                 │                    │ Update Subscription                  │
    │                 │                    │ Status            │                  │
    │                 │                    │───────────────────────────────────>│
    │                 │                    │                   │                  │
    │                 │                    │                   │ Confirm Update   │
    │                 │                    │                   │<─────────────────
    │                 │                    │                   │                  │
    │                 │ Redirect to Success│                   │                  │
    │                 │<──────────────────│                   │                  │
    │                 │                    │                   │                  │
    │ Show Confirmation                    │                   │                  │
    │<────────────────                     │                   │                  │
    │                 │                    │                   │                  │
```

### Explanation:
1. User selects a subscription plan
2. Subscription Component creates a pending subscription record in the database
3. User is redirected to the Payment Component
4. Payment Component processes the payment through the Payment Gateway
5. Payment Gateway validates the payment information
6. Payment Component receives the payment result
7. Payment Component updates the subscription status in the database
8. User is redirected to a success page with confirmation

### Implementation in ConnectSphere:
- **Subscription Component**: Implemented in `subscription.html` and `js/subscription.js`
- **Payment Component**: Implemented in `payment.html` and `js/payment.js`
- **Database Operations**: Implemented through Supabase client

Key code from `js/subscription.js`:
```javascript
// Creating a pending subscription
const createSubscription = async (userId, planType) => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'pending',
        start_date: startDate,
        end_date: endDate,
        payment_status: 'pending'
      });
      
    if (error) throw error;
    return { success: true, subscription: data };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { success: false, error };
  }
};
```

## Sequence Diagram 4: AI Chat Advisor Interaction with Voice Input

```
┌────────┐      ┌────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────┐
│  User  │      │ Chat       │     │ Voice         │     │ Chatbot       │     │ Gemini    │
│        │      │ UI         │     │ Component     │     │ Component     │     │ API       │
└───┬────┘      └─────┬──────┘     └───────┬───────┘     └───────┬───────┘     └─────┬─────┘
    │                 │                    │                     │                   │     
    │ Click Mic Button│                    │                     │                   │     
    │─────────────────>                    │                     │                   │     
    │                 │                    │                     │                   │     
    │                 │ toggleRecording()  │                     │                   │     
    │                 │──────────────────>│                     │                   │     
    │                 │                    │                     │                   │     
    │                 │                    │ startRecording()    │                   │     
    │                 │                    │───────┐             │                   │     
    │                 │                    │       │             │                   │     
    │                 │                    │<──────┘             │                   │     
    │                 │                    │                     │                   │     
    │                 │ updateMicUI(true)  │                     │                   │     
    │                 │<─────────────────┬┘                     │                   │     
    │                 │                  │                      │                   │     
    │ Speak Message   │                  │                      │                   │     
    │─────────────────>                 │                      │                   │     
    │                 │                  │                      │                   │     
    │                 │                  │ handleRecognition()  │                   │     
    │                 │                  │───────┐              │                   │     
    │                 │                  │       │              │                   │     
    │                 │                  │<──────┘              │                   │     
    │                 │                  │                      │                   │     
    │                 │ Show Interim Text│                      │                   │     
    │                 │<─────────────────┘                      │                   │     
    │                 │                                         │                   │     
    │ Click Mic Again │                                         │                   │     
    │─────────────────>                                         │                   │     
    │                 │                                         │                   │     
    │                 │ toggleRecording()                       │                   │     
    │                 │───────────────────────────────────────>│                   │     
    │                 │                                         │                   │     
    │                 │                                         │ stopRecording()   │     
    │                 │                                         │───────┐           │     
    │                 │                                         │       │           │     
    │                 │                                         │<──────┘           │     
    │                 │                                         │                   │     
    │                 │ updateMicUI(false)                      │                   │     
    │                 │<──────────────────────────────────────┬┘                   │     
    │                 │                                       │                    │     
    │                 │                                       │ Send Transcript    │     
    │                 │                                       │──────────────────>│     
    │                 │                                       │                    │     
    │                 │                                       │ Process Query      │     
    │                 │                                       │                    │─────┐
    │                 │                                       │                    │     │
    │                 │                                       │                    │<────┘
    │                 │                                       │                    │     
    │                 │                                       │ Send Request       │     
    │                 │                                       │───────────────────>     
    │                 │                                       │                    │     
    │                 │                                       │ Return Response    │     
    │                 │                                       │<───────────────────     
    │                 │                                       │                    │     
    │                 │                                       │ Format Response    │     
    │                 │                                       │───────┐            │     
    │                 │                                       │       │            │     
    │                 │                                       │<──────┘            │     
    │                 │                                       │                    │     
    │                 │ Display Response                      │                    │     
    │                 │<──────────────────────────────────────┘                    │     
    │                 │                                                            │     
    │ View AI Response│                                                            │     
    │<────────────────┘                                                            │     
    │                 │                                                            │     
```

### Explanation:
1. User types a question in the Chat UI
2. Chat UI sends the query to the Chatbot Component
3. Chatbot Component sends the request to the Gemini API
4. Gemini API processes the query
5. Gemini API returns a response
6. Chatbot Component formats the response for display
7. Chat UI displays the response to the user
8. User asks a follow-up question
9. The process repeats, but this time with conversation context

### Implementation in ConnectSphere:
- **Chat UI**: Implemented in `chat-advisor.html`
- **Chatbot Component**: Implemented in `js/chatbot.js`
- **API Integration**: Implemented through HTTP requests to Gemini API

Key code from `js/chatbot.js`:
```javascript
// Sending a message to the AI advisor
const sendMessageToAI = async (message, chatHistory = []) => {
  try {
    // Prepare the prompt with personality and context
    const personalityPrompt = getPersonalityPrompt();
    const contextPrompt = buildContextFromHistory(chatHistory);
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: personalityPrompt + contextPrompt + message }
            ]
          }
        ]
      })
    });
    
    const data = await response.json();
    return {
      success: true,
      response: data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error("Error getting AI response:", error);
    return {
      success: false,
      error: "Sorry, I couldn't process your request. Please try again."
    };
  }
};
```

## How Sequence Diagrams Address Design Constraints

1. **Authentication Constraint**: The User Authentication Flow sequence diagram shows how authentication is enforced before access is granted.

2. **Authorization Constraint**: The sequence diagrams show the flow of checking user permissions before performing operations.

3. **UI Modification Constraint**: The clear separation between UI components and business logic components in the sequence diagrams supports easy UI modifications.

4. **Centralized Data Constraint**: All sequence diagrams show data access flowing through the Supabase Database, ensuring centralized data management.

5. **Modifiability Constraint**: The modular interaction patterns shown in the sequence diagrams allow for easy modification of individual components without affecting the entire flow.
