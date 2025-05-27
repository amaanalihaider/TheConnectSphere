# System Architecture and Design Patterns

## Architectural Style/Pattern Selection

### Selected Architectural Style: Model-View-Controller (MVC) with Client-Server

ConnectSphere implements a hybrid architectural pattern combining MVC and Client-Server architecture. This combination provides a clean separation of concerns on the frontend while leveraging the power of Supabase as the backend service.

#### Architecture Block Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              Client (Browser)                                  │
│                                                                               │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────────────┐     │
│  │    View     │◄────────┤ Controller  │◄────────┤       Model        │     │
│  │  (HTML/CSS) │         │ (JavaScript)│         │ (JavaScript/State) │     │
│  └─────────────┘         └─────────────┘         └─────────────────────┘     │
│         ▲                       │                          ▲                  │
└─────────┼───────────────────────┼──────────────────────────┼─────────────────┘
          │                       │                          │
          │                       ▼                          │
┌─────────┴───────────────────────┴──────────────────────────┴─────────────────┐
│                                Server                                         │
│                                                                               │
│  ┌─────────────────┐        ┌─────────────┐         ┌─────────────────────┐  │
│  │  Supabase API   │◄───────┤  Business   │◄────────┤     Database        │  │
│  │    Endpoints    │        │    Logic    │         │   (PostgreSQL)      │  │
│  └─────────────────┘        └─────────────┘         └─────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Justification for Architectural Pattern Selection

1. **MVC Pattern:**
   - **Separation of Concerns:** MVC separates the application into three logical components (Model, View, Controller), making the codebase more maintainable and modular. This directly addresses design constraint #3 which requires support for easy UI modification.
   - **Code Reusability:** Components can be reused across different parts of the application, reducing redundancy.
   - **Parallel Development:** Different team members can work on views, controllers, and models simultaneously.

2. **Client-Server Architecture:**
   - **Centralized Data Management:** Supabase provides a centralized repository for data storage and authentication, addressing design constraint #4.
   - **Security:** Authentication and authorization are managed at the server level through Supabase, addressing design constraints #1 and #2.
   - **Scalability:** Server resources can be scaled independently of the client application.

## Design Patterns Used in ConnectSphere

### 1. Observer Pattern

#### Implementation in ConnectSphere
The Observer pattern is implemented in the real-time messaging and notification systems. Supabase's real-time functionality is used to observe database changes and update the UI accordingly.

**Files Implementing This Pattern:**
- `js/messaging.js`: Implements subscription to message changes
- `js/notifications.js`: Listens for notification events
- `js/supabase-client.js`: Sets up the subscription channels

**Example from code:**
```javascript
// From messaging.js
const setupMessageSubscription = (conversationId) => {
  const subscription = supabaseClient
    .channel(`conversation-${conversationId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        // Handle new message (Observer response)
        addMessageToUI(payload.new);
      }
    )
    .subscribe();
  
  return subscription;
};
```

**Why We Used This Pattern:**
- Enables real-time updates without polling
- Decouples message creation from message display
- Allows multiple UI components to react to the same data change
- Supports the non-functional requirement of delivering messages within 1 second

### 2. Singleton Pattern

#### Implementation in ConnectSphere
The Singleton pattern is used for the Supabase client connection, ensuring only one instance of the connection is maintained throughout the application.

**Files Implementing This Pattern:**
- `js/supabaseClient.js`: Creates and maintains a single instance of the Supabase client

**Example from code:**
```javascript
// From supabaseClient.js
let supabaseInstance = null;

const createClient = () => {
  if (supabaseInstance === null) {
    supabaseInstance = supabase.createClient(
      "https://jucwtfexhavfkhhfpcdv.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo"
    );
  }
  return supabaseInstance;
};

const supabaseClient = createClient();
```

**Why We Used This Pattern:**
- Ensures a single connection to the database
- Manages authentication state consistently across the application
- Prevents memory leaks from multiple connection instances
- Optimizes resource usage

### 3. Strategy Pattern

#### Implementation in ConnectSphere
The Strategy pattern is used for the authentication system, allowing different authentication strategies (email/password, OAuth) to be used interchangeably.

**Files Implementing This Pattern:**
- `js/auth.js`: Implements different authentication strategies
- `js/authNavigation.js`: Handles redirection based on auth state

**Example from code:**
```javascript
// From auth.js
const signInWithEmail = async (email, password) => {
  // Email authentication strategy
  return await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
};

