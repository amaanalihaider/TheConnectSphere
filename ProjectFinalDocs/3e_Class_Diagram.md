# Class Diagram

## Overview
The Class Diagram for ConnectSphere illustrates the static structure of the system, showing the classes, their attributes, operations, and the relationships among objects. Although ConnectSphere is primarily implemented in JavaScript, which is not strictly class-based, this diagram represents the conceptual object structure of the application. This diagram has been updated to reflect the current implementation of the ConnectSphere project, including the real-time messaging system, Google OAuth integration, and voice input functionality.

## Class Diagram

```
┌───────────────────────┐           ┌─────────────────────────┐           ┌───────────────────────┐
│       User            │           │      Profile            │           │     Conversation       │
├───────────────────────┤           ├─────────────────────────┤           ├───────────────────────┤
│ - id: UUID            │           │ - id: UUID              │           │ - id: UUID            │
│ - email: String       │◄─────────►│ - first_name: String    │◄─────────►│ - created_at: DateTime│
│ - created_at: DateTime│1         1│ - last_name: String     │1         *│ - updated_at: DateTime│
│ - last_sign_in: DateTime          │ - username: String      │           │                       │
└───────────┬───────────┘           │ - birthdate: Date       │           └───────────┬───────────┘
            │                        │ - gender: String        │                       │
            │                        │ - city: String          │                       │
            │                        │ - bio: Text             │                       │
            │                        │ - interests: String[]   │                       │
            │                        │ - relationship_types: String[]                  │
            │                        │ - gender_preferences: String[]                  │
            │                        │ - created_at: DateTime  │                       │
            │                        │ - updated_at: DateTime  │                       │
            │                        └─────────────┬───────────┘                       │
            │                                      │                                   │
            │                                      │                                   │
            ▼                                      ▼                                   ▼
┌───────────────────────┐           ┌─────────────────────────┐           ┌───────────────────────┐
│    Subscription       │           │      MatchPreference    │           │       Message         │
├───────────────────────┤           ├─────────────────────────┤           ├───────────────────────┤
│ - id: UUID            │           │ - profile_id: UUID      │           │ - id: UUID            │
│ - user_id: UUID       │           │ - min_age: Integer      │           │ - conversation_id: UUID
│ - plan_type: String   │           │ - max_age: Integer      │           │ - sender_id: UUID     │
│ - status: String      │           │ - distance: Integer     │           │ - content: Text       │
│ - start_date: DateTime│           │ - interests: String[]   │           │ - is_read: Boolean    │
│ - end_date: DateTime  │           │ - relationship_types: String[]      │ - created_at: DateTime│
│ - payment_status: String          │                         │           │                       │
└───────────────────────┘           └─────────────────────────┘           └───────────────────────┘
            ▲                                                                         ▲
            │                                                                         │
            │                                                                         │
┌───────────────────────┐                                               ┌───────────────────────┐
│     Payment           │                                               │    VoiceMessage       │
├───────────────────────┤                                               ├───────────────────────┤
│ - id: UUID            │                                               │ - id: UUID            │
│ - subscription_id: UUID                                               │ - message_id: UUID    │
│ - amount: Decimal     │                                               │ - audio_url: String   │
│ - currency: String    │                                               │ - duration: Integer   │
│ - payment_method: String                                              │ - transcription: Text │
│ - status: String      │                                               │                       │
│ - created_at: DateTime│                                               └───────────────────────┘
└───────────────────────┘                                                         

┌───────────────────────┐           ┌─────────────────────────┐           ┌───────────────────────┐
│     Connection        │           │    ChatAdvisor          │           │   Notification        │
├───────────────────────┤           ├─────────────────────────┤           ├───────────────────────┤
│ - id: UUID            │           │ - id: UUID              │           │ - id: UUID            │
│ - requester_id: UUID  │           │ - user_id: UUID         │           │ - user_id: UUID       │
│ - recipient_id: UUID  │           │ - personality: String   │           │ - type: String        │
│ - status: String      │           │ - chat_history: Object[]│           │ - content: Text       │
│ - created_at: DateTime│           │ - created_at: DateTime  │           │ - related_id: UUID    │
│ - updated_at: DateTime│           │ - updated_at: DateTime  │           │ - is_read: Boolean    │
└───────────────────────┘           └─────────────────────────┘           │ - created_at: DateTime│
                                                                          └───────────────────────┘
```

