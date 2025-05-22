-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    birthdate DATE,
    gender TEXT,
    city TEXT,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    relationship_types TEXT[] DEFAULT '{}',
    gender_preferences TEXT[] DEFAULT '{}',
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on username for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Create a function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at field
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Disable RLS if it's enabled
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant access to the anon and authenticated roles
GRANT ALL ON public.profiles TO anon, authenticated;
