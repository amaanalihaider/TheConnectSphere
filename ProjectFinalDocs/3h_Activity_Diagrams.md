# Activity Diagrams

## Overview
Activity diagrams illustrate the workflow and procedural logic of key processes within ConnectSphere. These diagrams help visualize the flow of activities from start to finish, including decision points, parallel activities, and the overall process flow.

## Activity Diagram 1: User Registration and Profile Creation Process

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                                     ●  Start                                     │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │  Display Signup │                                   │
│                            │     Form        │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ User Enters     │                                   │
│                            │ Email/Password  │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ Validate Input  │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                               ┌────────────┐                                     │
│                               │ Input Valid?│                                    │
│                               └──────┬─────┘                                     │
│                                      │                                           │
│                    ┌─────────────────┴─────────────────┐                         │
│                    │                                   │                         │
│                    ▼                                   ▼                         │
│               ┌────────┐                         ┌────────┐                      │
│               │   No   │                         │  Yes   │                      │
│               └────┬───┘                         └────┬───┘                      │
│                    │                                  │                          │
│                    ▼                                  ▼                          │
│          ┌───────────────────┐              ┌──────────────────┐                │
│          │ Display Validation│              │ Create User in   │                │
│          │     Errors        │              │ Supabase Auth    │                │
│          └─────────┬─────────┘              └────────┬─────────┘                │
│                    │                                 │                           │
│                    │                                 ▼                           │
│                    │                        ┌──────────────────┐                │
│                    │                        │ Send Verification│                │
│                    │                        │     Email        │                │
│                    │                        └────────┬─────────┘                │
│                    │                                 │                           │
│                    │                                 ▼                           │
│                    │                        ┌──────────────────┐                │
│                    │                        │ Redirect to      │                │
│                    │                        │ Verification Page│                │
│                    │                        └────────┬─────────┘                │
│                    │                                 │                           │
│                    │                                 ▼                           │
│                    │                     ┌─────────────────────┐                │
│                    │                     │ User Clicks Email   │                │
│                    │                     │ Verification Link   │                │
│                    │                     └──────────┬──────────┘                │
│                    │                                │                            │
│                    │                                ▼                            │
│                    │                     ┌─────────────────────┐                │
│                    │                     │ Redirect to Success │                │
│                    │                     │       Page          │                │
│                    │                     └──────────┬──────────┘                │
│                    │                                │                            │
│                    │                                ▼                            │
│                    │                     ┌─────────────────────┐                │
│                    │                     │ Display Profile     │                │
│                    │                     │  Creation Form      │                │
│                    │                     └──────────┬──────────┘                │
│                    │                                │                            │
│                    │                                ▼                            │
│                    │                     ┌─────────────────────┐                │
│                    │                     │ User Enters Profile │                │
│                    └────────────────────►│      Data          │                │
│                                          └──────────┬──────────┘                │
│                                                     │                            │
│                                                     ▼                            │
│                                          ┌─────────────────────┐                │
│                                          │ Validate Profile    │                │
│                                          │      Data           │                │
│                                          └──────────┬──────────┘                │
│                                                     │                            │
│                                                     ▼                            │
│                                               ┌────────────┐                     │
│                                               │ Data Valid?│                     │
│                                               └──────┬─────┘                     │
│                                                      │                           │
│                                 ┌─────────────────────┴─────────────────┐        │
│                                 │                                       │        │
│                                 ▼                                       ▼        │
│                            ┌────────┐                               ┌────────┐   │
│                            │   No   │                               │  Yes   │   │
│                            └────┬───┘                               └────┬───┘   │
│                                 │                                        │       │
│                                 ▼                                        ▼       │
│                       ┌───────────────────┐                   ┌──────────────────┐
│                       │ Display Validation│                   │ Save Profile to  │
│                       │     Errors        │                   │     Database     │
│                       └─────────┬─────────┘                   └────────┬─────────┘
│                                 │                                      │          
│                                 │                                      ▼          
│                                 │                             ┌──────────────────┐
│                                 │                             │ Redirect to      │
│                                 └─────────────────────────────►    Dashboard     │
│                                                               └────────┬─────────┘
│                                                                        │          
│                                                                        ▼          
│                                                                       ● End       
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Process Description:
1. The registration process begins with displaying the signup form to the user
2. User enters email, password, and other required information
3. System validates the input data
4. If validation fails, errors are displayed and the user must correct the input
5. If validation passes, a new user account is created in Supabase Auth
6. System sends a verification email to the user
7. User is redirected to a verification pending page
8. User clicks the verification link in their email
9. User is redirected to a verification success page
10. System displays a profile creation form
11. User enters profile information (name, age, interests, etc.)
12. System validates the profile data
13. If validation fails, errors are displayed
14. If validation passes, profile is saved to the database
15. User is redirected to the dashboard

