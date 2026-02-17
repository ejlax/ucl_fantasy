# Apply Migration 008: League Owner Prediction Policies

## What This Migration Does

This migration adds Row Level Security (RLS) policies that allow league owners/commissioners to manage predictions for their league members, even after matches have started. This enables the admin prediction management feature.

### New Policies Added:

1. **League owners can view all predictions in their leagues**
   - Allows league owners to read predictions for any member in their leagues
   - Fixes the 406 (Not Acceptable) error when trying to GET predictions

2. **League owners can create predictions for league members**
   - Allows league owners to create predictions on behalf of their members
   - Validates that the user is a member of the league
   - Fixes the 403 (Forbidden) error when trying to POST predictions

3. **League owners can update predictions in their leagues**
   - Allows league owners to update any prediction in their leagues
   - Enables admin override to edit predictions after match start

## How to Apply This Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://dwlgowyzdjconfoulkna.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `008_add_league_owner_prediction_policies.sql`
5. Click **Run** to execute the migration
6. You should see a success message: "Success. No rows returned"

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Verification

After applying the migration, verify the policies were created:

1. In Supabase Dashboard, go to **Database** → **Policies**
2. Select the `predictions` table
3. You should see 6 total policies:
   - ✅ League members can view predictions in their leagues
   - ✅ League members can create predictions
   - ✅ Users can update own predictions before match starts
   - ✅ **League owners can view all predictions in their leagues** (NEW)
   - ✅ **League owners can create predictions for league members** (NEW)
   - ✅ **League owners can update predictions in their leagues** (NEW)

## Testing

After applying the migration:

1. Log in as a league owner
2. Navigate to **League Details** → **Admin Tools** → **Manage Member Predictions**
3. Select a member and a match
4. Enter scores and click **Save Prediction**
5. You should see a success message (no more 403/406 errors!)

## Security Notes

- These policies only grant permissions to **league owners** (users where `leagues.owner_id = auth.uid()`)
- League owners can only manage predictions for **members of their own leagues**
- The existing policies for regular members remain unchanged
- Users can still only update their own predictions before match start (unless they're the league owner)

## Rollback

If you need to rollback this migration:

```sql
DROP POLICY IF EXISTS "League owners can view all predictions in their leagues" ON public.predictions;
DROP POLICY IF EXISTS "League owners can create predictions for league members" ON public.predictions;
DROP POLICY IF EXISTS "League owners can update predictions in their leagues" ON public.predictions;
```

