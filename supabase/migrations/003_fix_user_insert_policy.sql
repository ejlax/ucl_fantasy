-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a new INSERT policy that allows service role (for triggers)
-- This allows the trigger function to insert user profiles
CREATE POLICY "Enable insert for authenticated users and service role" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.role() = 'service_role'
  );