### Implementation in ConnectSphere:
- **Signup Form**: Implemented in `signup.html`
- **Validation Logic**: Implemented in form event handlers in signup.html
- **Auth Creation**: Implemented in `js/auth.js` using Supabase auth
- **Email Verification**: Handled by Supabase auth
- **Profile Creation**: Implemented in `js/database-utils.js`

Key code from `js/auth.js`:
```javascript
const signUp = async (email, password) => {
  try {
    // Create the user in Supabase Auth
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/verification-success.html'
      }
    });
    
    if (error) throw error;
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error signing up:", error);
    return { success: false, error };
  }
};
```

## Activity Diagram 2: Matching and Connection Process

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                                     ●  Start                                     │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ User Navigates  │                                   │
│                            │ to Find Match   │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                         ┌───────────────────────┐                                │
│                         │ System Loads User     │                                │
│                         │ Preferences from DB   │                                │
│                         └───────────┬───────────┘                                │
│                                     │                                            │
│                                     ▼                                            │
│                         ┌───────────────────────┐                                │
│                         │ System Queries for    │                                │
│                         │ Potential Matches     │                                │
│                         └───────────┬───────────┘                                │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ Display Matches │                                   │
│                            │    to User      │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ User Browses    │                                   │
│                            │   Profiles      │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ User Selects    │                                   │
│                            │   a Profile     │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ View Detailed   │                                   │
│                            │   Profile       │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                       ┌────────────────────────┐                                 │
│                       │ User Decides to Connect│                                 │
│                       └────────────┬───────────┘                                 │
│                                    │                                             │
│                                    ▼                                             │
│                            ┌─────────────────┐                                   │
│                            │ Send Connection │                                   │
│                            │    Request      │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                         ┌───────────────────────┐                                │
│                         │ System Saves Request  │                                │
│                         │     to Database       │                                │
│                         └───────────┬───────────┘                                │
│                                     │                                            │
│                                     ▼                                            │
│                         ┌───────────────────────┐                                │
│                         │ System Sends          │                                │
│                         │ Notification to Other │                                │
│                         │       User            │                                │
│                         └───────────┬───────────┘                                │
│                                     │                                            │
│                                     ▼                                            │
│                         ┌───────────────────────┐                                │
│                         │ Other User Receives   │                                │
│                         │ Connection Request    │                                │
│                         └───────────┬───────────┘                                │
│                                     │                                            │
│                                     ▼                                            │
│                       ┌────────────────────────┐                                 │
│                       │ Other User Reviews     │                                 │
│                       │     Request            │                                 │
│                       └────────────┬───────────┘                                 │
│                                    │                                             │
│                                    ▼                                             │
│                              ┌────────────┐                                      │
│                              │ Accept?    │                                      │
│                              └──────┬─────┘                                      │
│                                     │                                            │
│                   ┌─────────────────┴─────────────────┐                          │
│                   │                                   │                          │
│                   ▼                                   ▼                          │
│              ┌────────┐                         ┌────────┐                       │
│              │   No   │                         │  Yes   │                       │
│              └────┬───┘                         └────┬───┘                       │
│                   │                                  │                           │
│                   ▼                                  ▼                           │
│         ┌───────────────────┐                ┌──────────────────┐               │
│         │ Update Status to  │                │ Update Status to │               │
│         │     Declined      │                │     Accepted     │               │
│         └─────────┬─────────┘                └────────┬─────────┘               │
│                   │                                   │                          │
│                   │                                   ▼                          │
│                   │                         ┌───────────────────┐                │
│                   │                         │ Create Conversation│               │
│                   │                         │    Between Users   │               │
│                   │                         └────────┬──────────┘                │
│                   │                                  │                           │
│                   │                                  ▼                           │
│                   │                         ┌───────────────────┐                │
│                   │                         │ Enable Messaging  │                │
│                   │                         │   Functionality   │                │
│                   │                         └────────┬──────────┘                │
│                   │                                  │                           │
│                   ▼                                  ▼                           │
│          ┌──────────────────┐              ┌───────────────────┐                │
│          │ Notify Requester │              │ Notify Both Users │                │
│          │   of Decline     │              │  of Connection    │                │
│          └────────┬─────────┘              └────────┬──────────┘                │
│                   │                                 │                            │
│                   │                                 ▼                            │
│                   │                       ┌─────────────────────┐                │
│                   └───────────────────────►  Continue Browsing  │                │
│                                           │     or Chatting     │                │
│                                           └──────────┬──────────┘                │
│                                                      │                           │
│                                                      ▼                           │
│                                                     ● End                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Process Description:
1. User navigates to the Find Match page
2. System loads user preferences from the database
3. System queries the database for potential matches based on preferences
4. Matching profiles are displayed to the user
5. User browses through the profiles
6. User selects a profile to view in detail
7. User decides to connect with the selected profile
8. System sends a connection request and saves it to the database
9. System sends a notification to the other user
10. The other user receives and reviews the connection request
11. If declined, the system updates the status and notifies the requester
12. If accepted, the system updates the status and creates a conversation
13. Messaging functionality is enabled between the connected users
14. Both users are notified of the successful connection
15. Users can continue browsing or start chatting

