-- =============================================
-- Supabase Subscription Management Setup Script
-- =============================================
-- This script updates the database schema and functions for the ConnectSphere subscription system
-- It modifies existing tables and creates/updates functions for subscription management

-- =============================================
-- 1. TABLE MODIFICATIONS
-- =============================================

-- Alter subscription_plans table to add subscription limit columns if they don't exist
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS max_connections INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_ai_prompts INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS chat_cooldown_hours INTEGER DEFAULT 24;

-- Alter subscriptions table to ensure timestamp columns use TIMESTAMP WITH TIME ZONE
ALTER TABLE public.subscriptions
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC',
ALTER COLUMN start_date TYPE TIMESTAMP WITH TIME ZONE USING start_date AT TIME ZONE 'UTC',
ALTER COLUMN end_date TYPE TIMESTAMP WITH TIME ZONE USING COALESCE(end_date, CURRENT_TIMESTAMP) AT TIME ZONE 'UTC';

-- Alter ai_prompt_usage table to ensure timestamp columns use TIMESTAMP WITH TIME ZONE
ALTER TABLE public.ai_prompt_usage
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC';

-- Alter user_connections table to ensure timestamp columns use TIMESTAMP WITH TIME ZONE
ALTER TABLE public.user_connections
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC';

-- =============================================
-- 2. SUBSCRIPTION PLAN UPDATES
-- =============================================

-- Update subscription plan limits
UPDATE public.subscription_plans
SET max_connections = 1, daily_ai_prompts = 5, chat_cooldown_hours = 24
WHERE name = 'Free';

UPDATE public.subscription_plans
SET max_connections = 10, daily_ai_prompts = 20, chat_cooldown_hours = 12
WHERE name = 'Basic';

UPDATE public.subscription_plans
SET max_connections = 999999, daily_ai_prompts = 999999, chat_cooldown_hours = 0
WHERE name = 'Premium';

-- =============================================
-- 3. FUNCTION: ASSIGN FREE PLAN TO NEW USERS
-- =============================================

-- Update the function to assign free plan to new users
CREATE OR REPLACE FUNCTION public.assign_free_plan_to_new_user()
RETURNS TRIGGER AS
$$
DECLARE
    free_plan_id INTEGER;
    existing_subscription UUID;
BEGIN
    -- Check if user already has a subscription (should not happen, but just in case)
    SELECT id INTO existing_subscription FROM public.subscriptions WHERE user_id = NEW.id LIMIT 1;
    
    IF existing_subscription IS NOT NULL THEN
        -- User already has a subscription, no need to create a new one
        RETURN NEW;
    END IF;
    
    -- Get the ID of the free plan
    SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'Free' LIMIT 1;
    
    IF free_plan_id IS NULL THEN
        -- If free plan doesn't exist, log error and exit
        RAISE EXCEPTION 'Free plan not found in subscription_plans table';
        RETURN NULL;
    END IF;
    
    -- Insert a new subscription record for the user with the free plan
    INSERT INTO public.subscriptions (
        user_id, 
        plan_id, 
        status, 
        start_date, 
        end_date,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id, 
        free_plan_id,
        'active', 
        CURRENT_TIMESTAMP, 
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE NOTICE 'Error assigning free plan to user %: %', NEW.id, SQLERRM;
    
    -- Still return NEW to allow user creation to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. TRIGGER: AUTO-ASSIGN FREE PLAN
-- =============================================

-- Update trigger to automatically assign free plan to new users
DROP TRIGGER IF EXISTS assign_free_plan_after_user_creation ON auth.users;
CREATE TRIGGER assign_free_plan_after_user_creation
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_free_plan_to_new_user();

-- =============================================
-- 5. FUNCTION: CHECK CONNECTION LIMIT
-- =============================================

-- Update function to check if a user can create a new connection
CREATE OR REPLACE FUNCTION public.can_create_new_connection(user_uuid UUID)
RETURNS BOOLEAN AS
$$
DECLARE
    current_connection_count INTEGER;
    max_allowed_connections INTEGER;
BEGIN
    -- Count current connections
    SELECT COUNT(*) INTO current_connection_count 
    FROM public.user_connections 
    WHERE user_id = user_uuid AND status = 'accepted';
    
    -- Get max allowed connections from user's subscription
    SELECT sp.max_connections INTO max_allowed_connections
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = user_uuid AND s.status = 'active';
    
    -- Log for debugging
    RAISE NOTICE 'User % has % connections out of % allowed', user_uuid, current_connection_count, max_allowed_connections;
    
    -- Return true if user can create more connections
    RETURN current_connection_count < max_allowed_connections;
EXCEPTION WHEN OTHERS THEN
    -- Log error and default to false (no connections allowed) for safety
    RAISE NOTICE 'Error checking connection limit for user %: %', user_uuid, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. FUNCTION: CHECK AI PROMPT LIMIT
-- =============================================

-- Update function to check if a user can send an AI prompt
CREATE OR REPLACE FUNCTION public.can_send_ai_prompt(user_uuid UUID)
RETURNS BOOLEAN AS
$$
DECLARE
    prompts_today INTEGER;
    max_daily_prompts INTEGER;
BEGIN
    -- Count prompts used today
    SELECT COUNT(*) INTO prompts_today 
    FROM public.ai_prompt_usage 
    WHERE user_id = user_uuid 
    AND DATE(created_at) = CURRENT_DATE;
    
    -- Get max allowed prompts from user's subscription
    SELECT sp.daily_ai_prompts INTO max_daily_prompts
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = user_uuid AND s.status = 'active';
    
    -- Log for debugging
    RAISE NOTICE 'User % has used % prompts out of % allowed today', user_uuid, prompts_today, max_daily_prompts;
    
    -- Return true if user can send more prompts
    RETURN prompts_today < max_daily_prompts;
EXCEPTION WHEN OTHERS THEN
    -- Log error and default to false (no prompts allowed) for safety
    RAISE NOTICE 'Error checking prompt limit for user %: %', user_uuid, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. FUNCTION: CHECK CHAT COOLDOWN
-- =============================================

-- Update function to check if a user can start a new chat (cooldown period)
CREATE OR REPLACE FUNCTION public.can_start_new_chat(user_uuid UUID)
RETURNS BOOLEAN AS
$$
DECLARE
    last_chat_time TIMESTAMP WITH TIME ZONE;
    cooldown_hours INTEGER;
    time_since_last_chat NUMERIC;
BEGIN
    -- Get user's last chat time
    SELECT MAX(created_at) INTO last_chat_time 
    FROM public.ai_prompt_usage 
    WHERE user_id = user_uuid;
    
    -- Get cooldown period from user's subscription
    SELECT sp.chat_cooldown_hours INTO cooldown_hours
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = user_uuid AND s.status = 'active';
    
    -- If no previous chat or cooldown is 0, allow chat
    IF last_chat_time IS NULL OR cooldown_hours = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Calculate time since last chat in hours
    time_since_last_chat := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_chat_time))/3600;
    
    -- Log for debugging
    RAISE NOTICE 'User % last chat was % hours ago, cooldown is % hours', user_uuid, time_since_last_chat, cooldown_hours;
    
    -- Check if cooldown period has passed
    RETURN time_since_last_chat > cooldown_hours;
EXCEPTION WHEN OTHERS THEN
    -- Log error and default to false (no chats allowed) for safety
    RAISE NOTICE 'Error checking chat cooldown for user %: %', user_uuid, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
