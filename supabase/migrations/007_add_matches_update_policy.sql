-- Add UPDATE policy for matches table
-- This allows authenticated users to update match scores
-- You can make this more restrictive later (e.g., only admins)

CREATE POLICY "Authenticated users can update matches" ON public.matches
  FOR UPDATE USING (auth.uid() IS NOT NULL);

