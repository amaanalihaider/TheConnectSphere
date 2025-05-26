# Resend Email Webhook Setup Guide for ConnectSphere

This document provides a step-by-step guide for setting up the Resend email service integration with Supabase Edge Functions for ConnectSphere. This allows automated email notifications to be sent when users submit forms or complete specific actions in the application.

## 1. Supabase Edge Functions Setup

### Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Initialize Supabase Project Locally

```bash
# Navigate to project directory
cd /Users/syedamaanalihaider/Desktop/Database\ Project/ConnectSphere

# Initialize Supabase project
supabase init
```

### Create Edge Function for Email Notifications

```bash
# Create a new edge function
supabase functions new contact-notification
```

## 2. Create Email Template Function

### Create the Email Handler Function

Create a file named `index.ts` inside the `supabase/functions/contact-notification` directory with the following content:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@1.0.0'

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const resend = new Resend(resendApiKey)

serve(async (req) => {
  try {
    // Get form submission data from webhook
    const { record } = await req.json()
    
    // Extract form data
    const { name, email, message } = record
    
    // Send email notification
    const data = await resend.emails.send({
      from: 'ConnectSphere <noreply@connectsphere.com>',
      to: 'admin@connectsphere.com',
      subject: 'New Contact Form Submission',
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    })
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

## 3. Setup Secrets for Edge Function

### Add Resend API Key to Supabase Secrets

```bash
# Set the API key as a secret (replace with your actual API key)
supabase secrets set RESEND_API_KEY=re_123456789
```

## 4. Docker Configuration and Local Testing

### Start Docker

Ensure Docker Desktop is running on your machine:

```bash
# Check if Docker is running
docker ps

# If Docker is not running, start Docker Desktop app
open -a Docker
```

### Start Local Supabase

```bash
# Start local Supabase instance
supabase start
```

### Serve Edge Function Locally

```bash
# Serve the edge function locally for testing
supabase functions serve contact-notification --no-verify-jwt
```

## 5. Test the Webhook Locally

### Create a Test Script

Create a file named `test-webhook.js` to test the webhook locally:

```javascript
const fetch = require('node-fetch');

async function testWebhook() {
  try {
    const response = await fetch('http://localhost:54321/functions/v1/contact-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_LOCAL_ANON_KEY'
      },
      body: JSON.stringify({
        record: {
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message from the local environment.'
        }
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testWebhook();
```

### Run the Test Script

```bash
node test-webhook.js
```

## 6. Deploy to Production

### Deploy the Edge Function

```bash
# Deploy the edge function to Supabase
supabase functions deploy contact-notification --project-ref jucwtfexhavfkhhfpcdv
```

### Update Secrets in Production

```bash
# Set the API key in production (replace with your actual API key)
supabase secrets set RESEND_API_KEY=re_123456789 --project-ref jucwtfexhavfkhhfpcdv
```

## 7. Set Up Supabase Database Webhook

1. Go to Supabase Dashboard > Database > Webhooks
2. Create a new webhook with the following settings:
   - Name: `contact_form_notification`
   - Table: `contact_submissions`
   - Events: Check only `INSERT`
   - HTTP Method: `POST`
   - URL: `https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/contact-notification`
   - Add Header: `Authorization: Bearer [SERVICE_ROLE_KEY]`

## 8. Verify Production Setup

### Test Production Webhook

Create a file named `test-prod-webhook.js` to test the production webhook:

```javascript
const fetch = require('node-fetch');

async function testProdWebhook() {
  try {
    const response = await fetch('https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/contact-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
      },
      body: JSON.stringify({
        record: {
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message from production.'
        }
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testProdWebhook();
```

### Run the Production Test Script

```bash
node test-prod-webhook.js
```

## 9. Monitoring and Debugging

### View Edge Function Logs

```bash
# View logs for local development
supabase functions logs contact-notification --local

# View logs for production
supabase functions logs contact-notification --project-ref jucwtfexhavfkhhfpcdv
```

### Troubleshooting Common Issues

1. **CORS Issues**:
   - Add appropriate CORS headers to the response in your Edge Function

2. **Authentication Errors**:
   - Ensure the correct JWT token is being used for authentication
   - Verify the service role key is correctly set in the webhook headers

3. **Docker Issues**:
   - Restart Docker: `docker restart`
   - Reset Docker (if needed): `docker system prune -a`

4. **Supabase CLI Issues**:
   - Update Supabase CLI: `npm update -g supabase`
   - Reconnect to Supabase: `supabase login`

## 10. Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Resend API Documentation](https://resend.com/docs/api-reference/introduction)
- [Deno Runtime Documentation](https://deno.land/manual)

---

This document was created on May 23, 2025, for the ConnectSphere project.