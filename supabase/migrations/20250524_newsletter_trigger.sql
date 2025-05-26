-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create a trigger function that will call the Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_subscriber()
RETURNS TRIGGER AS $$
BEGIN
  -- Make a request to the Edge Function
  PERFORM
    extensions.http_post(
      'https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/send-welcome-email',
      jsonb_build_object('record', row_to_json(NEW)::jsonb)::text,
      'application/json',
      jsonb_build_object('Authorization', 'Bearer ' || current_setting('request.jwt.claim.role', true))::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the newsletter_subscribers table
DROP TRIGGER IF EXISTS on_new_subscriber ON public.newsletter_subscribers;
CREATE TRIGGER on_new_subscriber
  AFTER INSERT ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_subscriber();
