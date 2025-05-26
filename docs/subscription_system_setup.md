# ConnectSphere Subscription System Setup

This document provides instructions for setting up the subscription management system in Supabase for ConnectSphere.

## Database Schema

The subscription system uses the following tables:

1. **subscription_plans**: Stores different subscription tiers and their features
2. **subscriptions**: Tracks user subscriptions and their status
3. **ai_prompt_usage**: Tracks AI Advisor usage for enforcing daily limits
4. **user_connections**: Tracks connections between users for enforcing connection limits

## Setup Instructions

### 1. Create Database Tables

Run the SQL commands in the `create_subscription_tables.sql` file in the Supabase SQL Editor. This will:

- Create all necessary tables
- Insert default subscription plans (Free, Basic, Premium)
- Create functions to enforce subscription limits
- Set up triggers to automatically assign the Free plan to new users

### 2. Enable Row Level Security (RLS)

For production, you should enable Row Level Security on these tables with appropriate policies:

```sql
-- Example RLS policy for subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own subscription
CREATE POLICY "Users can view their own subscription" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update only their own subscription
CREATE POLICY "Users can update their own subscription" 
ON subscriptions FOR UPDATE 
USING (auth.uid() = user_id);
```

### 3. Test the System

After setting up the database:

1. Register a new user - they should automatically get the Free plan
2. Try to create connections - it should enforce the limit of 1 connection for Free users
3. Use the AI Advisor - it should enforce the limit of 3 prompts per day for Free users
4. Upgrade to a paid plan - limits should increase accordingly

## Subscription Features

### Free Plan
- Connect with 1 person
- 3 AI advisor prompts per day
- 24-hour chat cooldown

### Basic Plan ($9.99/month)
- Connect with up to 5 people
- 10 AI advisor prompts per day
- 12-hour chat cooldown

### Premium Plan ($19.99/month)
- Unlimited connections
- Unlimited AI advisor usage
- No chat cooldown

## Implementation Notes

- The subscription system uses client-side validation via the `subscription-validator.js` module
- For production, implement server-side validation using Supabase Edge Functions
- Consider implementing a real payment gateway (Stripe, PayPal, etc.) for production

## Troubleshooting

If users are not automatically assigned the Free plan:
1. Check if the trigger is properly created
2. Manually insert a subscription record for existing users

If subscription limits are not enforced:
1. Check browser console for errors
2. Verify that the subscription-validator.js is properly loaded
3. Check Supabase database queries for errors
