# Authentication Flow Diagram

## Overview
This document illustrates the authentication flows in ConnectSphere, including both email/password authentication and Google OAuth integration. Understanding these flows is critical as authentication is the gateway to all other functionality in the system.

## Email/Password Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Email Authentication Flow                                      │
│                                                                                                  │
│  ┌────────────┐         ┌────────────────┐         ┌────────────────┐         ┌────────────────┐ │
│  │            │         │                │         │                │         │                │ │
│  │    User    │         │   Login/Signup │         │  Auth Component│         │    Supabase    │ │
│  │            │         │       UI       │         │                │         │     Auth       │ │
│  └─────┬──────┘         └───────┬────────┘         └───────┬────────┘         └───────┬────────┘ │
│        │                        │                         │                          │          │
│        │                        │                         │                          │          │
│        │   Navigate to page     │                         │                          │          │
│        │ ─────────────────────► │                         │                          │          │
│        │                        │                         │                          │          │
│        │                        │                         │                          │          │
│        │   Enter credentials    │                         │                          │          │
│        │ ─────────────────────► │                         │                          │          │
│        │                        │                         │                          │          │
│        │                        │   Validate input        │                          │          │
│        │                        │ ────────────────────────►                          │          │
│        │                        │                         │                          │          │
│        │                        │                         │  Auth API Call          │          │
│        │                        │                         │ ─────────────────────────►          │
│        │                        │                         │                          │          │
│        │                        │                         │                          │          │
│        │                        │                         │                          │          │
│        │                        │                         │   Auth Response          │          │
│        │                        │                         │ ◄─────────────────────────          │
│        │                        │                         │                          │          │
│        │                        │                         │                          │          │
│        │                        │   Auth Result           │                          │          │
│        │                        │ ◄───────────────────────┘                          │          │
│        │                        │                                                    │          │
│        │                        │                                                    │          │
│        │   Success/Error Message│                                                    │          │
│        │ ◄─────────────────────┘                                                    │          │
│        │                                                                             │          │
│        │                                                                             │          │
│        │                        ┌──────────────────────────────────────┐            │          │
│        │                        │            IF SUCCESS                 │            │          │
│        │                        └──────────────────────────────────────┘            │          │
│        │                                                                             │          │
│        │                        │                         │                          │          │
│        │                        │                         │  Get User Profile       │          │
│        │                        │                         │ ─────────────────────────►          │
│        │                        │                         │                          │          │
│        │                        │                         │   Profile Data           │          │
│        │                        │                         │ ◄─────────────────────────          │
│        │                        │                         │                          │          │
│        │                        │                         │                          │          │
│        │   Redirect to Dashboard│                         │                          │          │
│        │ ◄─────────────────────┘                         │                          │          │
│        │                                                  │                          │          │
│  ┌─────┴──────┐         ┌───────┬────────┐         ┌─────┴──────────┐         ┌─────┴──────────┐ │
│  │            │         │                │         │                │         │                │ │
│  │    User    │         │   Login/Signup │         │  Auth Component│         │    Supabase    │ │
│  │            │         │       UI       │         │                │         │     Auth       │ │
│  └────────────┘         └────────────────┘         └────────────────┘         └────────────────┘ │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Google OAuth Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Google OAuth Authentication Flow                               │
│                                                                                                  │
│  ┌────────────┐      ┌────────────────┐      ┌────────────────┐      ┌─────────┐     ┌──────────┐│
│  │            │      │                │      │                │      │         │     │          ││
│  │    User    │      │   Login/Signup │      │  Auth Component│      │ Supabase │     │  Google  ││
│  │            │      │       UI       │      │                │      │  Auth    │     │  OAuth   ││
│  └─────┬──────┘      └───────┬────────┘      └───────┬────────┘      └────┬────┘     └────┬─────┘│
│        │                     │                       │                     │               │     │
│        │ Navigate to page    │                       │                     │               │     │
│        │ ───────────────────►│                       │                     │               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │                     │               │     │
│        │ Click "Sign in with │                       │                     │               │     │
│        │ Google" button      │                       │                     │               │     │
│        │ ───────────────────►│                       │                     │               │     │
│        │                     │                       │                     │               │     │
│        │                     │ signInWithGoogle()    │                     │               │     │
│        │                     │ ──────────────────────►                     │               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │ signInWithOAuth()   │               │     │
│        │                     │                       │ ────────────────────►               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │                     │ Redirect to   │     │
│        │                     │                       │                     │ Google Auth   │     │
│        │                     │                       │                     │ ──────────────────► │
│        │                     │                       │                     │               │     │
│        │ Google login prompt │                       │                     │               │     │
│        │ ◄─────────────────────────────────────────────────────────────────────────────────     │
│        │                     │                       │                     │               │     │
│        │ Enter Google        │                       │                     │               │     │
│        │ credentials         │                       │                     │               │     │
│        │ ──────────────────────────────────────────────────────────────────────────────────────► │
│        │                     │                       │                     │               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │                     │ OAuth Token   │     │
│        │                     │                       │                     │ ◄─────────────────  │
│        │                     │                       │                     │               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │                     │ Process OAuth │     │
│        │                     │                       │                     │ token         │     │
│        │                     │                       │                     │───────────────│     │
│        │                     │                       │                     │               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │ JWT Token           │               │     │
│        │                     │                       │ ◄────────────────────               │     │
│        │                     │                       │                     │               │     │
│        │                     │ Redirect with token   │                     │               │     │
│        │ Redirect to app     │ ◄──────────────────────                     │               │     │
│        │ ◄───────────────────┘                       │                     │               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │ Get user profile    │               │     │
│        │                     │                       │ ────────────────────►               │     │
│        │                     │                       │                     │               │     │
│        │                     │                       │ Profile data        │               │     │
│        │                     │                       │ ◄────────────────────               │     │
│        │                     │                       │                     │               │     │
│        │ Show dashboard      │                       │                     │               │     │
│        │ ◄─────────────────────────────────────────────────────────────────               │     │
│        │                     │                       │                     │               │     │
│  ┌─────┴──────┐      ┌───────┴────────┐      ┌───────┴────────┐      ┌─────┴───┐     ┌────┴─────┐│
│  │            │      │                │      │                │      │         │     │          ││
│  │    User    │      │   Login/Signup │      │  Auth Component│      │ Supabase │     │  Google  ││
│  │            │      │       UI       │      │                │      │  Auth    │     │  OAuth   ││
│  └────────────┘      └────────────────┘      └────────────────┘      └─────────┘     └──────────┘│
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Email Verification Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Email Verification Flow                                        │
│                                                                                                  │
│  ┌────────────┐         ┌────────────────┐         ┌────────────────┐         ┌────────────────┐ │
│  │            │         │                │         │                │         │                │ │
│  │    User    │         │    Email       │         │  Auth Component│         │    Supabase    │ │
│  │            │         │    Client      │         │                │         │     Auth       │ │
│  └─────┬──────┘         └───────┬────────┘         └───────┬────────┘         └───────┬────────┘ │
│        │                        │                          │                          │          │
│        │                        │                          │                          │          │
│        │                        │                          │ Send verification        │          │
│        │                        │                          │ email                    │          │
│        │                        │                          │ ─────────────────────────►          │
│        │                        │                          │                          │          │
│        │                        │                          │                          │          │
│        │                        │         Email with       │                          │          │
│        │                        │         verification link│                          │          │
│        │                        │ ◄─────────────────────────────────────────────────────────────  │
│        │                        │                          │                          │          │
│        │                        │                          │                          │          │
│        │  Open email            │                          │                          │          │
│        │ ─────────────────────► │                          │                          │          │
│        │                        │                          │                          │          │
│        │                        │                          │                          │          │
│        │  Click verification    │                          │                          │          │
│        │  link                  │                          │                          │          │
│        │ ─────────────────────► │                          │                          │          │
│        │                        │                          │                          │          │
│        │                        │ Open verification URL    │                          │          │
│        │                        │ ────────────────────────────────────────────────────►          │
│        │                        │                          │                          │          │
│        │                        │                          │                          │          │
│        │                        │                          │ Verify user account      │          │
│        │                        │                          │ ◄─────────────────────────          │
│        │                        │                          │                          │          │
│        │                        │                          │                          │          │
│        │  Redirect to           │                          │                          │          │
│        │  verification success  │                          │                          │          │
│        │ ◄─────────────────────────────────────────────────                          │          │
│        │                        │                          │                          │          │
│  ┌─────┴──────┐         ┌───────┴────────┐         ┌───────┴────────┐         ┌───────┴────────┐ │
│  │            │         │                │         │                │         │                │ │
│  │    User    │         │    Email       │         │  Auth Component│         │    Supabase    │ │
│  │            │         │    Client      │         │                │         │     Auth       │ │
│  └────────────┘         └────────────────┘         └────────────────┘         └────────────────┘ │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Password Reset Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Password Reset Flow                                           │
│                                                                                                  │
│  ┌────────────┐         ┌────────────────┐         ┌────────────────┐         ┌────────────────┐ │
│  │            │         │                │         │                │         │                │ │
│  │    User    │         │  Reset Password│         │  Auth Component│         │    Supabase    │ │
│  │            │         │       UI       │         │                │         │     Auth       │ │
│  └─────┬──────┘         └───────┬────────┘         └───────┬────────┘         └───────┬────────┘ │
│        │                        │                          │                          │          │
│        │  Navigate to           │                          │                          │          │
│        │  forgot password       │                          │                          │          │
│        │ ─────────────────────► │                          │                          │          │
│        │                        │                          │                          │          │
│        │  Enter email           │                          │                          │          │
│        │ ─────────────────────► │                          │                          │          │
│        │                        │                          │                          │          │
│        │                        │  resetPassword(email)    │                          │          │
│        │                        │ ─────────────────────────►                          │          │
│        │                        │                          │                          │          │
│        │                        │                          │  Send reset email        │          │
│        │                        │                          │ ─────────────────────────►          │
│        │                        │                          │                          │          │
│        │                        │                          │                          │          │
│        │  Receive reset         │                          │  Email with reset link   │          │
│        │  email                 │                          │ ◄─────────────────────────          │
│        │ ◄─────────────────────────────────────────────────                          │          │
│        │                        │                          │                          │          │
│        │  Click reset link      │                          │                          │          │
│        │ ─────────────────────────────────────────────────────────────────────────────►          │
│        │                        │                          │                          │          │
│        │  Redirect to reset     │                          │                          │          │
│        │  password page         │                          │                          │          │
│        │ ◄─────────────────────┘                          │                          │          │
│        │                        │                          │                          │          │
│        │  Enter new password    │                          │                          │          │
│        │ ─────────────────────► │                          │                          │          │
│        │                        │                          │                          │          │
│        │                        │  updatePassword(token,   │                          │          │
│        │                        │  new_password)           │                          │          │
│        │                        │ ─────────────────────────►                          │          │
│        │                        │                          │                          │          │
│        │                        │                          │  Update password         │          │
│        │                        │                          │ ─────────────────────────►          │
│        │                        │                          │                          │          │
│        │                        │                          │  Password updated        │          │
│        │                        │                          │ ◄─────────────────────────          │
│        │                        │                          │                          │          │
│        │  Success message       │                          │                          │          │
│        │  and redirect to login │                          │                          │          │
│        │ ◄─────────────────────────────────────────────────                          │          │
│        │                        │                          │                          │          │
│  ┌─────┴──────┐         ┌───────┴────────┐         ┌───────┴────────┐         ┌───────┴────────┐ │
│  │            │         │                │         │                │         │                │ │
│  │    User    │         │  Reset Password│         │  Auth Component│         │    Supabase    │ │
│  │            │         │       UI       │         │                │         │     Auth       │ │
│  └────────────┘         └────────────────┘         └────────────────┘         └────────────────┘ │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Implementation in ConnectSphere

