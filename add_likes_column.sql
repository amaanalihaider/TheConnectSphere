-- Add likes column to profiles table if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create or replace function to increment likes safely
CREATE OR REPLACE FUNCTION increment_profile_like(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    UPDATE profiles
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = profile_id
    RETURNING likes INTO new_likes;
    
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql;
