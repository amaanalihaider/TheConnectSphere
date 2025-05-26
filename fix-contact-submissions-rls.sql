-- Check current RLS policies for contact_submissions table
SELECT
  p.policyname,
  p.tablename,
  p.roles,
  p.cmd,
  p.qual,
  p.with_check
FROM
  pg_policies p
WHERE
  p.tablename = 'contact_submissions';

-- Enable RLS on the contact_submissions table if not already enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous inserts
CREATE POLICY "Allow anonymous inserts" 
ON contact_submissions 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Create policy for authenticated reads
CREATE POLICY "Allow authenticated reads" 
ON contact_submissions 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy for service role access (full access)
CREATE POLICY "Allow service role full access" 
ON contact_submissions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
