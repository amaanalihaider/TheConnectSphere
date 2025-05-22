-- Create the profiles table to store user information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    birthdate DATE NOT NULL,
    gender TEXT NOT NULL,
    city TEXT,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    relationship_types TEXT[] DEFAULT '{}',
    gender_preferences TEXT[] DEFAULT '{}',
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on username for faster lookups
CREATE INDEX profiles_username_idx ON public.profiles(username);

-- Create a function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at field
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create a trigger to automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name, 
        username, 
        birthdate, 
        gender, 
        city, 
        bio, 
        interests, 
        relationship_types,
        gender_preferences,
        profile_image,
        created_at
    )
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'first_name', 
        NEW.raw_user_meta_data->>'last_name', 
        NEW.raw_user_meta_data->>'username', 
        (NEW.raw_user_meta_data->>'birthdate')::DATE, 
        NEW.raw_user_meta_data->>'gender', 
        NEW.raw_user_meta_data->>'city', 
        NEW.raw_user_meta_data->>'bio', 
        CASE 
            WHEN NEW.raw_user_meta_data->>'interests' IS NULL THEN '{}'
            WHEN NEW.raw_user_meta_data->>'interests' LIKE '[%' THEN 
                (SELECT array_agg(value) FROM json_array_elements_text(NEW.raw_user_meta_data->>'interests'::json))
            ELSE string_to_array(NEW.raw_user_meta_data->>'interests', ',')
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'relationship_types' IS NULL THEN '{}'
            WHEN NEW.raw_user_meta_data->>'relationship_types' LIKE '[%' THEN 
                (SELECT array_agg(value) FROM json_array_elements_text(NEW.raw_user_meta_data->>'relationship_types'::json))
            ELSE string_to_array(NEW.raw_user_meta_data->>'relationship_types', ',')
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'gender_preferences' IS NULL THEN '{}'
            WHEN NEW.raw_user_meta_data->>'gender_preferences' LIKE '[%' THEN 
                (SELECT array_agg(value) FROM json_array_elements_text(NEW.raw_user_meta_data->>'gender_preferences'::json))
            ELSE string_to_array(NEW.raw_user_meta_data->>'gender_preferences', ',')
        END,
        NEW.raw_user_meta_data->>'profile_image',
        COALESCE((NEW.raw_user_meta_data->>'created_at')::TIMESTAMP WITH TIME ZONE, now())
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();