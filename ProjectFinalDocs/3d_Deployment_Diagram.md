# Deployment Diagram

## Overview
The Deployment Diagram for ConnectSphere illustrates how the system's components are deployed across different computing nodes and the physical architecture of the application. This diagram helps understand the hardware requirements, network connections, and deployment configurations.

## Deployment Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      User Environment                                          │
│                                                                                               │
│  ┌───────────────────────────────────┐                                                        │
│  │           Web Browser             │                                                        │
│  │                                   │                                                        │
│  │  ┌─────────────┐ ┌─────────────┐  │                                                        │
│  │  │ HTML/CSS    │ │ JavaScript  │  │                                                        │
│  │  │ Files       │ │ Client      │  │                                                        │
│  │  └─────────────┘ └─────────────┘  │                                                        │
│  │                                   │                                                        │
│  └───────────────────┬───────────────┘                                                        │
│                      │                                                                        │
└──────────────────────┼───────────────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────┼───────────────────────────────────────────────────────────────────────┐
│                      │                       Cloud Environment                                │
│                      ▼                                                                        │
│  ┌───────────────────────────────────┐       ┌────────────────────────────────────┐          │
│  │        Web Server (HTTP)          │       │         Supabase Platform          │          │
│  │                                   │       │                                    │          │
│  │  ┌─────────────┐ ┌─────────────┐  │       │  ┌─────────────┐ ┌─────────────┐  │          │
│  │  │ Static      │ │ HTTP        │  │       │  │ Authentication│ │ Database    │  │          │
│  │  │ Files       │ │ Server      │  │◄─────►│  │ Service     │ │ (PostgreSQL)│  │          │
│  │  └─────────────┘ └─────────────┘  │       │  └─────────────┘ └─────────────┘  │          │
│  │                                   │       │                                    │          │
│  └───────────────────────────────────┘       │  ┌─────────────┐ ┌─────────────┐  │          │
│                                              │  │ Storage     │ │ Realtime    │  │          │
│                                              │  │ Service     │ │ Service     │  │          │
│                                              │  └─────────────┘ └─────────────┘  │          │
│                                              │                                    │          │
│                                              └────────────┬───────────────────────┘          │
│                                                           │                                  │
│                                                           │                                  │
│  ┌───────────────────────────────────┐                    │                                  │
│  │         Google Cloud               │                    │                                  │
│  │                                   │                    │                                  │
│  │  ┌─────────────────────────────┐  │                    │                                  │
│  │  │        Gemini API           │◄─────────────────────┘                                  │
│  │  │                             │  │                                                        │
│  │  └─────────────────────────────┘  │       ┌────────────────────────────────────┐          │
│  │                                   │       │        Payment Gateway Server       │          │
│  └───────────────────────────────────┘       │                                    │          │
│                                              │  ┌─────────────────────────────┐   │          │
│                                              │  │    Payment Processing API    │   │          │
│                                              │  │                             │   │          │
│                                              │  └─────────────────────────────┘   │          │
│                                              │                                    │          │
│                                              └────────────────────────────────────┘          │
│                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Nodes

### 1. User Environment
- **Web Browser**
  - **Description**: The client-side environment where the application runs
  - **Artifacts**:
    - HTML/CSS Files: The rendered UI components
    - JavaScript Client: Client-side application logic
  - **Requirements**:
    - Modern web browser with JavaScript enabled
    - Internet connection
  - **ConnectSphere Implementation**: 
    - All HTML, CSS, and JavaScript files are delivered to and executed in the user's browser
    - Uses browser storage (localStorage) for session management
    - Implements responsive design for different device sizes

### 2. Web Server (HTTP)
- **Description**: Serves static files and routes requests
- **Artifacts**:
  - Static Files: HTML, CSS, JavaScript, images
  - HTTP Server: Handles HTTP requests and serves content
- **Requirements**:
  - Web server software (e.g., Nginx, Apache, or a simple HTTP server)
  - HTTPS certificate for secure connections
