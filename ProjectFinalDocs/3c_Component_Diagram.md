# Component Diagram

## Overview
The Component Diagram for ConnectSphere illustrates the major components of the system and their relationships. This diagram helps understand how different parts of the application interact with each other and with external systems.

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
   - **Responsibilities**: Login, registration, password reset, session management
   - **Implementation**: Authentication-related JavaScript files
   - **Key Files**: `js/auth.js`, `js/supabaseClient.js`, `js/authNavigation.js`
   - **Interfaces**:
     - Provides authentication state to other components
     - Consumes authentication services from Supabase
     - Interacts with Google OAuth for social login

3. **Profile Management Component**
   - **Description**: Handles user profile creation, editing, and viewing
   - **Responsibilities**: Profile CRUD operations, preference management
   - **Implementation**: Profile-related JavaScript files
   - **Key Files**: `js/database-utils.js` (profile operations), `my-profile.html`
   - **Interfaces**:
     - Provides profile data to other components
     - Consumes authentication data
     - Uses Supabase for data storage

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
   - **Description**: Implements real-time messaging between users
   - **Responsibilities**: Message sending, receiving, history, notifications
   - **Implementation**: Messaging-related JavaScript files
   - **Key Files**: Files in `/tests/msg-test/` directory
   - **Interfaces**:
     - Provides messaging UI and functionality
     - Consumes authentication and profile data
     - Uses Supabase for real-time communication

6. **AI Advisor Component**
   - **Description**: Implements the AI-powered relationship advisor
   - **Responsibilities**: Processing user queries, getting AI responses, personalization
   - **Implementation**: AI-related JavaScript files
   - **Key Files**: `js/chatbot.js`, `chat-advisor.html`
   - **Interfaces**:
     - Provides chat interface and responses
     - Consumes user input and profile data
     - Integrates with Gemini API

7. **Subscription Management Component**
   - **Description**: Handles subscription plans, payments, and status
   - **Responsibilities**: Displaying plans, processing payments, updating subscription status
   - **Implementation**: Subscription-related JavaScript files
   - **Key Files**: `js/subscription.js`, `js/payment.js`, `subscription.html`, `payment.html`
   - **Interfaces**:
     - Provides subscription UI and functionality
     - Consumes authentication data
     - Integrates with Payment Gateway
     - Uses Supabase for data storage

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
   - **Responsibilities**: Data storage, authentication, real-time updates
   - **Implementation**: Accessed through Supabase JavaScript client
   - **Key Files**: `js/supabaseClient.js`
   - **Interfaces**:
     - Provides data storage and retrieval
     - Provides authentication services
     - Provides real-time subscription API

2. **Gemini API Service**
   - **Description**: Google's AI model for natural language processing
   - **Responsibilities**: Generating relationship advice responses
   - **Implementation**: Accessed through HTTP requests
   - **Key Files**: `js/chatbot.js`
   - **Interfaces**:
     - Provides AI-generated responses based on input

3. **Payment Gateway Service**
   - **Description**: External payment processing service
   - **Responsibilities**: Securely processing payments for subscriptions
   - **Implementation**: Integrated in subscription flow
   - **Key Files**: `js/payment.js`
   - **Interfaces**:
     - Provides payment processing capabilities

4. **Google OAuth Service**
   - **Description**: Google's authentication service for social login
   - **Responsibilities**: Authenticating users through Google accounts
   - **Implementation**: Integrated in authentication flow
   - **Key Files**: `js/auth.js`
   - **Interfaces**:
     - Provides social authentication capabilities

## Component Interactions

1. **Authentication Flow**:
   - User Interface → Authentication Component → Supabase/Google OAuth → Profile Management

2. **Matching Flow**:
   - User Interface → Profile Management → Matching Engine → User Interface

3. **Messaging Flow**:
   - User Interface → Authentication → Messaging Component → Supabase → Recipient's UI

4. **AI Advisor Flow**:
   - User Interface → Authentication → AI Advisor Component → Gemini API → User Interface

5. **Subscription Flow**:
   - User Interface → Authentication → Subscription Management → Payment Gateway → Supabase

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
