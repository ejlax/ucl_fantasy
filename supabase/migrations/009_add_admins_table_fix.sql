-- Fix RLS policies for admins table
-- The issue: The "manage admins" policy was applying to SELECT queries too,
-- causing a circular dependency when checking if a user is an admin.

-- Drop the problematic policy
DROP POLICY IF EXISTS "Only admins can manage admins" ON public.admins;

-- Separate policies for different operations
-- INSERT/UPDATE/DELETE: Only admins can manage
CREATE POLICY "Only admins can insert admins"
  ON public.admins
  FOR INSERT
  WITH CHECK (false); -- Disable INSERT via API (use SQL Editor only)

CREATE POLICY "Only admins can update admins"
  ON public.admins
  FOR UPDATE
  USING (false); -- Disable UPDATE via API

CREATE POLICY "Only admins can delete admins"
  ON public.admins
  FOR DELETE
  USING (false); -- Disable DELETE via API (use SQL Editor only)