### Implementation in ConnectSphere:
- **Match Display**: Implemented in `find-yourself-one.html`
- **Connection Requests**: Conceptual, would be implemented in a connections table
- **Notifications**: Implemented in `js/notifications.js`
- **Conversation Creation**: Implemented in `/tests/msg-test/js/messaging.js`

## Activity Diagram 3: AI Chat Advisor Consultation Process

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                                     ●  Start                                     │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌─────────────────┐                                   │
│                            │ User Navigates  │                                   │
│                            │ to Chat Advisor │                                   │
│                            └────────┬────────┘                                   │
│                                     │                                            │
│                                     ▼                                            │
│                         ┌───────────────────────┐                                │
│                         │ System Checks User    │                                │
│                         │ Authentication Status │                                │
│                         └───────────┬───────────┘                                │
│                                     │                                            │
│                                     ▼                                            │
│                              ┌────────────┐                                      │
│                              │Authenticated?                                     │
│                              └──────┬─────┘                                      │
│                                     │                                            │
│                   ┌─────────────────┴─────────────────┐                          │
│                   │                                   │                          │
│                   ▼                                   ▼                          │
│              ┌────────┐                         ┌────────┐                       │
│              │   No   │                         │  Yes   │                       │
│              └────┬───┘                         └────┬───┘                       │
│                   │                                  │                           │
│                   ▼                                  ▼                           │
│         ┌───────────────────┐                ┌──────────────────┐               │
│         │ Redirect to Login │                │ Load Chat Advisor│               │
│         │      Page         │                │    Interface     │               │
│         └─────────┬─────────┘                └────────┬─────────┘               │
│                   │                                   │                          │
│                   │                                   ▼                          │
│                   │                         ┌───────────────────┐                │
│                   │                         │ Check Subscription│                │
│                   │                         │      Status       │                │
│                   │                         └────────┬──────────┘                │
│                   │                                  │                           │
│                   │                                  ▼                           │
│                   │                           ┌────────────┐                     │
│                   │                           │ Premium?   │                     │
│                   │                           └──────┬─────┘                     │
│                   │                                  │                           │
│                   │                  ┌───────────────┴───────────────┐           │
│                   │                  │                               │           │
│                   │                  ▼                               ▼           │
│                   │             ┌────────┐                     ┌────────┐        │
│                   │             │   No   │                     │  Yes   │        │
│                   │             └────┬───┘                     └────┬───┘        │
│                   │                  │                              │            │
│                   │                  ▼                              ▼            │
│                   │      ┌────────────────────┐          ┌───────────────────┐  │
│                   │      │ Load Basic Advisor │          │ Load Personalized │  │
│                   │      │    with Limits     │          │  Advisor Settings │  │
│                   │      └────────┬───────────┘          └─────────┬─────────┘  │
│                   │               │                                │            │
│                   │               └────────────────┬───────────────┘            │
│                   │                                │                            │
│                   │                                ▼                            │
│                   │                      ┌─────────────────┐                    │
│                   │                      │ Display Greeting│                    │
│                   │                      │    Message      │                    │
│                   │                      └────────┬────────┘                    │
│                   │                               │                             │
│                   │                               ▼                             │
│                   │                      ┌─────────────────┐                    │
│                   │                      │ User Types      │                    │
│                   └─────────────────────►│ Relationship    │                    │
│                                          │ Question        │                    │
│                                          └────────┬────────┘                    │
│                                                   │                             │
│                                                   ▼                             │
│                                     ┌────────────────────────┐                  │
│                                     │ System Processes Query │                  │
│                                     └────────────┬───────────┘                  │
│                                                  │                              │
│                                                  ▼                              │
│                                     ┌────────────────────────┐                  │
│                                     │ Send Request to Gemini │                  │
│                                     │         API            │                  │
│                                     └────────────┬───────────┘                  │
│                                                  │                              │
│                                                  ▼                              │
│                                     ┌────────────────────────┐                  │
│                                     │ Receive and Format     │                  │
│                                     │        Response        │                  │
│                                     └────────────┬───────────┘                  │
│                                                  │                              │
│                                                  ▼                              │
│                                        ┌─────────────────┐                      │
│                                        │ Display AI      │                      │
│                                        │   Response      │                      │
│                                        └────────┬────────┘                      │
│                                                 │                               │
│                                                 ▼                               │
│                                        ┌─────────────────┐                      │
│                                        │ Save to Chat    │                      │
│                                        │   History       │                      │
│                                        └────────┬────────┘                      │
│                                                 │                               │
│                                                 ▼                               │
│                                        ┌─────────────────┐                      │
│                                        │ User Continues  │                      │
│                                        │   Conversation  │                      │
│                                        └────────┬────────┘                      │
│                                                 │                               │
│                                                 ▼                               │
│                                                ● End                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Process Description:
1. User navigates to the Chat Advisor page
2. System checks if the user is authenticated
3. If not authenticated, user is redirected to the login page
4. If authenticated, the Chat Advisor interface loads
5. System checks the user's subscription status
6. Premium users get personalized advisor settings
7. Basic users get the standard advisor with limits
8. System displays a greeting message
9. User types a relationship question
10. System processes the query
11. System sends the request to the Gemini API
12. System receives and formats the response
13. AI response is displayed to the user
14. Conversation is saved to the chat history
15. User can continue the conversation with follow-up questions

