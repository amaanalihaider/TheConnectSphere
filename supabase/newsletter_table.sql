-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    last_email_sent TIMESTAMP WITH TIME ZONE
);

-- Create index on email
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON public.newsletter_subscribers (email);

-- Add row level security policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for insert
CREATE POLICY "Anyone can subscribe" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Create policy for updating own subscription
CREATE POLICY "Users can manage their subscriptions" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (true);

-- Create policy for reading own subscription
CREATE POLICY "Allow reading own subscription" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (true);
