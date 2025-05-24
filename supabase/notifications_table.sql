-- Clean, simplified SQL for notification system

-- Create notifications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        CREATE TABLE public.notifications (
            id SERIAL PRIMARY KEY,
            recipient_id UUID NOT NULL REFERENCES auth.users(id),
            sender_id UUID REFERENCES auth.users(id),
            type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_notifications_recipient ON public.notifications (recipient_id);
        CREATE INDEX idx_notifications_created_at ON public.notifications (created_at);
    END IF;
END $$;

-- Create connections table if it doesn't exist yet
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections') THEN
        CREATE TABLE public.connections (
            id SERIAL PRIMARY KEY,
            initiator_user_id UUID NOT NULL REFERENCES auth.users(id),
            target_user_id UUID NOT NULL REFERENCES auth.users(id),
            status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'blocked'
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(initiator_user_id, target_user_id)
        );
    END IF;
END $$;

-- Trigger to create notifications when connections are created
CREATE OR REPLACE FUNCTION public.create_connection_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (recipient_id, sender_id, type, message)
    VALUES (
        NEW.target_user_id,
        NEW.initiator_user_id,
        'connection-request',
        'You have a new connection request'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists to avoid duplicate triggers
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'connection_notification_trigger') THEN
        DROP TRIGGER connection_notification_trigger ON public.connections;
    END IF;
END $$;

-- Create the trigger
CREATE TRIGGER connection_notification_trigger
AFTER INSERT ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.create_connection_notification();