### Email/Password Authentication

Key code from `js/auth.js`:

```javascript
// Sign up with email/password
const signUp = async (email, password) => {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Redirect to verification pending page
    window.location.href = "/verification-pending.html";
    return { success: true, data };
  } catch (error) {
    console.error("Error signing up:", error);
    return { success: false, error };
  }
};

// Sign in with email/password
const signIn = async (email, password) => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) throw profileError;
    
    // Redirect to dashboard
    window.location.href = "/index.html";
    return { success: true, data, profile };
  } catch (error) {
    console.error("Error signing in:", error);
    return { success: false, error };
  }
};
```

### Google OAuth Authentication

Key code from `js/supabaseClient.js`:

```javascript
// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/verification-success.html`
      }
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { success: false, error };
  }
};

// Handle OAuth callback
const handleOAuthCallback = async () => {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (error) throw error;
    
    if (data.session) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it from Google account data
        const { user } = data.session;
        
        const newProfile = {
          id: user.id,
          first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          username: user.email.split('@')[0] + Math.floor(Math.random() * 1000),
          created_at: new Date(),
          updated_at: new Date()
        };
        
        const { error: insertError } = await supabaseClient
          .from('profiles')
          .insert([newProfile]);
        
        if (insertError) throw insertError;
      }
      
      return { success: true, session: data.session };
    }
    
    return { success: false, error: new Error('No session found') };
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return { success: false, error };
  }
};
```

## Security Considerations

1. **JWT Tokens**: ConnectSphere uses JWT tokens for authentication, which are stored securely in browser storage
2. **Token Expiration**: Tokens expire after a set period, requiring re-authentication
3. **HTTPS**: All authentication requests are sent over HTTPS to prevent interception
4. **Password Policy**: Strong password requirements are enforced (minimum length, complexity)
5. **Rate Limiting**: Authentication attempts are rate-limited to prevent brute force attacks
6. **Email Verification**: Email verification is required to prevent account abuse

## Session Management

1. **Session Storage**: Sessions are stored in browser storage (localStorage or sessionStorage)
2. **Session Validation**: Every authenticated request includes the session token for validation
3. **Session Expiry**: Sessions expire after inactivity, requiring re-authentication
4. **Logout**: Explicit logout invalidates the session token

## How This Architecture Addresses Design Constraints

1. **Authentication Constraint**: The authentication flows ensure only authenticated users can access protected resources.

2. **Authorization Constraint**: Authentication includes user role information that drives authorization decisions.

3. **UI Modification Constraint**: The authentication flow is independent of UI, allowing UI changes without affecting the authentication process.

4. **Centralized Data Constraint**: Supabase serves as the central authentication provider for all authentication types.

5. **Modifiability Constraint**: The modular authentication architecture allows for easy addition of new authentication methods (like Apple Sign-In) in the future.