## Class Descriptions

### 1. User
- **Description**: Represents an authenticated user of the system
- **Attributes**:
  - `id`: UUID - Unique identifier for the user (from Supabase auth)
  - `email`: String - User's email address
  - `created_at`: DateTime - When the user account was created
  - `last_sign_in`: DateTime - When the user last signed in
- **Operations**: (Implemented in `js/auth.js` and `js/supabaseClient.js`)
  - `signUp(email, password)`: Registers a new user
  - `signIn(email, password)`: Authenticates a user
  - `signInWithGoogle()`: Authenticates a user via Google OAuth
  - `handleOAuthCallback()`: Processes Google OAuth redirect
  - `signOut()`: Logs out the user
  - `resetPassword(email)`: Initiates password reset
  - `updatePassword(password)`: Updates user password
  - `getCurrentUser()`: Gets the currently authenticated user
  - `isAuthenticated()`: Checks if user is authenticated
- **Relationships**:
  - One-to-One with Profile
  - One-to-Many with Subscription
- **Implementation**: Mapped to Supabase auth.users table

### 2. Profile
- **Description**: Contains user profile information and preferences
- **Attributes**:
  - `id`: UUID - Unique identifier (references User.id)
  - `first_name`: String - User's first name
  - `last_name`: String - User's last name
  - `username`: String - Unique username
  - `birthdate`: Date - User's date of birth
  - `gender`: String - User's gender
  - `city`: String - User's location
  - `bio`: Text - User's self-description
  - `interests`: String[] - Array of user interests
  - `relationship_types`: String[] - Desired relationship types
  - `gender_preferences`: String[] - Gender preferences for matching
  - `created_at`: DateTime - When the profile was created
  - `updated_at`: DateTime - When the profile was last updated
- **Operations**: (Implemented in `js/database-utils.js`)
  - `createProfile(profileData)`: Creates a new profile
  - `updateProfile(profileData)`: Updates an existing profile
  - `getProfile(id)`: Retrieves a profile by ID
  - `searchProfiles(criteria)`: Searches for profiles matching criteria
- **Relationships**:
  - One-to-One with User
  - One-to-Many with Connection (as requester or recipient)
  - One-to-Many with Conversation
  - One-to-One with MatchPreference
- **Implementation**: Mapped to `profiles` table in Supabase

### 3. Conversation
- **Description**: Represents a real-time messaging conversation between two users
- **Attributes**:
  - `id`: UUID - Unique identifier
  - `user1_id`: UUID - First participant ID
  - `user2_id`: UUID - Second participant ID 
  - `created_at`: DateTime - When the conversation was created
  - `updated_at`: DateTime - When the conversation was last updated
  - `last_message_at`: DateTime - When the last message was sent
- **Operations**: (Implemented in `/tests/msg-test/js/messaging.js`)
  - `createConversation(user1Id, user2Id)`: Creates a new conversation
  - `getConversation(id)`: Retrieves a conversation by ID
  - `listConversations(userId)`: Lists all conversations for a user
  - `getOrCreateConversation(user1Id, user2Id)`: Gets existing or creates new conversation
  - `subscribeToChatUpdates(conversationId)`: Sets up real-time subscription
- **Relationships**:
  - Many-to-One with Profile (user1)
  - Many-to-One with Profile (user2)
  - One-to-Many with Message
- **Implementation**: Mapped to `conversations` table in Supabase with real-time change listeners

### 4. Message
- **Description**: Represents a message within a real-time conversation
- **Attributes**:
  - `id`: UUID - Unique identifier
  - `conversation_id`: UUID - Reference to conversation
  - `sender_id`: UUID - Reference to sending user
  - `content`: Text - Message content
  - `is_read`: Boolean - Whether the message has been read
  - `created_at`: DateTime - When the message was sent
