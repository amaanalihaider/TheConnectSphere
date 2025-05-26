# ConnectSphere Email Integration Progress

## Current Status (May 24, 2025)

We've been working on integrating email functionality for the newsletter subscription system in ConnectSphere. Here's the current status:

### What We've Done

1. **Initial Implementation with Resend**
   - Initially set up with Resend API
   - Limited to sending emails only to verified addresses due to Resend's free tier limitations

2. **Migration to Gmail SMTP**
   - Replaced Resend with Gmail SMTP using Nodemailer
   - Set up Gmail credentials as Supabase secrets:
     - `GMAIL_USER=zain33717@gmail.com`
     - `GMAIL_APP_PASSWORD` (App-specific password)
   - Deployed the Edge Function with Gmail SMTP
   - Emails not being received, potentially due to Gmail's security restrictions

3. **Attempted Migration to SendGrid**
   - Started implementing SendGrid as an alternative email provider
   - More reliable for server-side email sending
   - Edge Function code updated to use SendGrid
   - Requires a SendGrid API key to be configured

### Edge Function Status

The Edge Function (`send-welcome-email`) has been deployed and can successfully:
- Process incoming requests
- Update the database record (`last_email_sent` timestamp)
- Attempt to send emails

### Current Issues

1. **Email Delivery**: Emails are not being received by recipients
2. **Gmail SMTP**: Possibly blocked by Gmail's security features
3. **SendGrid Integration**: Partially implemented but requires API key and sender verification

## Next Steps

### Option 1: Complete SendGrid Integration
1. Create a SendGrid account
2. Verify sender email (zain33717@gmail.com)
3. Generate a SendGrid API key
4. Set the API key as a Supabase secret: `supabase secrets set SENDGRID_API_KEY=your_api_key`
5. Redeploy the Edge Function

### Option 2: Fix Gmail SMTP Issues
1. Check Gmail account settings
   - Make sure "Less secure app access" is enabled (if available)
   - Verify that the App Password is correctly generated
2. Check for any security alerts in the Gmail account
3. Test with a different Gmail account

### Option 3: Use Mailjet or Another Email Service
1. Sign up for Mailjet (or another transactional email service)
2. Update the Edge Function to use their API/SDK
3. Configure authentication credentials as Supabase secrets

## Database Schema

The newsletter subscription system uses the `newsletter_subscribers` table with the following structure:

```sql
id: UUID (primary key)
email: TEXT (unique)
is_confirmed: BOOLEAN
confirmation_token: TEXT
created_at: TIMESTAMP
confirmed_at: TIMESTAMP
last_email_sent: TIMESTAMP
```

## Webhook Configuration

For the email functionality to be triggered automatically on new subscriptions, a database webhook should be configured to:

1. Listen for INSERT events on the `newsletter_subscribers` table
2. Send a POST request to the `send-welcome-email` Edge Function
3. Include the new record data in the payload

## Edge Function Code (SendGrid Version)

Current implementation for reference:

```typescript
// Edge function to send welcome emails to new newsletter subscribers
// This function is triggered by a database webhook when a new subscriber is added

// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
// Import SendGrid for email sending
import sgMail from 'https://esm.sh/@sendgrid/mail@7.7.0'

// Define your Supabase URL and service role key from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jucwtfexhavfkhhfpcdv.supabase.co'
// Always try to use the environment variable first for security
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5MzQzOCwiZXhwIjoyMDYzNDY5NDM4fQ.YfTd6eOomJLUOz7ur-zF1MF_HX9_b1mormupzE4YQ1g'

// Get SendGrid API key from environment variables
const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY') || ''

// Set SendGrid API key
sgMail.setApiKey(sendgridApiKey)

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseKey)

// Send email using SendGrid
async function sendEmail(to, subject, body) {
  console.log(`Sending email to ${to} with subject: ${subject}`)
  
  try {
    console.log('Attempting to send email using SendGrid')
    
    // Create email message
    const msg = {
      to: to,
      from: 'zain33717@gmail.com', // Use a verified sender in SendGrid
      subject: subject,
      html: body,
      text: 'Welcome to ConnectSphere! Thank you for subscribing to our newsletter.'
    }
    
    // Send mail
    const response = await sgMail.send(msg)
    
    console.log('Email sent successfully with SendGrid')
    return true
  } catch (err) {
    console.error('Exception when sending email with SendGrid:', JSON.stringify(err))
    return false
  }
}
```

## Testing

To manually test the Edge Function:

```bash
curl -X POST https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/send-welcome-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -d '{"new": {"email": "recipient@example.com"}}'
```

Replace `[SERVICE_ROLE_KEY]` with your Supabase service role key.
