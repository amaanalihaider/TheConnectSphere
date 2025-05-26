# Setting Up Database Webhooks for Newsletter Subscribers

Instead of using a SQL trigger, we'll use Supabase's built-in Database Webhooks feature which is more reliable for triggering Edge Functions.

## Steps to Set Up the Webhook:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jucwtfexhavfkhhfpcdv

2. Navigate to **Database** → **Webhooks** section in the left sidebar

3. Click on **Create a new Webhook**

4. Configure the webhook with these settings:
   - **Name**: `newsletter_subscription_webhook`
   - **Table**: `newsletter_subscribers`
   - **Events**: Select only `INSERT` (when new subscribers are added)
   - **Type**: HTTP Request
   - **HTTP Method**: POST
   - **URL**: `https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/send-welcome-email`
   - **Headers**: Add a header:
     - Key: `Authorization`
     - Value: `Bearer [your-service-role-key]` (You can get this from Project Settings → API)

5. Click **Create Webhook**

This will trigger your `send-welcome-email` Edge Function whenever a new record is inserted into the `newsletter_subscribers` table.

## Testing the Webhook

To test if everything is working correctly:

1. Add a new subscriber to the `newsletter_subscribers` table:
   ```sql
   INSERT INTO newsletter_subscribers (email) 
   VALUES ('test@example.com');
   ```

2. Check your Edge Function logs in the Supabase Dashboard to confirm the function was triggered.

3. Verify the welcome email was sent to the test email address.

## Additional Notes

- Make sure your `newsletter_subscribers` table exists. If not, run the SQL from `newsletter_table.sql` file.
- Ensure the `send-welcome-email` Edge Function is deployed (which we've already done).
- The `RESEND_API_KEY` secret is set for the function (which we've already done).

This approach is more reliable than database triggers for connecting to external services and avoids potential syntax issues across different PostgreSQL versions.
