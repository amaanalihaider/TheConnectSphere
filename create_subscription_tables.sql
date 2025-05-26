-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    interval TEXT NOT NULL, -- 'monthly', 'yearly', etc.
    max_connections INTEGER NOT NULL,
    daily_ai_prompts INTEGER NOT NULL,
    chat_cooldown_hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id INTEGER REFERENCES subscription_plans(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    last_billing_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- Each user can only have one active subscription
);

-- Create AI prompt usage tracking table
CREATE TABLE ai_prompt_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user connections table to track connections between users
CREATE TABLE user_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, connected_user_id) -- Prevent duplicate connections
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, interval, max_connections, daily_ai_prompts, chat_cooldown_hours)
VALUES 
    ('Free', 'Basic features with limited connections', 0.00, 'unlimited', 1, 3, 24),
    ('Basic', 'More connections and AI chat features', 9.99, 'monthly', 5, 10, 12),
    ('Premium', 'Unlimited connections and AI features', 19.99, 'monthly', 999999, 999999, 0);

-- Create a function to assign free plan to new users
CREATE FUNCTION public.assign_free_plan_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id INTEGER;
BEGIN
    -- Get the ID of the free plan
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free';
    
    -- Insert a new subscription record for the user with the free plan
    INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
    VALUES (NEW.id, free_plan_id, 'active', CURRENT_TIMESTAMP, NULL);
    
    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Create trigger to automatically assign free plan to new users
CREATE TRIGGER assign_free_plan_after_user_creation
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.assign_free_plan_to_new_user();

-- Create function to check if a user can create a new connection
CREATE FUNCTION public.can_create_new_connection(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_connection_count INTEGER;
    max_allowed_connections INTEGER;
BEGIN
    -- Count current connections
    SELECT COUNT(*) INTO current_connection_count 
    FROM user_connections 
    WHERE user_id = user_uuid AND status = 'accepted';
    
    -- Get max allowed connections from user's subscription
    SELECT sp.max_connections INTO max_allowed_connections
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = user_uuid AND s.status = 'active';
    
    -- Return true if user can create more connections
    RETURN current_connection_count < max_allowed_connections;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Create function to check if a user can send an AI prompt
CREATE FUNCTION public.can_send_ai_prompt(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    prompts_today INTEGER;
    max_daily_prompts INTEGER;
BEGIN
    -- Count prompts used today
    SELECT COUNT(*) INTO prompts_today 
    FROM ai_prompt_usage 
    WHERE user_id = user_uuid 
    AND DATE(created_at) = CURRENT_DATE;
    
    -- Get max allowed prompts from user's subscription
    SELECT sp.daily_ai_prompts INTO max_daily_prompts
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = user_uuid AND s.status = 'active';
    
    -- Return true if user can send more prompts
    RETURN prompts_today < max_daily_prompts;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Create function to check if a user can start a new chat (cooldown period)
CREATE FUNCTION public.can_start_new_chat(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    last_chat_time TIMESTAMP;
    cooldown_hours INTEGER;
BEGIN
    -- Get user's last chat time
    SELECT MAX(created_at) INTO last_chat_time 
    FROM ai_prompt_usage 
    WHERE user_id = user_uuid;
    
    -- Get cooldown period from user's subscription
    SELECT sp.chat_cooldown_hours INTO cooldown_hours
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = user_uuid AND s.status = 'active';
    
    -- If no previous chat or cooldown is 0, allow chat
    IF last_chat_time IS NULL OR cooldown_hours = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Check if cooldown period has passed
    RETURN (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_chat_time))/3600) > cooldown_hours;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;
