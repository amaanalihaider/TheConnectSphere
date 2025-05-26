# Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the ConnectSphere application. It covers all necessary steps from setting up the development environment to deploying to a production server.

## Development Environment Setup

### Prerequisites

To set up a development environment for ConnectSphere, you need:

1. **Web Server**: A local web server such as Live Server VS Code extension
2. **Supabase Account**: For authentication and database services
3. **Gemini API Key**: For the AI chat advisor functionality
4. **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
5. **Text Editor**: VS Code recommended

### Steps to Set Up Development Environment

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd ConnectSphere
   ```

2. **Configure Supabase**

   a. Create a new Supabase project at [supabase.com](https://supabase.com)
   
   b. Set up the database schema:
   
   ```sql
   -- Create profiles table
   CREATE TABLE public.profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     first_name TEXT,
     last_name TEXT,
     username TEXT UNIQUE,
     birthdate DATE,
     gender TEXT,
     city TEXT,
     bio TEXT,
     interests TEXT[],
     relationship_types TEXT[],
     gender_preferences TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
   );

   -- Create subscriptions table
   CREATE TABLE public.subscriptions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     plan_id TEXT NOT NULL,
     status TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
     expires_at TIMESTAMP WITH TIME ZONE
   );

   -- Create conversations table
   CREATE TABLE public.conversations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user1_id UUID REFERENCES auth.users(id),
     user2_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
     UNIQUE(user1_id, user2_id)
   );

   -- Create messages table
   CREATE TABLE public.messages (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     conversation_id UUID REFERENCES public.conversations(id),
     sender_id UUID REFERENCES auth.users(id),
     content TEXT NOT NULL,
     status TEXT DEFAULT 'sent',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
   );
   ```

   c. Configure authentication settings:
   - Enable Email/Password sign-in
   - Enable Google OAuth
   - Set up email templates for verification

   d. Set redirect URLs in authentication settings:
   - Add `http://localhost:5500/verification-success.html` for local development

3. **Update Supabase Configuration**

   Update the Supabase client configuration in `/js/supabaseClient.js`:

   ```javascript
   const supabaseUrl = 'https://your-project-url.supabase.co';
   const supabaseKey = 'your-anon-key';
   
   const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
   ```

4. **Configure Gemini API**

   Update the API key in `/js/chatbot.js`:

   ```javascript
   const API_KEY = 'your-gemini-api-key';
   ```

5. **Start the Development Server**

   Using VS Code with Live Server:
   - Install the Live Server extension
   - Right-click on `index.html` and select "Open with Live Server"
   - Ensure the server runs on port 5500 to match the Supabase redirect URLs

## Local Testing

### Testing Authentication

1. **Test User Registration**
   - Navigate to the signup page
   - Create a test account
   - Verify that verification email is sent
   - Click the verification link
   - Confirm redirection to the verification success page

2. **Test Google OAuth**
   - Click the "Sign in with Google" button
   - Complete the Google authentication flow
   - Verify redirection to the application

3. **Test Profile Creation**
   - Fill out profile information
   - Save the profile
   - Verify data is stored in the Supabase profiles table

### Testing Real-time Messaging

1. **Run the Messaging Test Implementation**
   - Navigate to `/tests/msg-test/index.html`
   - Follow the test instructions in the UI
   - Verify real-time updates when messages are sent

2. **Test in Main Application**
   - Connect with another user
   - Send messages
   - Verify messages appear in real-time

### Testing Voice Input

1. **Run the Voice Input Test**
   - Navigate to `/tests/voice-input-test/index.html`
   - Test microphone functionality
   - Verify speech is converted to text

### Testing AI Chat Advisor

1. **Test Basic Functionality**
   - Navigate to the Chat Advisor page
   - Ask relationship questions
   - Verify responses from the Gemini API

2. **Test Error Handling**
   - Test with an invalid API key
   - Verify appropriate error messages are displayed

## Production Deployment

### Deployment Options

ConnectSphere can be deployed using several hosting options:

1. **Static Hosting Services**
   - Netlify
   - Vercel
   - GitHub Pages

2. **Traditional Web Hosting**
   - Any host that supports static files

### Deployment Steps

#### Option 1: Netlify Deployment

1. **Prepare the Application**

   a. Update the Supabase configuration for production:
   
   ```javascript
   const supabaseUrl = 'https://your-production-project.supabase.co';
   const supabaseKey = 'your-production-anon-key';
   ```
   
   b. Update Supabase redirect URLs to include your production domain:
   - Add `https://your-production-domain.com/verification-success.html`

