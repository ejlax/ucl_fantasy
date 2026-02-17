-- Add RLS policies to allow league owners to manage predictions for their league members
-- This enables the admin prediction management feature

-- Policy: League owners can view all predictions in their leagues
CREATE POLICY "League owners can view all predictions in their leagues" ON public.predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE id = predictions.league_id
      AND owner_id = auth.uid()
    )
  );

-- Policy: League owners can create predictions for any member in their leagues
CREATE POLICY "League owners can create predictions for league members" ON public.predictions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leagues l
      JOIN public.league_members lm ON lm.league_id = l.id
      WHERE l.id = predictions.league_id
      AND l.owner_id = auth.uid()
      AND lm.user_id = predictions.user_id
    )
  );

-- Policy: League owners can update any prediction in their leagues (admin override)
CREATE POLICY "League owners can update predictions in their leagues" ON public.predictions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE id = predictions.league_id
      AND owner_id = auth.uid()
    )
  );

-- Note: The existing policies still apply:
-- - "League members can view predictions in their leagues" (line 143-150 in 001_initial_schema.sql)
-- - "League members can create predictions" (line 152-160)
-- - "Users can update own predictions before match starts" (line 162-170)
--
-- These new policies work alongside the existing ones, giving league owners
-- additional permissions to manage predictions for their league members.

