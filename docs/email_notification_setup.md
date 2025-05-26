# Setting Up Email Notifications for Contact Form Submissions

This guide explains how to set up automatic email notifications whenever someone submits a contact form on The ConnectSphere website.

## Overview

When a user submits the contact form:
1. The submission is stored in the Supabase `contact_submissions` table
2. A Database Webhook triggers the `contact-notification` Edge Function
3. The function sends an email to your address using Resend

## Step 1: Deploy the Edge Function

1. Open your terminal and navigate to the project directory
2. Run the following commands to deploy the Edge Function:

```bash
cd /Users/syedamaanalihaider/Desktop/Database\ Project/ConnectSphere
supabase functions deploy contact-notification
```

## Step 2: Set Up the Database Webhook

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Navigate to your project: `jucwtfexhavfkhhfpcdv`
3. Go to Database → Webhooks
4. Click "Create a new webhook"
5. Configure the webhook with these settings:
   - **Name**: ContactFormNotification
   - **Table**: contact_submissions
   - **Events**: INSERT (check only this box)
   - **Type**: HTTP Request
   - **HTTP Method**: POST
   - **URL**: https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/contact-notification
   - **Headers**: Add a header with key `Authorization` and value `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5MzQzOCwiZXhwIjoyMDYzNDY5NDM4fQ.YfTd6eOomJLUOz7ur-zF1MF_HX9_b1mormupzE4YQ1g`
     (You can find your service role key in Project Settings → API)
6. Click "Create webhook"

## Testing the Setup

To test if the email notifications are working:
1. Go to your website and submit a test message through the contact form
2. Check your email (zain33717@gmail.com) for the notification
3. Verify the submission was stored in the `contact_submissions` table

## Troubleshooting

If you don't receive email notifications:

1. Check the Edge Function logs in Supabase:
   - Go to Edge Functions in your Supabase dashboard
   - Click on the `contact-notification` function
   - View the logs to see if there are any errors

2. Verify the webhook is firing:
   - Go to Database → Webhooks
   - Check the status and recent invocations of your webhook

3. Test the Resend API directly:
   - Use the Resend dashboard to send a test email
   - Ensure your API key is valid and has not expired

## Notes

- The email is sent from `onboarding@resend.dev` - for production use, you should verify your own domain in Resend
- The webhook requires a service role key which has higher privileges than the anon key - keep this secure
- Consider adding rate limiting if your contact form gets high traffic