2. **Deploy to Netlify**

   a. Sign up for a Netlify account
   
   b. From the Netlify dashboard, click "New site from Git"
   
   c. Connect to your repository
   
   d. Configure build settings (not needed for static site)
   
   e. Deploy the site
   
   f. Set up a custom domain (optional)

3. **Post-Deployment Configuration**

   a. Configure environment variables in Netlify for API keys (if used)
   
   b. Set up redirects for SPA routing if needed

#### Option 2: Manual Deployment

1. **Prepare the Application**

   a. Update the Supabase configuration for production
   
   b. Update API endpoints to production URLs

2. **Upload Files**

   a. Use FTP or SSH to upload files to your web server
   
   b. Ensure proper file permissions
   
   c. Configure the web server (Apache/Nginx) if needed

3. **Set Up HTTPS**

   a. Obtain an SSL certificate (Let's Encrypt recommended)
   
   b. Configure the web server to use HTTPS

### Production Security Considerations

1. **Enable RLS Policies**

   Implement Row Level Security in Supabase:

   ```sql
   -- Example: Users can only see their own profiles
   CREATE POLICY "Users can only see their own profiles"
   ON profiles
   FOR SELECT
   USING (auth.uid() = id);

   -- Example: Users can only update their own profiles
   CREATE POLICY "Users can only update their own profiles"
   ON profiles
   FOR UPDATE
   USING (auth.uid() = id);

   -- Example: Users can only see conversations they are part of
   CREATE POLICY "Users can only see their own conversations"
   ON conversations
   FOR SELECT
   USING (auth.uid() = user1_id OR auth.uid() = user2_id);

   -- Example: Users can only see messages in their conversations
   CREATE POLICY "Users can only see messages in their conversations"
   ON messages
   FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM conversations
       WHERE 
         conversations.id = messages.conversation_id AND
         (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
     )
   );
   ```

2. **Secure API Keys**

   For a production environment, never expose API keys in client-side code:
   
   a. Create a proxy server to handle API calls to Gemini
   
   b. Store API keys as environment variables on the server
   
   c. Make client requests to your proxy instead of directly to Gemini

3. **Implement Rate Limiting**

   Add rate limiting to prevent abuse:
   
   ```javascript
   // Example rate limiting implementation
   const rateLimitMap = new Map();
   
   function checkRateLimit(userId, limitPerMinute = 30) {
     const now = Date.now();
     const userRequests = rateLimitMap.get(userId) || [];
     
     // Filter out requests older than 1 minute
     const recentRequests = userRequests.filter(time => now - time < 60000);
     
     // Check if user has exceeded the limit
     if (recentRequests.length >= limitPerMinute) {
       return false;
     }
     
     // Add current request time
     recentRequests.push(now);
     rateLimitMap.set(userId, recentRequests);
     
     return true;
   }
   ```

4. **Set Up Monitoring**

   Implement monitoring to detect issues:
   
   - Error logging service (e.g., Sentry)
   - Performance monitoring
   - Usage analytics

## Scaling Considerations

As ConnectSphere grows, consider these scaling strategies:

1. **Database Scaling**
   - Supabase handles scaling automatically
   - Monitor database performance
   - Add indexes for frequently queried fields

2. **Frontend Performance**
   - Implement lazy loading for large components
   - Use a CDN for static assets
   - Optimize images and media

3. **API Usage**
   - Implement caching for API responses
   - Use a queue for processing intensive operations
   - Consider serverless functions for backend logic

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Security Updates**
   - Regularly update dependencies
   - Monitor for security advisories
   - Conduct periodic security audits

2. **Database Maintenance**
   - Backup data regularly
   - Clean up unused records
   - Optimize queries

3. **Content Updates**
   - Update terms of service and privacy policy
   - Refresh content periodically
   - Add new features incrementally

### Update Process

1. **Development**
   - Develop and test new features in development environment
   - Create comprehensive tests

2. **Staging**
   - Deploy to a staging environment
   - Conduct thorough testing
   - Get user feedback if possible

3. **Production Deployment**
   - Schedule updates during low-traffic periods
   - Use blue-green deployment if possible
   - Monitor closely after deployment

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Issues**
   - Verify Supabase configuration
   - Check redirect URLs
   - Review browser console for errors

2. **Real-time Messaging Issues**
   - Verify Supabase subscriptions are working
   - Check network connectivity
   - Review database permissions

3. **API Integration Issues**
   - Verify API keys are correct
   - Check for API rate limiting
   - Review API response status codes

### Support Resources

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Gemini API Documentation: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- Google OAuth Documentation: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)

## Conclusion

This deployment guide provides a comprehensive framework for deploying ConnectSphere from development to production. By following these guidelines, you can ensure a secure, scalable, and maintainable application.