- **Operations**: (Implemented in `/tests/msg-test/js/messaging.js`)
  - `sendMessage(conversationId, content)`: Sends a new message
  - `markAsRead(id)`: Marks a message as read
  - `getMessageHistory(conversationId)`: Gets message history
  - `setupRealtimeSubscription(conversationId)`: Sets up WebSocket listener
  - `handleNewMessage(payload)`: Processes incoming real-time messages
  - `displayMessage(message)`: Updates UI with new messages
- **Relationships**:
  - Many-to-One with Conversation
  - Many-to-One with User (sender)
  - One-to-One with VoiceMessage (optional)
- **Implementation**: Mapped to `messages` table in Supabase with real-time subscriptions

### 5. VoiceMessage
- **Description**: Extends the Chat Advisor with voice input capabilities using the Web Speech API
- **Attributes**:
  - `recording`: Boolean - Whether recording is currently active
  - `recognition`: SpeechRecognition - Web Speech API object
  - `transcript`: String - Current speech recognition result
  - `interim_transcript`: String - Partial recognition results
  - `final_transcript`: String - Finalized recognition results
- **Operations**: (Implemented in `/tests/voice-input-test/js/speech-recognition.js`)
  - `startRecording()`: Activates microphone and begins speech recognition
  - `stopRecording()`: Stops recording and finalizes transcript
  - `toggleRecording()`: Toggles recording state on/off
  - `handleRecognitionResult(event)`: Processes speech recognition results
  - `updateMicrophoneUI(isRecording)`: Updates UI to show recording state
  - `sendTranscriptToChat(transcript)`: Sends transcribed text to chat interface
- **Relationships**:
  - Integrates with ChatAdvisor component
  - Uses Web Speech API (SpeechRecognition interface)
- **Implementation**: Test implementation in `/tests/voice-input-test/` with visual recording indicators

### 6. Subscription
- **Description**: Represents a user's subscription plan
- **Attributes**:
  - `id`: UUID - Unique identifier
  - `user_id`: UUID - Reference to user
  - `plan_type`: String - Type of subscription plan
  - `status`: String - Current status of subscription
  - `start_date`: DateTime - When subscription starts
  - `end_date`: DateTime - When subscription expires
  - `payment_status`: String - Status of payment
- **Operations**: (Implemented in `js/subscription.js`)
  - `createSubscription(userId, planType)`: Creates a new subscription
  - `updateSubscription(id, updates)`: Updates subscription details
  - `cancelSubscription(id)`: Cancels a subscription
  - `checkSubscriptionStatus(userId)`: Checks current status
- **Relationships**:
  - Many-to-One with User
  - One-to-Many with Payment
- **Implementation**: Mapped to `subscriptions` table in Supabase

### 7. Payment
- **Description**: Represents a payment for a subscription
- **Attributes**:
  - `id`: UUID - Unique identifier
  - `subscription_id`: UUID - Reference to subscription
  - `amount`: Decimal - Payment amount
  - `currency`: String - Currency code
  - `payment_method`: String - Method of payment
  - `status`: String - Payment status
  - `created_at`: DateTime - When payment was processed
- **Operations**: (Implemented in `js/payment.js`)
  - `processPayment(subscriptionId, paymentDetails)`: Processes a payment
  - `getPaymentHistory(subscriptionId)`: Gets payment history
- **Relationships**:
  - Many-to-One with Subscription
- **Implementation**: Mapped to `payments` table in Supabase

### 8. MatchPreference
- **Description**: Represents a user's matching preferences
- **Attributes**:
  - `profile_id`: UUID - Reference to profile
  - `min_age`: Integer - Minimum age preference
  - `max_age`: Integer - Maximum age preference
  - `distance`: Integer - Maximum distance preference
  - `interests`: String[] - Interest preferences for matching
  - `relationship_types`: String[] - Relationship type preferences
