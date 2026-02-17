# 🚀 Testing Quick Start

The fastest way to reset scores and start testing your UCL Fantasy app.

## 📋 Prerequisites

- Your `.env` file is set up with Supabase credentials
- Database migrations have been applied (see SETUP.md)
- App is running (`npm run dev`)

---

## ⚡ Quick Reset (30 seconds)

### Option 1: SQL Editor (Recommended)

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/reset_test_data.sql`
3. Click **Run**

This will:
- ✅ Reset all match scores to 0-0
- ✅ Mark all matches as not completed
- ✅ Clear all prediction points
- ✅ Show you a summary of what was reset

### Option 2: Via Test Page

1. Start your app: `npm run dev`
2. Go to: http://localhost:5173/test-live
3. Click **"Reset All Scores"** button

### Option 3: Command Line (Requires Auth)

**Note:** This requires you to be signed in to the app first.

```bash
npm run reset-scores
```

### Option 4: Quick SQL (One-liner)

Run this in Supabase SQL Editor:

```sql
UPDATE matches SET home_score = 0, away_score = 0, is_completed = false;
UPDATE predictions SET points_earned = NULL;
```

---

## 🧪 Complete Testing Workflow

### 1. Reset Everything

```bash
npm run reset-scores
```

### 2. Create Test Users

**Option A: Via UI**
1. Go to http://localhost:5173/signup
2. Create 2-3 test accounts:
   - test1@example.com / password123
   - test2@example.com / password123
   - test3@example.com / password123

**Option B: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User"
3. Create test users

### 3. Create a Test League

1. Sign in as test1@example.com
2. Go to "My Leagues"
3. Click "Create League"
4. Name it "Test League"
5. Copy the invite code

### 4. Join League with Other Users

1. Sign out
2. Sign in as test2@example.com
3. Go to "My Leagues" → "Join League"
4. Enter the invite code
5. Repeat for test3@example.com

### 5. Make Predictions

1. As each user, go to the league
2. Click on upcoming matches
3. Make predictions (e.g., 2-1, 3-0, etc.)
4. Save predictions

### 6. Simulate Match Results

**Option A: Test Live Page (Automated)**
1. Go to http://localhost:5173/test-live
2. Click "Start Simulation"
3. Watch goals being scored automatically
4. See real-time leaderboard updates

**Option B: Admin Page (Manual)**
1. Go to http://localhost:5173/admin
2. Find a match
3. Click "Edit Score"
4. Enter scores (e.g., 2-1)
5. Click "Save"
6. Points are calculated automatically

### 7. Check Results

1. Go to the league standings page
2. Verify points are calculated correctly:
   - **Exact score**: 3 points
   - **Correct result** (win/draw): 1 point
   - **Wrong result**: 0 points

---

## 🎮 Testing Scenarios

### Scenario 1: Exact Score Match

1. User predicts: Real Madrid 2-1 PSG
2. Actual result: Real Madrid 2-1 PSG
3. **Expected**: User gets 3 points

### Scenario 2: Correct Winner, Wrong Score

1. User predicts: Real Madrid 3-0 PSG
2. Actual result: Real Madrid 2-1 PSG
3. **Expected**: User gets 1 point

### Scenario 3: Wrong Result

1. User predicts: Real Madrid 2-1 PSG
2. Actual result: PSG 2-1 Real Madrid
3. **Expected**: User gets 0 points

### Scenario 4: Draw Prediction

1. User predicts: Real Madrid 1-1 PSG
2. Actual result: Real Madrid 1-1 PSG
3. **Expected**: User gets 3 points

### Scenario 5: Correct Draw, Wrong Score

1. User predicts: Real Madrid 0-0 PSG
2. Actual result: Real Madrid 2-2 PSG
3. **Expected**: User gets 1 point

---

## 🔄 Real-Time Testing

### Test WebSocket Updates

1. Open http://localhost:5173/test-live in **two browser tabs**
2. In Tab 1: Click "Simulate Goal"
3. **Expected**: Tab 2 updates automatically without refresh
4. **Expected**: Both tabs show the same scores

### Test Leaderboard Updates

1. Open league standings in two tabs
2. Update a match score via Admin page
3. **Expected**: Both tabs update leaderboard automatically

---

## 🐛 Troubleshooting

### "No matches found"

**Problem**: Database has no matches
**Solution**: Run migration 004:
```sql
-- In Supabase SQL Editor
-- Copy and run: supabase/migrations/004_seed_ucl_matches.sql
```

### "Points not calculating"

**Problem**: Predictions table missing data
**Solution**: 
1. Check predictions exist: Go to Supabase → Table Editor → predictions
2. Make sure match is marked as `is_completed = true`
3. Check Admin page logs for errors

### "Real-time not working"

**Problem**: Realtime not enabled
**Solution**:
1. Supabase Dashboard → Database → Replication
2. Enable Realtime for `matches` table
3. Refresh browser

### Reset script fails

**Problem**: Missing environment variables
**Solution**:
```bash
# Check your .env file exists and has:
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

## 📊 Useful SQL Queries

### Check Current State

```sql
-- See all matches and scores
SELECT round, home_team, away_team, home_score, away_score, is_completed
FROM matches
ORDER BY match_date;

-- See all predictions with points
SELECT u.display_name, m.home_team, m.away_team, 
       p.predicted_home_score, p.predicted_away_score, p.points_earned
FROM predictions p
JOIN users u ON p.user_id = u.id
JOIN matches m ON p.match_id = m.id
ORDER BY u.display_name, m.match_date;

-- See league standings
SELECT u.display_name, SUM(p.points_earned) as total_points
FROM predictions p
JOIN users u ON p.user_id = u.id
WHERE p.league_id = 'your-league-id'
GROUP BY u.id, u.display_name
ORDER BY total_points DESC;
```

---

## 🎯 Next Steps

After testing:
1. ✅ Verify all features work
2. ✅ Test on mobile devices
3. ✅ Test with real match data
4. ✅ Deploy to production

Happy testing! 🚀

