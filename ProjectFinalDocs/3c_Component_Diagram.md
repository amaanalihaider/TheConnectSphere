# Component Diagram

## Overview
The Component Diagram for ConnectSphere illustrates the major components of the system and their relationships. This diagram helps understand how different parts of the application interact with each other and with external systems. This diagram has been aligned with the current implementation of the ConnectSphere project.

## Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          ConnectSphere Application                                      │
│                                                                                                        │
│  ┌────────────────────┐     ┌──────────────────────┐     ┌───────────────────┐     ┌─────────────────┐ │
│  │                    │     │                      │     │                   │     │                 │ │
│  │   User Interface   │     │   Authentication     │     │   Profile         │     │  Matching       │ │
│  │   Components       │◄────┤   Component         │◄────┤   Management      │◄────┤  Engine         │ │
│  │                    │     │                      │     │   Component       │     │                 │ │
│  └─────────┬──────────┘     └──────────┬───────────┘     └────────┬──────────┘     └────────┬────────┘ │
│            │                           │                          │                         │          │
│            │                           │                          │                         │          │
│            ▼                           ▼                          ▼                         ▼          │
│  ┌────────────────────┐     ┌──────────────────────┐     ┌───────────────────┐     ┌─────────────────┐ │
│  │                    │     │                      │     │                   │     │                 │ │
│  │   Messaging        │     │   AI Advisor         │     │   Subscription    │     │  Analytics      │ │
│  │   Component        │     │   Component          │     │   Management      │     │  Dashboard      │ │
│  │                    │     │                      │     │   Component       │     │  Component      │ │
│  └─────────┬──────────┘     └──────────┬───────────┘     └────────┬──────────┘     └────────┬────────┘ │
│            │                           │                          │                         │          │
└────────────┼───────────────────────────┼──────────────────────────┼─────────────────────────┼──────────┘
             │                           │                          │                         │           
             │                           │                          │                         │           
             ▼                           ▼                          ▼                         ▼           
