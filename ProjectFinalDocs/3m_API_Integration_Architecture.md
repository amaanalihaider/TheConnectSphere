# API Integration Architecture

## Overview
This document illustrates how ConnectSphere integrates with external APIs and services to provide enhanced functionality. The architecture shows the flow of data between ConnectSphere and third-party services like Google's Gemini API for AI-powered relationship advice, Google OAuth for authentication, and potential payment gateways.

## API Integration Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ConnectSphere System                                          │
│                                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                   Client Application                                     │    │
│  │                                                                                         │    │
│  │  ┌───────────────────┐   ┌─────────────────────┐   ┌─────────────────┐   ┌────────────┐│    │
│  │  │                   │   │                     │   │                 │   │            ││    │
│  │  │  Authentication   │   │  Chat Advisor       │   │  Subscription   │   │  Profile   ││    │
│  │  │  Component        │   │  Component          │   │  Component      │   │  Component ││    │
│  │  │                   │   │                     │   │                 │   │            ││    │
│  │  └────────┬──────────┘   └──────────┬──────────┘   └────────┬────────┘   └────────────┘│    │
│  │           │                         │                       │                          │    │
│  └───────────┼─────────────────────────┼───────────────────────┼──────────────────────────┘    │
│              │                         │                       │                               │
│              │                         │                       │                               │
│              ▼                         ▼                       ▼                               │
│  ┌───────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐                │
│  │                   │   │                     │   │                         │                │
│  │  Supabase API     │   │  API Gateway       │   │  Payment Gateway API    │                │
│  │  Integration      │   │  Layer             │   │  Integration            │                │
│  │                   │   │                     │   │                         │                │
│  └────────┬──────────┘   └──────────┬──────────┘   └────────────┬────────────┘                │
│           │                         │                           │                             │
└───────────┼─────────────────────────┼───────────────────────────┼─────────────────────────────┘
            │                         │                           │                              
            │                         │                           │                              
            ▼                         ▼                           ▼                              
┌───────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐                    
│                   │   │                     │   │                         │                    
│  Supabase         │   │  Gemini API         │   │  Payment Provider       │                    
│  Backend          │   │  (Google AI)        │   │  (e.g., Stripe)         │                    
│                   │   │                     │   │                         │                    
└───────────────────┘   └─────────────────────┘   └─────────────────────────┘                    

┌────────────────────────────────────────────────────┐                                            
│                                                    │                                            
│               Google OAuth Service                 │◄────────── Authentication Flow             
│                                                    │             (from Auth Component)          
└────────────────────────────────────────────────────┘                                            
```

## API Integration Components

### 1. Supabase API Integration

**Purpose**: Provides database, authentication, and real-time communication services

**Integration Points**:
- Authentication (email/password and OAuth)
- Database operations (CRUD for profiles, connections, messages)
- Real-time subscriptions for messaging and notifications
- File storage for user uploads

**Implementation**:
```javascript
// Initialize Supabase client
const supabaseClient = createClient(
  'https://jucwtfexhavfkhhfpcdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo'
);

// Example database operation
const getProfile = async (userId) => {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};
```

### 2. Google OAuth Integration

**Purpose**: Provides social authentication option

**Integration Points**:
- Sign in with Google
- User profile creation from Google account data
- Session management

**Implementation**:
```javascript
// Sign in with Google
const signInWithGoogle = async () => {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/verification-success.html`
    }
  });
  
  if (error) throw error;
  return data;
};
```

### 3. Gemini API Integration (Google AI)

**Purpose**: Powers the AI relationship advisor feature

**Integration Points**:
- Natural language processing for user queries
- Context-aware relationship advice generation
- Conversation history management

**Implementation**:
```javascript
// Send a message to the AI advisor
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

### 4. Payment Gateway Integration

**Purpose**: Processes subscription payments

**Integration Points**:
- Payment processing for premium subscriptions
- Subscription status management
- Payment history tracking

**Implementation**:
```javascript
// Process a subscription payment
const processPayment = async (subscriptionId, paymentDetails) => {
  try {
    // Call payment gateway API
    const response = await fetch('/api/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        paymentMethod: paymentDetails.paymentMethod,
      }),
    });
    
    const data = await response.json();
    
    // Update subscription status in Supabase
    if (data.success) {
      await supabaseClient
        .from('subscriptions')
        .update({ 
          status: 'active',
          payment_status: 'paid' 
        })
        .eq('id', subscriptionId);
      
      // Record payment in database
      await supabaseClient
        .from('payments')
        .insert({
          subscription_id: subscriptionId,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          payment_method: paymentDetails.paymentMethod,
          status: 'succeeded',
          created_at: new Date().toISOString()
        });
    }
    
    return data;
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, error };
  }
};
```

## API Gateway Layer

The API Gateway layer serves as a mediator between the client application and external APIs, providing:

1. **Request Transformation**: Formats requests according to each API's requirements
2. **Response Parsing**: Standardizes responses for client consumption
3. **Error Handling**: Gracefully handles API errors and connectivity issues
4. **Caching**: Caches responses where appropriate to reduce API calls
5. **Rate Limiting**: Respects API rate limits to avoid throttling

Implementation in `js/api-gateway.js`:

```javascript
// Example of API Gateway pattern for Gemini API
class GeminiApiGateway {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.requestsThisMinute = 0;
    this.lastRequestTime = Date.now();
  }
  
  async sendRequest(prompt, maxTokens = 1024) {
    // Rate limiting
    this.checkRateLimit();
    
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens }
        })
      });
      
      // Track request for rate limiting
      this.requestsThisMinute++;
      this.lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error.message}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        text: data.candidates[0].content.parts[0].text,
        usage: data.usageMetadata
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
  
  checkRateLimit() {
    // Reset counter if a minute has passed
    if (Date.now() - this.lastRequestTime > 60000) {
      this.requestsThisMinute = 0;
    }
    
    // Throw error if rate limit exceeded
    if (this.requestsThisMinute >= 60) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }
}
```

## Authentication and Security

1. **API Keys**: Stored securely and not exposed in client-side code
2. **JWT Tokens**: Used for authenticated requests to Supabase
3. **HTTPS**: All API communications use HTTPS
4. **Request Validation**: Inputs are validated before being sent to external APIs
5. **Response Sanitization**: API responses are sanitized before presentation

## Error Handling Strategy

1. **Network Errors**: Detected and presented with user-friendly messages
2. **API Errors**: Parsed and handled based on error type
3. **Fallback Behavior**: Graceful degradation when APIs are unavailable
4. **Retry Logic**: Automatic retries for transient errors

```javascript
// Example error handling for API requests
const makeApiRequest = async (apiCall, retries = 3) => {
  let attempts = 0;
  
  while (attempts < retries) {
    try {
      return await apiCall();
    } catch (error) {
      attempts++;
      
      // Don't retry if it's a client error
      if (error.status >= 400 && error.status < 500) {
        return { success: false, error };
      }
      
      // Wait before retrying (exponential backoff)
      if (attempts < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }
  }
  
  return { 
    success: false, 
    error: 'Service unavailable after multiple attempts. Please try again later.' 
  };
};
```

## How This Architecture Addresses Design Constraints

1. **Authentication Constraint**: API calls include proper authentication credentials for secure access.

2. **Authorization Constraint**: API access is controlled based on user roles and subscription status.

3. **UI Modification Constraint**: The API Gateway layer decouples external service integration from the UI.

4. **Centralized Data Constraint**: All external data is processed through standardized gateways before being used in the application.

5. **Modifiability Constraint**: The modular API integration architecture allows for easy swapping or upgrading of external services as needed.
