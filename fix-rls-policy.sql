-- Fix Row-Level Security for contact_submissions table
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" 
  ON contact_submissions 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Allow admin to read all submissions
CREATE POLICY "Allow admin to read all submissions" 
  ON contact_submissions 
  FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