### Implementation in ConnectSphere:
- **Chat Interface**: Implemented in `chat-advisor.html`
- **AI Processing**: Implemented in `js/chatbot.js`
- **Subscription Check**: Implemented in `js/subscription-validator.js`
- **Chat History**: Maintained in client-side state and/or database

Key code from `js/chatbot.js`:
```javascript
// Process user message and get AI response
const processUserMessage = async (message) => {
  try {
    // Display user message in UI
    displayMessage('user', message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Check if user is premium
    const isPremium = await checkPremiumStatus();
    
    // Get personalization settings for premium users
    const personalitySettings = isPremium ? 
      await getUserPersonalizationSettings() : 
      getDefaultPersonalitySettings();
    
    // Add message to chat history
    chatHistory.push({ role: 'user', content: message });
    
    // Get response from AI
    const response = await getAIResponse(message, chatHistory, personalitySettings);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Display AI response in UI
    displayMessage('ai', response);
    
    // Add response to chat history
    chatHistory.push({ role: 'assistant', content: response });
    
    // Save chat history if user is premium
    if (isPremium) {
      saveChatHistory(chatHistory);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error processing message:", error);
    hideTypingIndicator();
    displayErrorMessage("Sorry, I couldn't process your message. Please try again.");
    return { success: false, error };
  }
};
```

## How Activity Diagrams Address Design Constraints

1. **Authentication Constraint**: The activity diagrams show authentication checks at the beginning of processes that require authenticated users.

2. **Authorization Constraint**: The diagrams include subscription status checks to determine what level of functionality is available to users.

3. **UI Modification Constraint**: The clear separation between UI activities and business logic activities supports easy UI modifications.

4. **Centralized Data Constraint**: The diagrams show data being consistently stored in and retrieved from the Supabase database.

5. **Modifiability Constraint**: The modular structure of the activities allows for easy modification of individual steps without affecting the entire process.
