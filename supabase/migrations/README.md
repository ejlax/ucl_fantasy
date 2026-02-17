# Database Migrations

## How to Apply Migrations

Since we're using a hosted Supabase instance, migrations need to be applied through the Supabase Dashboard:

### Option 1: Supabase Dashboard SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `005_add_tie_support.sql`)
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Supabase CLI (If Linked)

If you have linked your project with `supabase link`:

```bash
npx supabase db push
```

## Migration 005: Add Two-Leg Tie Support

**File:** `005_add_tie_support.sql`

**Purpose:** Adds support for two-leg ties with aggregate scoring in the Champions League knockout stages.

**Changes:**
- Adds `leg` column (INTEGER, 1 or 2) to track which leg of a tie each match is
- Adds `tie_id` column (TEXT) to group two-leg matches together
- Updates existing matches with proper leg numbers and tie IDs
- Creates index on `tie_id` for faster lookups

**Important:** This migration must be run before the bracket visualization will work properly with aggregate scoring.

## Verification

After running the migration, verify it worked by running this query in the SQL Editor:

```sql
SELECT 
  tie_id,
  leg,
  home_team,
  away_team,
  match_date
FROM matches
WHERE round = 'PLAYOFF'
ORDER BY tie_id, leg;
```

You should see matches grouped by `tie_id` with leg numbers 1 and 2.

