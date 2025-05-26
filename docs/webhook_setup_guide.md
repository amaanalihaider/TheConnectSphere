# Supabase Webhook Setup Guide for ConnectSphere

This guide provides detailed instructions for setting up the webhook in Supabase to trigger the Edge Function when new contact form submissions are added.

## Step 1: Access Database Webhooks

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard/project/jucwtfexhavfkhhfpcdv/database/hooks)
2. Navigate to **Database** > **Webhooks** in the left sidebar

## Step 2: Create a New Webhook

Click on "Create a new webhook" and configure it with the following settings:

### Basic Configuration
- **Name**: `contact_form_notification`
- **Table**: `contact_submissions`
- **Events**: Check only `INSERT` (we only want to trigger on new submissions)

### HTTP Request Configuration
- **HTTP Method**: `POST`
- **URL**: `https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/contact-notification`

### Headers
Add the following header to authorize the webhook to call the Edge Function:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5MzQzOCwiZXhwIjoyMDYzNDY5NDM4fQ.YfTd6eOomJLUOz7ur-zF1MF_HX9_b1mormupzE4YQ1g
```

> **Important**: This is the service role key which has elevated permissions. It's necessary fIor the webhook to be able to invoke the Edge Function.

## Step 3: Configure Payload Format

Ensure the payload format is set to include the full record:

- **Payload Type**: `Full Record`
- **Include Old Record**: No (not needed for new submissions)

## Step 4: Test the Webhook

After creating the webhook, you can test it by:

1. Submitting a new contact form on the website
2. Checking the Edge Function logs in the Supabase dashboard
3. Verifying that you receive an email notification

## Troubleshooting

If the webhook is not triggering:

1. **Check Webhook Status**: In the Supabase dashboard, look at the webhook's status to see if it's active
2. **Verify Table Name**: Make sure the webhook is listening to the correct table (`contact_submissions`)
3. **Check Authorization**: The webhook must have the correct authorization header to call the Edge Function
4. **Test Manually**: Use the `test-webhook.js` script to test the Edge Function directly

## Common Issues

1. **Missing Authorization Header**: The webhook needs the service role key to call the Edge Function
2. **Incorrect URL**: The URL must point to your specific project's Edge Function
3. **Webhook Not Active**: Webhooks can be disabled - make sure it's enabled
4. **Table Schema Changes**: If the table schema changes, you may need to recreate the webhook
