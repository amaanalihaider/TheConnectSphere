-- Drop script for messaging tables
-- Run this before creating new tables to avoid conflicts

-- Drop triggers first
DROP TRIGGER IF EXISTS reset_unread_on_read ON public.messages;
DROP TRIGGER IF EXISTS on_message_read ON public.messages;
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON public.messages;

-- Drop functions
DROP FUNCTION IF EXISTS reset_conversation_unread_counter();
DROP FUNCTION IF EXISTS mark_messages_as_read();
DROP FUNCTION IF EXISTS update_conversation_last_message();
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID);

-- Drop policies
DROP POLICY IF EXISTS "Users can update messages they've received" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_recipient_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_conversation_id;

-- Drop tables (messages first due to foreign key constraints)
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.conversations;

-- Now drop the same objects without the 'public.' schema prefix
-- as a fallback in case they were created without the prefix

-- Drop triggers
DROP TRIGGER IF EXISTS reset_unread_on_read ON messages;
DROP TRIGGER IF EXISTS on_message_read ON messages;
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;

-- Drop policies
DROP POLICY IF EXISTS "Users can update messages they've received" ON messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_recipient_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_conversation_id;

-- Drop tables
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