const signInWithGoogle = async () => {
  // Google authentication strategy
  return await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/verification-success.html'
    }
  });
};
```

**Why We Used This Pattern:**
- Allows switching between different authentication methods without changing client code
- Makes it easy to add new authentication providers
- Decouples authentication implementation from authentication usage
- Supports design constraint #5 for easy modifications

### 4. Facade Pattern

#### Implementation in ConnectSphere
The Facade pattern is used to provide simplified interfaces to complex subsystems like the Supabase API and the Gemini API for the Chat Advisor.

**Files Implementing This Pattern:**
- `js/chatbot.js`: Provides a simple interface to the complex Gemini API
- `js/database-utils.js`: Simplifies database operations

**Example from code:**
```javascript
// From database-utils.js (Facade providing simple interface to complex Supabase operations)
const saveUserProfile = async (profileData) => {
  try {
    const { data: user, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) throw userError;
    
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.user.id,
        ...profileData,
        updated_at: new Date()
      });
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, error };
  }
};
```

**Why We Used This Pattern:**
- Simplifies complex API interactions
- Provides a unified interface to different subsystems
- Reduces dependencies between subsystems
- Supports design constraint #4 by centralizing data access logic

### 5. Module Pattern

#### Implementation in ConnectSphere
The Module pattern is used extensively throughout the JavaScript codebase to encapsulate functionality and avoid polluting the global namespace.

**Files Implementing This Pattern:**
- Most JavaScript files in the project use this pattern

**Example from code:**
```javascript
// From profile-dropdown.js
const ProfileDropdown = (function() {
  // Private variables
  let profileBtn;
  let profileDropdown;
  
  // Private methods
  const toggleDropdown = () => {
    profileDropdown.classList.toggle('show');
  };
  
  // Public API
  return {
    init: function() {
      profileBtn = document.getElementById('profile-btn');
      profileDropdown = document.getElementById('profile-dropdown');
      
      if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', toggleDropdown);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
          if (!profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
            profileDropdown.classList.remove('show');
          }
        });
      }
    }
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', ProfileDropdown.init);
```

**Why We Used This Pattern:**
- Encapsulates code and provides privacy
- Reduces naming conflicts
- Organizes code in a modular way
- Supports design constraints #3 and #5 by making the code more maintainable

## How Design Patterns Address Design Constraints

1. **Constraint: Application shall only allow access to authenticated users only.**
   - **Solution:** The Singleton pattern for the Supabase client and Strategy pattern for authentication ensure a consistent authentication state across the application.

2. **Constraint: Authenticated users shall only be able to perform authorized operations.**
   - **Solution:** The MVC architecture and Facade pattern for database operations ensure all data access goes through proper authorization checks.

3. **Constraint: Support easy modification to the User interface.**
   - **Solution:** The MVC architecture separates UI (View) from business logic (Controller and Model), allowing independent modifications to the UI without affecting the rest of the system.

4. **Constraint: All data needs to be stored in a central repository.**
   - **Solution:** The Client-Server architecture with Supabase as the backend ensures centralized data storage and access through a consistent API.

5. **Constraint: The system shall be easily modifiable.**
   - **Solution:** The Module pattern and Strategy pattern make the code modular and replaceable, supporting easy modifications to existing features.

## Real-time Communication Architecture

ConnectSphere implements a WebSocket-based real-time communication architecture for features like messaging, notifications, and live updates. This architecture is crucial for providing a responsive user experience without requiring page refreshes.

### Reasoning for Real-time Architecture Selection

1. **User Experience Requirements**: The project specification explicitly required a fully real-time experience without needing refreshes or clicking refresh buttons. WebSocket-based architecture was selected to meet this requirement.

2. **Messaging Functionality**: Real-time communication is essential for a messaging system where users expect instant message delivery and status updates.

3. **Supabase Capabilities**: Supabase's built-in real-time subscriptions provide an efficient way to implement WebSocket communications without building custom WebSocket servers.

4. **Development Efficiency**: Using Supabase's real-time features simplified implementation compared to building a custom socket server, allowing faster development of the messaging test implementation.

### Real-time Architecture Diagram

```
┌──────────────────┐                 ┌───────────────────┐
│                  │                 │                   │
│  Client Browser  │◄───WebSocket───►│  Supabase         │
│                  │    Channel      │  Realtime Server  │
└────────┬─────────┘                 └─────────┬─────────┘
         │                                      │
         │                                      │
         │                                      │
         │                                      │
         │                                      │
         ▼                                      ▼