- **Operations**: (Implementation would be part of matching logic)
  - `updatePreferences(profileId, preferences)`: Updates preferences
  - `getPreferences(profileId)`: Gets current preferences
- **Relationships**:
  - One-to-One with Profile
- **Implementation**: Would be mapped to a `match_preferences` table

### 9. Connection
- **Description**: Represents a connection between two users
- **Attributes**:
  - `id`: UUID - Unique identifier
  - `requester_id`: UUID - Reference to requesting user
  - `recipient_id`: UUID - Reference to receiving user
  - `status`: String - Connection status (pending, accepted, declined)
  - `created_at`: DateTime - When connection was requested
  - `updated_at`: DateTime - When connection status was updated
- **Operations**: (Implementation would be part of connection management)
  - `requestConnection(requesterId, recipientId)`: Sends connection request
  - `respondToRequest(id, response)`: Accepts or declines request
  - `listConnections(userId)`: Lists all connections for a user
- **Relationships**:
  - Many-to-One with Profile (requester)
  - Many-to-One with Profile (recipient)
- **Implementation**: Would be mapped to a `connections` table

### 10. ChatAdvisor
- **Description**: Represents a user's AI chat advisor configuration
- **Attributes**:
  - `id`: UUID - Unique identifier
  - `user_id`: UUID - Reference to user
  - `personality`: String - Advisor personality setting
  - `chat_history`: Object[] - History of chat interactions
  - `created_at`: DateTime - When advisor was created
  - `updated_at`: DateTime - When advisor was last updated
- **Operations**: (Implemented in `js/chatbot.js`)
  - `sendMessage(message)`: Sends message to AI advisor
  - `getResponse(message)`: Gets response from AI
  - `updatePersonality(personality)`: Updates advisor personality
  - `clearHistory()`: Clears chat history
- **Relationships**:
  - Many-to-One with User
- **Implementation**: Mapped to a combination of client-side state and Gemini API

### 11. Notification
- **Description**: Represents a notification sent to a user
- **Attributes**:
  - `id`: UUID - Unique identifier
  - `user_id`: UUID - Reference to receiving user
  - `type`: String - Notification type
  - `content`: Text - Notification content
  - `related_id`: UUID - ID of related entity
  - `is_read`: Boolean - Whether notification has been read
  - `created_at`: DateTime - When notification was created
- **Operations**: (Implemented in `js/notifications.js` and `js/notification-handler.js`)
  - `createNotification(userId, type, content, relatedId)`: Creates notification
  - `markAsRead(id)`: Marks notification as read
  - `getNotifications(userId)`: Gets user's notifications
- **Relationships**:
  - Many-to-One with User
- **Implementation**: Mapped to a `notifications` table in Supabase

## Implementation in ConnectSphere

The class structure described above is implemented in ConnectSphere through:

1. **Database Tables**:
   - The structure is mapped to Supabase database tables
   - Primary and foreign keys enforce relationships
   - Some tables (like `profiles`) are directly implemented
   - Others (like `match_preferences`) are conceptual and would be implemented as needed

2. **JavaScript Objects**:
   - Client-side JavaScript models mirror the database structure
   - Methods are implemented as JavaScript functions
   - Data manipulation occurs through Supabase client API

3. **File Organization**:
   - Related functionality is grouped in JavaScript files
   - Authentication logic in `js/auth.js`
   - Profile management in `js/database-utils.js`
   - Messaging in `/tests/msg-test/js/messaging.js`

## How Class Design Addresses Design Constraints

1. **Authentication Constraint**: The User class is the foundation for authentication, with operations that ensure only authenticated users can access the system.

2. **Authorization Constraint**: Relationships between classes (e.g., User to Profile, User to Subscription) allow for role-based access control.

3. **UI Modification Constraint**: The class design separates data models from presentation, supporting easy UI changes without affecting the underlying data structure.

4. **Centralized Data Constraint**: All data classes are mapped to the Supabase database, ensuring centralized data storage and access.

5. **Modifiability Constraint**: The modular class design with clear responsibilities and relationships allows for easy modification of individual components without affecting others.
