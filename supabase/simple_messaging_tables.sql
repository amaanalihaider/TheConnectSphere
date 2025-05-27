-- Create simplified messaging tables for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    member1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_text TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count_member1 INTEGER DEFAULT 0,
    unread_count_member2 INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_conversation UNIQUE (member1_id, member2_id),
    CONSTRAINT enforce_member_order CHECK (member1_id < member2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ
);

-- Create indexes for faster queries
DROP INDEX IF EXISTS idx_messages_conversation_id;
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

DROP INDEX IF EXISTS idx_messages_sender_id;
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

DROP INDEX IF EXISTS idx_messages_recipient_id;
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- Function to update conversation's last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        last_message_text = NEW.message_text,
        last_message_time = NEW.created_at,
        updated_at = now(),
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

-- Trigger for new messages
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;
CREATE TRIGGER update_conversation_on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for read messages
DROP TRIGGER IF EXISTS on_message_read ON messages;
CREATE TRIGGER on_message_read
BEFORE UPDATE ON messages
FOR EACH ROW
WHEN (NEW.is_read = true AND OLD.is_read = false)
EXECUTE FUNCTION mark_messages_as_read();

-- Function to reset unread counter
CREATE OR REPLACE FUNCTION reset_conversation_unread_counter()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
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

-- Trigger to reset unread counter
DROP TRIGGER IF EXISTS reset_unread_on_read ON messages;
CREATE TRIGGER reset_unread_on_read
AFTER UPDATE ON messages
FOR EACH ROW
WHEN (NEW.is_read = true AND OLD.is_read = false)
EXECUTE FUNCTION reset_conversation_unread_counter();

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
ON conversations
FOR SELECT
USING (auth.uid() = member1_id OR auth.uid() = member2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
WITH CHECK (auth.uid() IN (member1_id, member2_id));

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations"
ON conversations
FOR UPDATE
USING (auth.uid() IN (member1_id, member2_id));

-- Message policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
USING (auth.uid() IN (sender_id, recipient_id));

DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON messages;
CREATE POLICY "Users can insert messages to their conversations"
ON messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update messages they've received" ON messages;
CREATE POLICY "Users can update messages they've received"
ON messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Function to get or create a conversation
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
    FROM conversations
    WHERE (member1_id = first_user AND member2_id = second_user);

    -- If no conversation exists, create one
    IF conv_id IS NULL THEN
        INSERT INTO conversations (member1_id, member2_id)
        VALUES (first_user, second_user)
        RETURNING id INTO conv_id;
    END IF;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
