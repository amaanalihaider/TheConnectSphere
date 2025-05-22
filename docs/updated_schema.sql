-- Drop existing trigger and function first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
