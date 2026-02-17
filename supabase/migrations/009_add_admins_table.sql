-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read admins table (to check if user is admin)
CREATE POLICY "Anyone can read admins"
  ON public.admins
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update/delete admins
CREATE POLICY "Only admins can manage admins"
  ON public.admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);

-- Note: After running this migration, you need to manually insert the first admin(s)
-- Run this in the Supabase SQL Editor:
-- 
-- INSERT INTO public.admins (user_id)
-- SELECT id FROM public.users WHERE email = 'your-email@example.com';
-- 
-- INSERT INTO public.admins (user_id)
-- SELECT id FROM public.users WHERE email = 'cohen-email@example.com';