┌────────────────────────┐  ┌───────────────────────┐  ┌──────────────────────┐  ┌───────────────────────┐
│                        │  │                       │  │                      │  │                       │
│   Supabase Database    │  │   Gemini API          │  │   Payment Gateway    │  │   Google OAuth        │
│   Service              │  │   Service             │  │   Service            │  │   Service             │
│                        │  │                       │  │                      │  │                       │
└────────────────────────┘  └───────────────────────┘  └──────────────────────┘  └───────────────────────┘
```

## Component Descriptions

### Frontend Components

1. **User Interface Components**
   - **Description**: Handles all HTML templates, CSS styling, and UI interactions
   - **Responsibilities**: Rendering views, handling user interactions, form validation
   - **Implementation**: HTML files, CSS files, and UI-specific JavaScript
   - **Key Files**: All HTML files, CSS files in `/css` directory
   - **Interfaces**:
     - Provides UI events to other components
     - Consumes data from backend components for display

2. **Authentication Component**
   - **Description**: Manages user authentication, registration, and session handling
   - **Responsibilities**: Login, registration, password reset, session management, Google OAuth authentication
   - **Implementation**: Authentication-related JavaScript files with Supabase and Google OAuth integration
   - **Key Files**: `js/auth.js`, `js/supabaseClient.js`, `login.html`, `signup.html`, `verification-pending.html`, `verification-success.html`, `forgot-password.html`, `reset-password.html`
   - **Interfaces**:
     - Provides authentication state to other components
     - Consumes user credentials
     - Integrates with Supabase Auth and Google OAuth
     - Handles JWT token management

3. **Profile Management Component**
   - **Description**: Handles user profile creation, editing, and viewing
   - **Responsibilities**: Profile creation after registration, profile updating, preference management
   - **Implementation**: Profile-related JavaScript files with Supabase database operations
   - **Key Files**: 
     - `js/database-utils.js`: Core database operations for profiles
     - `my-profile.html`: Profile management interface
     - Tables: profiles with fields for personal info, preferences, and relationship settings
   - **Interfaces**:
     - Provides profile data to other components (matching, messaging, AI advisor)
     - Consumes authentication data from Supabase Auth
     - Uses Supabase database for profile storage and retrieval
     - Manages array fields for interests, relationship types, and gender preferences

4. **Matching Engine**
   - **Description**: Implements the logic for finding and suggesting matches
   - **Responsibilities**: Filtering profiles, suggesting matches, managing connections
   - **Implementation**: Match-related JavaScript files
   - **Key Files**: `find-yourself-one.html`, associated JavaScript
   - **Interfaces**:
     - Provides match results to UI
     - Consumes profile data
     - Uses Supabase for data storage

5. **Messaging Component**
   - **Description**: Implements real-time messaging between users using Supabase WebSocket subscriptions
   - **Responsibilities**: Real-time message sending/receiving, conversation management, message history loading
   - **Implementation**: Dedicated test implementation with modular architecture
   - **Key Files**: 
     - `/tests/msg-test/index.html`: Dual user interface for testing
     - `/tests/msg-test/js/supabase-client.js`: Supabase connection and auth
     - `/tests/msg-test/js/messaging.js`: Real-time messaging functionality
     - `/tests/msg-test/css/styles.css`: Messaging interface styling
     - `/tests/msg-test/sql/create_tables.sql`: Database tables and functions
   - **Interfaces**:
     - Provides real-time messaging UI with message history
     - Consumes authentication data from Supabase
     - Uses Supabase real-time channels for instant updates
     - Interacts with conversations and messages tables

6. **AI Advisor Component**
   - **Description**: Implements the AI-powered relationship advisor with voice input capabilities
   - **Responsibilities**: Processing user queries, getting AI responses, personalization, speech-to-text input
   - **Implementation**: AI-related JavaScript files and Web Speech API integration
   - **Key Files**: 
     - `js/chatbot.js`: Core chatbot functionality
     - `chat-advisor.html`: Main chat interface
     - `/tests/voice-input-test/`: Test implementation of voice input feature
     - `/tests/voice-input-test/index.html`: Voice-enabled chat interface
     - `/tests/voice-input-test/js/speech-recognition.js`: Web Speech API integration
   - **Interfaces**:
     - Provides chat interface with text and voice input options
     - Consumes user input (text and speech) and profile data
     - Integrates with Gemini API for AI responses
     - Uses Web Speech API for speech-to-text functionality

7. **Subscription Management Component**
   - **Description**: Handles premium subscription plans, payments, and user tier management
   - **Responsibilities**: Displaying subscription plans, processing payments, tracking premium features access
   - **Implementation**: Subscription-related JavaScript files with payment gateway integration
   - **Key Files**: 
     - `subscription.html`: Premium plan display and selection interface
     - `js/subscription-manager.js`: Subscription logic and premium feature access
     - `js/payment.js`: Payment processing
   - **Interfaces**:
     - Provides subscription UI with plan comparison
     - Consumes authentication data to identify subscribers
     - Integrates with Payment Gateway for secure processing
     - Uses Supabase for storing subscription status and managing premium access

8. **Analytics Dashboard Component**
   - **Description**: Displays relationship analytics and insights
   - **Responsibilities**: Collecting metrics, generating visualizations, tracking progress
   - **Implementation**: Dashboard-related JavaScript files
   - **Key Files**: `relationship-dashboard.html`, `js/relationship-dashboard.js`
   - **Interfaces**:
     - Provides analytics UI and visualizations
     - Consumes profile and relationship data
     - Uses Supabase for data retrieval

### External Components

1. **Supabase Database Service**
   - **Description**: Cloud-based PostgreSQL database with authentication and real-time capabilities
   - **Responsibilities**: Data storage, authentication, real-time updates, WebSocket subscriptions
   - **Implementation**: Accessed through Supabase JavaScript client (URL: https://jucwtfexhavfkhhfpcdv.supabase.co)
   - **Key Database Tables**:
     - `profiles`: User profile data with fields for personal info and preferences
     - `conversations`: Tracks conversations between two users
     - `messages`: Stores individual messages with sender, receiver, and content
   - **Key Files**: 
     - `js/supabaseClient.js`: Central configuration and client instantiation
     - Various database utility files for CRUD operations
   - **Interfaces**:
     - Provides secure data storage and retrieval
     - Handles authentication with email/password and Google OAuth
     - Delivers real-time updates via WebSocket channels
     - Supports Row Level Security (currently disabled as per user preference)

2. **Gemini API Service**
   - **Description**: Google's AI model for natural language processing and relationship advice
   - **Responsibilities**: Generating personalized relationship advice, analyzing relationship patterns
   - **Implementation**: Accessed through HTTP requests to Google's API
   - **Key Files**: 
     - `js/chatbot.js`: Handles API requests and response processing
     - `chat-advisor.html`: Interface for interacting with the AI
   - **Interfaces**:
     - Provides AI-generated responses based on user queries
     - Accepts contextual information about relationships
     - Returns structured advice that can be displayed in the chat interface
     - Supports the voice input feature for natural conversational interaction

3. **Payment Gateway Service**
   - **Description**: External payment processing service
   - **Responsibilities**: Securely processing payments for subscriptions
   - **Implementation**: Integrated in subscription flow
   - **Key Files**: `js/payment.js`
   - **Interfaces**:
     - Provides payment processing capabilities

4. **Google OAuth Service**
   - **Description**: Google's authentication service for social login
   - **Responsibilities**: Authenticating users through Google accounts, retrieving profile data
   - **Implementation**: Integrated in authentication flow via Supabase OAuth
   - **Key Files**: 
     - `js/supabaseClient.js`: Contains `signInWithGoogle()` and `handleOAuthCallback()` functions
     - `login.html` and `signup.html`: Include Google sign-in buttons
     - Authentication flow redirects to `verification-success.html` after successful OAuth
   - **Interfaces**:
     - Provides streamlined social authentication
     - Returns Google account data for profile creation
     - Handles OAuth redirect flow
     - Integrates with Supabase authentication system

## Component Interactions

1. **Authentication Flow**:
   - **Email/Password**: User Interface → Authentication Component → Supabase Auth → Email Verification → Profile Management
   - **Google OAuth**: User Interface → Authentication Component → Google OAuth → Supabase Auth → Profile Management

2. **Profile Management Flow**:
   - User Interface → Authentication Check → Profile Management Component → Supabase Database → Updated UI

3. **Matching Flow**:
   - User Interface → Authentication Check → Profile Management → Matching Engine → Supabase Database → User Interface

4. **Real-time Messaging Flow**:
   - **Message Sending**: User Interface → Authentication Check → Messaging Component → Supabase Database
   - **Real-time Delivery**: Supabase Database → Supabase WebSocket → Messaging Component → Recipient's UI
   - **Message History**: Messaging Component → Supabase Database → Messaging Component → User Interface

5. **AI Advisor Flow**:
   - **Text Input**: User Interface → Authentication Check → AI Advisor Component → Gemini API → User Interface
   - **Voice Input**: User Interface → Web Speech API → AI Advisor Component → Gemini API → User Interface

6. **Subscription Flow**:
   - User Interface → Authentication Check → Subscription Management → Payment Gateway → Supabase → Feature Access Control

## Implementation in ConnectSphere

The component architecture is implemented in ConnectSphere through clear separation of concerns:

1. **HTML Files**: Define the UI structure for each component
2. **CSS Files**: Style each component with clear namespacing
3. **JavaScript Files**: Implement component logic with modular approach
4. **Directory Structure**: Organizes related files by component

## How Component Design Addresses Design Constraints

1. **Authentication Constraint**: The Authentication Component is a central gatekeeper that ensures all other components only operate for authenticated users.

2. **Authorization Constraint**: The Authentication Component works with the Subscription Management Component to enforce operation permissions based on user roles.

3. **UI Modification Constraint**: The User Interface Components are isolated from business logic components, allowing independent modification.

4. **Centralized Data Constraint**: All components interact with the Supabase Database Service as the central repository for data.

5. **Modifiability Constraint**: The modular component design allows for easy modification of individual components without affecting others.
