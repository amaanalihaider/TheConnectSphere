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
