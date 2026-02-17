# Next Steps: Two-Leg Tie Implementation

## ✅ What's Been Done

I've updated the codebase to support two-leg ties with aggregate scoring for the Champions League knockout stages:

### 1. Database Schema Updates
- **Created migration**: `supabase/migrations/005_add_tie_support.sql`
  - Adds `leg` column (1 or 2) to track which leg of a tie each match is
  - Adds `tie_id` column to group two-leg matches together
  - Updates existing matches with proper leg numbers and tie IDs:
    - **PLAYOFF**: 8 ties (PLAYOFF-TIE-1 through PLAYOFF-TIE-8)
    - **R16**: 8 ties (R16-TIE-1 through R16-TIE-8)
    - **QF**: 4 ties (QF-TIE-1 through QF-TIE-4)
    - **SF**: 2 ties (SF-TIE-1 through SF-TIE-2)
    - **FINAL**: 1 single match (FINAL-SINGLE)
  - Creates index on `tie_id` for faster lookups

- **Updated TypeScript types**: `src/types/database.ts`
  - Added `leg: number` field to Match type
  - Added `tie_id: string | null` field to Match type

### 2. Utility Functions
- **Created**: `src/utils/tieUtils.ts`
  - `groupMatchesIntoTies()` - Groups individual matches into two-leg ties
  - `isTwoLegRound()` - Checks if a round uses two-leg format
  - `getAggregateScoreText()` - Formats aggregate score display
  - `getLegScoreText()` - Formats individual leg score display
  - Handles aggregate scoring calculation
  - Implements away goals rule for tie-breakers

### 3. UI Components
- **Created**: `src/components/bracket/TieMatchCard.tsx`
  - Displays two-leg ties with aggregate scores
  - Shows both leg scores
  - Highlights winners
  - Indicates "Won on away goals" when applicable
  - Special styling for the Final (single match)

- **Updated**: `src/components/bracket/TournamentBracket.tsx`
  - Now uses tie-based grouping instead of individual matches
  - Displays aggregate scores for two-leg ties
  - Responsive grid layout
  - Special centered layout for the Final

## ⚠️ What Needs to Be Done

### 1. Apply Database Migration (REQUIRED)

The database migration **must be applied** before the bracket will work properly. Since you're using a hosted Supabase instance:

**Option A: Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/005_add_tie_support.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

**Option B: Supabase CLI (If you have it linked)**
```bash
npx supabase db push
```

### 2. Verify the Migration

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

### 3. Test the Bracket View

Once the migration is applied:
1. Navigate to the Bracket page in your app (http://localhost:5174/bracket)
2. You should see matches grouped into ties
3. Each tie should show:
   - Both team names
   - Aggregate scores (when matches are completed)
   - Individual leg scores at the bottom
   - "Won on away goals" indicator if applicable

## 📝 How It Works

### Two-Leg Tie Structure

For rounds PLAYOFF through SEMI-FINALS:
- Each tie consists of 2 matches (home and away)
- Leg 1: Team A (home) vs Team B (away)
- Leg 2: Team B (home) vs Team A (away)
- Winner determined by aggregate score (total goals across both legs)
- If aggregate is tied, away goals rule applies
- If still tied, would go to extra time/penalties (not implemented yet)

For the FINAL:
- Single match only
- No aggregate scoring
- No away goals rule

### Example Tie

```
Tie ID: PLAYOFF-TIE-1
Team 1: Galatasaray
Team 2: Juventus

Leg 1 (Feb 17, 2026): Galatasaray 2-1 Juventus
Leg 2 (Feb 24, 2026): Juventus 1-0 Galatasaray

Aggregate: Galatasaray 2-2 Juventus
Away goals: Galatasaray 0, Juventus 1
Winner: Juventus (on away goals)
```

## 🚀 Future Enhancements

Once the basic tie system is working, consider adding:

1. **Extra Time & Penalties**: Handle ties that go to extra time or penalties
2. **Live Updates**: Real-time score updates using Supabase Realtime
3. **Predictions**: Allow users to predict aggregate scores for ties
4. **Statistics**: Show tie statistics (total goals, clean sheets, etc.)
5. **Bracket Tree View**: Use react-tournament-brackets library for a proper tree visualization with connecting lines

## 📚 Files Modified

- `supabase/migrations/005_add_tie_support.sql` (created)
- `supabase/migrations/README.md` (created)
- `src/types/database.ts` (updated)
- `src/utils/tieUtils.ts` (created)
- `src/components/bracket/TieMatchCard.tsx` (created)
- `src/components/bracket/TournamentBracket.tsx` (updated)
- `NEXT_STEPS.md` (this file)

## ❓ Questions?

If you encounter any issues:
1. Check that the migration was applied successfully
2. Verify that matches have `leg` and `tie_id` values in the database
3. Check the browser console for any errors
4. Ensure the dev server is running (`npm run dev`)

