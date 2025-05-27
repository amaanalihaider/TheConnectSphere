-- Create tables for the messaging system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table to track chat sessions between users
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    member1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_text TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count_member1 INTEGER DEFAULT 0,
    unread_count_member2 INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Prevent duplicate conversations between the same users
    CONSTRAINT unique_conversation UNIQUE (member1_id, member2_id),
    
    -- Ensure member1_id is always less than member2_id for consistency
    CONSTRAINT enforce_member_order CHECK (member1_id < member2_id)
);

-- Messages table to store individual messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create an index for faster querying of messages by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Create an index for faster querying of messages by sender
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Create an index for faster querying of messages by recipient
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);

-- Function to update the conversation's last message information
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the conversation with the latest message information
    UPDATE public.conversations
    SET 
        last_message_text = NEW.message_text,
        last_message_time = NEW.created_at,
        updated_at = now(),
        -- Increment unread count for the recipient
        unread_count_member1 = CASE 
            WHEN NEW.recipient_id = member1_id THEN unread_count_member1 + 1
            ELSE unread_count_member1
        END,
        unread_count_member2 = CASE 
            WHEN NEW.recipient_id = member2_id THEN unread_count_member2 + 1
            ELSE unread_count_member2
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
CREATE TRIGGER update_conversation_on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Function to handle marking messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read()
RETURNS TRIGGER AS $$
BEGIN
    -- If a message is marked as read, update the read_at timestamp
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for marking messages as read
CREATE TRIGGER on_message_read
BEFORE UPDATE ON public.messages
FOR EACH ROW
WHEN (NEW.is_read = true AND OLD.is_read = false)
EXECUTE FUNCTION mark_messages_as_read();

-- Function to reset unread counter when messages are read
CREATE OR REPLACE FUNCTION reset_conversation_unread_counter()
RETURNS TRIGGER AS $$
BEGIN
    -- Reset the unread counter for the user who is reading messages
    UPDATE public.conversations
    SET 
        unread_count_member1 = CASE 
            WHEN NEW.recipient_id = member1_id THEN 0
            ELSE unread_count_member1
        END,
        unread_count_member2 = CASE 
            WHEN NEW.recipient_id = member2_id THEN 0
            ELSE unread_count_member2
        END
    WHERE id = NEW.conversation_id AND (
        (NEW.recipient_id = member1_id AND unread_count_member1 > 0) OR
        (NEW.recipient_id = member2_id AND unread_count_member2 > 0)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset unread counter when messages are read
CREATE TRIGGER reset_unread_on_read
AFTER UPDATE ON public.messages
FOR EACH ROW
WHEN (NEW.is_read = true AND OLD.is_read = false)
EXECUTE FUNCTION reset_conversation_unread_counter();

-- Enable RLS for these tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
    auth.uid() = member1_id OR 
    auth.uid() = member2_id
);

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
    auth.uid() IN (member1_id, member2_id)
);

CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (
    auth.uid() IN (member1_id, member2_id)
);

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
    auth.uid() IN (sender_id, recipient_id)
);

CREATE POLICY "Users can insert messages to their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
);

CREATE POLICY "Users can update messages they've received"
ON public.messages
FOR UPDATE
USING (
    auth.uid() = recipient_id
);

-- Create a function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    conv_id UUID;
    first_user UUID;
    second_user UUID;
BEGIN
    -- Make sure user1_id is less than user2_id for consistency
    IF user1_id < user2_id THEN
        first_user := user1_id;
        second_user := user2_id;
    ELSE
        first_user := user2_id;
        second_user := user1_id;
    END IF;

    -- Try to find an existing conversation
    SELECT id INTO conv_id
    FROM public.conversations
    WHERE (member1_id = first_user AND member2_id = second_user);

    -- If no conversation exists, create one
    IF conv_id IS NULL THEN
        INSERT INTO public.conversations (member1_id, member2_id)
        VALUES (first_user, second_user)
        RETURNING id INTO conv_id;
    END IF;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