- **ConnectSphere Implementation**:
  - Currently using a simple HTTP server for development (`http-server` on port 5500)
  - Production deployment would use a more robust web server with HTTPS
  - No server-side processing is required as the application is client-side

### 3. Supabase Platform
- **Description**: Backend-as-a-Service providing database, authentication, and real-time capabilities
- **Artifacts**:
  - Authentication Service: Handles user authentication and session management
  - Database (PostgreSQL): Stores all application data
  - Storage Service: Manages file storage (not currently used in ConnectSphere)
  - Realtime Service: Enables real-time updates and messaging
- **Requirements**:
  - Supabase project with appropriate configuration
  - PostgreSQL database
  - Network connectivity
- **ConnectSphere Implementation**:
  - Project URL: https://jucwtfexhavfkhhfpcdv.supabase.co
  - Tables for profiles, conversations, messages, and subscriptions
  - Authentication with email/password and Google OAuth
  - Real-time channels for messaging and notifications

### 4. Google Cloud (Gemini API)
- **Description**: Provides AI capabilities for the Chat Advisor feature
- **Artifacts**:
  - Gemini API: Processes natural language and generates responses
- **Requirements**:
  - Google Cloud account with Gemini API access
  - API keys for authentication
- **ConnectSphere Implementation**:
  - Integration with Gemini API for relationship advice
  - Client-side API calls with appropriate authentication

### 5. Payment Gateway Server
- **Description**: Processes payments for subscriptions
- **Artifacts**:
  - Payment Processing API: Handles payment transactions
- **Requirements**:
  - Payment gateway account (e.g., Stripe, PayPal)
  - API keys for authentication
  - PCI compliance for handling payment information
- **ConnectSphere Implementation**:
  - Generic payment flow implemented in `payment.html` and `js/payment.js`
  - Final implementation would integrate with a specific payment gateway

## Communication Paths

1. **Browser to Web Server**:
   - Protocol: HTTPS
   - Purpose: Requesting and receiving static application files
   - Security: SSL/TLS encryption

2. **Browser to Supabase**:
   - Protocol: HTTPS (REST API and WebSockets)
   - Purpose: Authentication, data operations, real-time updates
   - Security: API key authentication, JWT tokens for user sessions

3. **Browser to Gemini API**:
   - Protocol: HTTPS
   - Purpose: Sending user queries and receiving AI responses
   - Security: API key authentication

4. **Browser to Payment Gateway**:
   - Protocol: HTTPS
   - Purpose: Processing subscription payments
   - Security: SSL/TLS encryption, tokenized payment information

5. **Supabase to User (Notifications)**:
   - Protocol: WebSockets
   - Purpose: Pushing real-time updates to the client
   - Security: Authenticated WebSocket connections

## Deployment Considerations

### Security
- All communication between nodes uses HTTPS encryption
- Authentication tokens are securely stored in browser storage
- API keys are protected and not exposed in client-side code
- User passwords are hashed and never stored in plain text

### Scalability
- Static file serving can be scaled through CDN deployment
- Supabase provides database scaling capabilities
- Horizontal scaling by adding more web server instances is possible

### Reliability
- Web server can be deployed with redundancy
- Supabase provides database backups and high availability
- Client-side error handling improves resilience

### Performance
- Static assets can be cached at the browser level
- CDN deployment would reduce latency for static assets
- Database queries are optimized for performance

## How Deployment Architecture Addresses Design Constraints

1. **Authentication Constraint**: The Supabase Authentication Service ensures all access to the application requires authentication.

2. **Authorization Constraint**: The Supabase Database enforces Row Level Security policies that restrict operations based on user roles and permissions.

3. **UI Modification Constraint**: The separation between the Web Browser (front-end) and Supabase (back-end) allows for independent modification of the UI.

4. **Centralized Data Constraint**: Supabase serves as the central repository for all application data, accessible only through authenticated API calls.

5. **Modifiability Constraint**: The deployment architecture separates concerns between different nodes, allowing for independent modification of components.
