-- PostgreSQL script for Supabase
-- This is a documentation file showing the SQL used in Supabase
-- Note: This syntax is specific to PostgreSQL and Supabase

/*
The following SQL was executed in the Supabase SQL Editor to create
the contact_submissions table and set up the required permissions:

```sql
-- Create the contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new'
);

-- Add comment to table
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from website visitors';

-- Add RLS policy to allow inserts from anonymous users (needed for the contact form)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" 
  ON contact_submissions 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Allow admin to read all submissions
CREATE POLICY "Allow admin to read all submissions" 
  ON contact_submissions 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
```
*/