┌────────────────────┐               ┌───────────────────┐
│                    │               │                   │
│  Supabase Client   │               │  PostgreSQL       │
│  JavaScript API    │◄─REST API────►│  Database         │
│                    │               │                   │
└────────────────────┘               └───────────────────┘
```

### Key Components

1. **WebSocket Channels**: Dedicated channels for different types of real-time events (conversations, notifications)
2. **Subscription Mechanism**: Client-side code to subscribe to relevant channels
3. **Event Handling**: Handlers for different types of database changes (INSERT, UPDATE, DELETE)
4. **UI Updates**: Real-time DOM updates based on received events

### Implementation

```javascript
// From messaging.js
const setupRealtimeSubscription = () => {
  return supabaseClient
    .channel('public:messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, handleNewMessage)
    .subscribe();
};
```

## Security Architecture

ConnectSphere's security architecture consists of multiple layers to protect user data and ensure secure operations.

### Reasoning for Security Architecture Decisions

1. **Authentication Requirements**: The primary design constraint specifies that the application shall only allow access to authenticated users, making a robust authentication system essential.

2. **Multiple Auth Methods**: Google OAuth was implemented alongside email/password authentication to provide users with flexibility and improve user experience through simplified login.

3. **JWT-Based Authentication**: JWTs were chosen because:
   - They're stateless, improving scalability
   - They integrate seamlessly with Supabase's architecture
   - They provide secure information transfer between parties
   - They support short expiry times to minimize security risks

4. **Token-Based Approach**: This approach was selected to eliminate the need for session storage on the server, reducing database load and simplifying authentication management.

### Authentication Layer

- **JWT-based Authentication**: JSON Web Tokens for session management
- **Multiple Authentication Methods**: Email/password and Google OAuth
- **Session Management**: Automatic token refresh and secure storage

### Authorization Layer

- **Role-Based Access Control**: Different capabilities for Guest, Basic, and Premium users
- **Row Level Security (RLS)**: Database-level policies to restrict data access
- **Subscription-based Feature Access**: Premium features restricted based on subscription status

### Data Protection

- **HTTPS**: All communications encrypted using TLS
- **Password Hashing**: Secure password storage using bcrypt
- **Input Validation**: Client and server-side validation to prevent injection attacks

## Data Flow Architecture

Data flows through ConnectSphere in a structured manner, ensuring consistency and responsiveness.

### Reasoning for Data Flow Architecture

1. **Central Repository Requirement**: The design constraint specifying that all data needs to be stored in a central repository led to the selection of a unidirectional data flow through Supabase.

2. **Real-time Updates**: The real-time messaging requirement necessitated a data flow architecture that supports both REST API operations and WebSocket subscriptions.

3. **MVC Alignment**: The data flow architecture aligns with the MVC pattern, ensuring clear separation between data handling, business logic, and presentation.

4. **CRUD Operations Consistency**: A consistent approach to Create, Read, Update, and Delete operations simplifies development and maintenance while ensuring data integrity.

5. **Optimistic UI Updates**: The architecture supports optimistic UI updates (showing changes before server confirmation) with fallback mechanisms for error cases, improving perceived performance.

### Data Flow Diagram

```
┌─────────────┐         ┌────────────────┐         ┌────────────────┐
│             │         │                │         │                │
│  User Input │────────►│ View Component │────────►│   Controller   │
│             │         │                │         │                │
└─────────────┘         └────────────────┘         └───────┬────────┘
                                                           │
                                                           │
                                                           ▼
┌─────────────┐         ┌────────────────┐         ┌───────────────┐
│             │         │                │         │               │
│   Updated   │◄────────┤ View Component │◄────────┤ Model/State   │
│     UI      │         │                │         │               │
└─────────────┘         └────────────────┘         └───────┬───────┘
                                                           │
                                                           │
                                                           ▼
                                                  ┌────────────────┐
                                                  │                │
                                                  │   Supabase     │
                                                  │   Database     │
                                                  │                │
                                                  └────────────────┘
```

### Data Operations

1. **Create**: New data is validated, processed through controllers, and stored in Supabase
2. **Read**: Data is fetched from Supabase, processed through models, and rendered in views
3. **Update**: Changes are validated, processed, and synchronized with Supabase
4. **Delete**: Removal requests are validated and executed in Supabase

## Error Handling Architecture

ConnectSphere implements a comprehensive error handling architecture to provide a robust user experience.

### Reasoning for Error Handling Architecture

1. **User Experience Priority**: A robust error handling architecture was implemented to ensure users receive clear feedback when operations fail, as seen in the connection request flow enhancements.

2. **Multi-layered Approach**: The multi-layered approach ensures errors are caught and handled at the appropriate level, preventing cascading failures through the system.

3. **Developer Debugging**: Comprehensive error logging helps developers identify and fix issues quickly, improving the maintenance process.

4. **Graceful Degradation**: The error handling approach allows the application to gracefully degrade functionality rather than completely failing when parts of the system are unavailable.

5. **Error Prevention**: The architecture includes validation steps to prevent errors before they occur, such as form validation before submission.

### Error Handling Layers

1. **UI Layer**: User-friendly error messages and graceful degradation
2. **Controller Layer**: Error catching, logging, and appropriate responses
3. **API Layer**: Status codes and consistent error formats
4. **Database Layer**: Transaction management and constraint handling

### Implementation

```javascript
// Typical error handling pattern in ConnectSphere
const performOperation = async () => {
  try {
    // Show loading state
    showLoadingIndicator();
    
    // Perform operation
    const { data, error } = await supabaseClient.from('table').select();
    
    if (error) throw error;
    
    // Process data
    updateUI(data);
    return { success: true, data };
  } catch (error) {
    // Log error
    console.error('Operation failed:', error);
    
    // Show user-friendly message
    showErrorMessage('Something went wrong. Please try again.');
    return { success: false, error };
  } finally {
    // Clean up
    hideLoadingIndicator();
  }
};
```

## Scalability and Performance Considerations

ConnectSphere's architecture is designed with scalability and performance in mind.

### Reasoning for Scalability and Performance Architecture

1. **Real-time Requirements**: The requirement for real-time messaging and updates led to architectural choices that prioritize low latency and efficient data transfer, such as using WebSockets over polling.

2. **Future Growth**: The architecture anticipates user growth by leveraging Supabase's cloud infrastructure, which can scale automatically with increased demand.

3. **Client-side Performance**: Given the client-heavy nature of the application, performance optimizations like caching and pagination were implemented to reduce server load and improve response times.

4. **Resource Efficiency**: The architecture minimizes resource usage through connection pooling and efficient query design, ensuring the application remains responsive even with concurrent users.

5. **Modular Design**: The modular design pattern allows for horizontal scaling by enabling independent deployment and scaling of different components.

6. **Data Volume Management**: As message history and user data grows, the architecture includes strategies like pagination and lazy loading to maintain performance with increasing data volumes.

### Scalability Features

1. **Stateless Authentication**: JWT-based authentication allows for horizontal scaling
2. **Serverless Architecture**: Supabase scales automatically based on demand
3. **Static Asset Optimization**: CSS and JavaScript minification and bundling
4. **Lazy Loading**: Components and resources loaded only when needed

### Performance Optimizations

1. **Efficient Queries**: Optimized database queries with proper indexing
2. **Connection Pooling**: Efficient database connection management
3. **Caching**: Local storage caching for frequently accessed data
4. **Pagination**: Data fetched in chunks to reduce payload size
