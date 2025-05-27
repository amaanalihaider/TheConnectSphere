# Use Case Diagram

## Overview
The Use Case Diagram for ConnectSphere illustrates the key interactions between the system's actors and the main functionalities of the application. This diagram provides a high-level view of what users can do with the system.

## Actors
1. **Guest User**: Unauthenticated visitor to the platform
2. **Registered User**: Authenticated user with a standard account
3. **Premium User**: Authenticated user with a paid subscription
4. **Admin**: System administrator with elevated privileges
5. **External Systems**: Third-party systems (Payment Gateway, Google OAuth, Email Service)

## Use Case Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ConnectSphere System                                     │
│                                                                                               │
│  ┌─────────────────────┐         ┌──────────────────────┐       ┌────────────────────────┐   │
│  │  Account Management │         │ Relationship Building │       │ Communication Services │   │
│  │                     │         │                      │       │                        │   │
│  │  ┌───────────────┐  │         │  ┌────────────────┐  │       │  ┌─────────────────┐  │   │
│  │  │ Register      │  │         │  │ Create Profile │  │       │  │ Send Messages   │  │   │
│  │  └───────────────┘  │         │  └────────────────┘  │       │  └─────────────────┘  │   │
│  │                     │         │                      │       │                        │   │
│  │  ┌───────────────┐  │         │  ┌────────────────┐  │       │  ┌─────────────────┐  │   │
│  │  │ Login         │  │         │  │ Search Matches │  │       │  │ Voice Messages  │  │   │
│  │  └───────────────┘  │         │  └────────────────┘  │       │  └─────────────────┘  │   │
│  │                     │         │                      │       │                        │   │
│  │  ┌───────────────┐  │         │  ┌────────────────┐  │       │  ┌─────────────────┐  │   │
│  │  │ Reset Password│  │         │  │ View Profiles  │  │       │  │ Read Receipts   │  │   │
│  │  └───────────────┘  │         │  └────────────────┘  │       │  └─────────────────┘  │   │
│  │                     │         │                      │       │                        │   │
│  │  ┌───────────────┐  │         │  ┌────────────────┐  │       │                        │   │
│  │  │ Google OAuth  │  │         │  │ Connect Users  │  │       │                        │   │
│  │  └───────────────┘  │         │  └────────────────┘  │       │                        │   │
│  └─────────────────────┘         └──────────────────────┘       └────────────────────────┘   │
│                                                                                               │
│  ┌─────────────────────┐         ┌──────────────────────┐       ┌────────────────────────┐   │
│  │ Subscription System │         │ AI Advisory Services │       │ Analytics & Dashboard  │   │
│  │                     │         │                      │       │                        │   │
│  │  ┌───────────────┐  │         │  ┌────────────────┐  │       │  ┌─────────────────┐  │   │
│  │  │ View Plans    │  │         │  │ Chat with AI   │  │       │  │ View Analytics  │  │   │
│  │  └───────────────┘  │         │  └────────────────┘  │       │  └─────────────────┘  │   │
│  │                     │         │                      │       │                        │   │
│  │  ┌───────────────┐  │         │  ┌────────────────┐  │       │  ┌─────────────────┐  │   │
│  │  │ Subscribe     │  │         │  │ Personalize AI │  │       │  │ Track Progress  │  │   │
│  │  └───────────────┘  │         │  └────────────────┘  │       │  └─────────────────┘  │   │
│  │                     │         │                      │       │                        │   │
│  │  ┌───────────────┐  │         │                      │       │                        │   │
│  │  │ Make Payment  │  │         │                      │       │                        │   │
│  │  └───────────────┘  │         │                      │       │                        │   │
│  └─────────────────────┘         └──────────────────────┘       └────────────────────────┘   │
│                                                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Actor Relationships with Use Cases

### Guest User
- Register
- Login
- Google OAuth Login
- Reset Password
- View Plans
- View Landing Page Content
- Contact Support

### Registered User (inherits from Guest User)
- Create/Edit Profile
- Search Matches
- View Profiles
- Send Connection Requests
- Accept/Decline Connection Requests
- Manage Connections
- Send/Receive Messages
- View Message History
- Chat with AI Advisor
- View Analytics (limited)
- Subscribe to Premium
- Manage Subscription
- View Notifications
- Mark Notifications as Read
- Receive Real-time Updates
- Verify Email Address
- Update Account Settings
- Change Password
- Log Out

### Premium User (inherits from Registered User)
- Access to advanced match filtering
- Send Voice Messages
- Access Read Receipts
- View Typing Indicators
- Personalize AI Advisor
- Export Chat History
- Full Analytics Dashboard
- Track Relationship Progress
- Priority Support Access
- Create Group Conversations
- Access Enhanced Privacy Settings

### Admin
- Manage User Accounts
- Monitor System Usage
- Configure System Settings
- View Usage Analytics
- Manage Subscription Plans
- Handle Support Requests
- Moderate User Content
- Manage Email Templates
- View System Logs

### External Systems
- **Payment Gateway**: Process subscription payments
- **Google OAuth**: Authenticate users via Google
- **Email Service**: Send verification and notification emails
- **Gemini API**: Process AI chatbot queries
- **Storage Service**: Store user media and files
- **Email Service**: Send verification and notification emails

## Implementation in ConnectSphere

The ConnectSphere application implements these use cases through the following key files:

1. **Account Management**:
   - `login.html`, `signup.html`
   - `js/auth.js`
   - `js/supabaseClient.js`

2. **Relationship Building**:
   - `find-yourself-one.html`
   - `my-profile.html`

3. **Communication Services**:
   - `tests/msg-test/` directory (real-time messaging implementation)
   - `tests/voice-input-test/` directory (voice messaging implementation)

4. **Subscription System**:
   - `subscription.html`
   - `payment.html`
   - `js/subscription.js`
   - `js/payment.js`

5. **AI Advisory Services**:
   - `chat-advisor.html`
   - `js/chatbot.js`

6. **Analytics & Dashboard**:
   - `relationship-dashboard.html`
   - `js/relationship-dashboard.js`

## Constraints Addressed

1. **Authentication Constraint**: All use cases except those for Guest Users require authentication, implemented through Supabase authentication services.

2. **Authorization Constraint**: Different user roles (Registered, Premium) have access to different use cases, controlled through the subscription system.

3. **UI Modification Constraint**: The separation of HTML views from JavaScript controllers allows for easy UI modifications.

4. **Centralized Data Constraint**: All data access flows through the Supabase client, ensuring centralized repository access.

5. **Modifiability Constraint**: The modular design of use cases allows for easy modification of individual features.
