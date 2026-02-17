# 🔄 How to Reset Scores - UCL Fantasy

Quick reference guide for resetting match scores and prediction points.

---

## 🚀 Fastest Method (30 seconds)

### Via Supabase SQL Editor

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** in the left sidebar

2. **Run this SQL:**
   ```sql
   UPDATE matches SET home_score = 0, away_score = 0, is_completed = false;
   UPDATE predictions SET points_earned = NULL;
   ```

3. **Click "Run"**

✅ Done! All scores reset to 0-0 and points cleared.

---

## 🎮 Via Test Page (In-App)

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Open test page:**
   - Go to http://localhost:5173/test-live

3. **Click "Reset All Scores" button**

✅ All matches reset automatically!

---

## 📝 Via Complete SQL Script (Detailed)

For a more comprehensive reset with verification:

1. **Go to Supabase Dashboard → SQL Editor**

2. **Copy the entire contents of:**
   ```
   supabase/reset_test_data.sql
   ```

3. **Paste and Run**

This script will:
- ✅ Reset all match scores
- ✅ Clear all prediction points
- ✅ Show before/after statistics
- ✅ Verify the reset was successful
- ✅ Display a summary table

---

## 💻 Via Command Line (Advanced)

**Note:** This method requires authentication and may not work due to RLS policies.

```bash
npm run reset-scores
```

If you get permission errors, use the SQL Editor method instead.

---

## 🧪 What Gets Reset

### Matches Table
- `home_score` → 0
- `away_score` → 0
- `is_completed` → false

### Predictions Table
- `points_earned` → NULL

### What Stays Unchanged
- ✅ Match fixtures (teams, dates, rounds)
- ✅ User predictions (predicted scores)
- ✅ Leagues and members
- ✅ User accounts

---

## 🔍 Verify Reset Worked

Run this in SQL Editor to check:

```sql
-- Should show all matches with 0-0 scores
SELECT round, home_team, away_team, home_score, away_score, is_completed
FROM matches
ORDER BY match_date
LIMIT 10;

-- Should show 0 predictions with points
SELECT COUNT(*) as predictions_with_points
FROM predictions
WHERE points_earned IS NOT NULL;
```

Expected results:
- All `home_score` and `away_score` = 0
- All `is_completed` = false
- `predictions_with_points` = 0

---

## 🎯 Common Use Cases

### Testing Predictions
1. Reset scores
2. Make predictions as test users
3. Update match scores via Admin page
4. Check if points calculated correctly

### Testing Real-Time Updates
1. Reset scores
2. Open app in two browser tabs
3. Go to http://localhost:5173/test-live
4. Click "Simulate Goal"
5. Watch both tabs update in real-time

### Starting Fresh
1. Reset scores (this guide)
2. Optionally delete predictions:
   ```sql
   DELETE FROM predictions;
   ```
3. Create new test predictions

---

## ⚠️ Troubleshooting

### "No rows updated"

**Problem:** RLS policies blocking update
**Solution:** Use SQL Editor method (runs as service role, bypasses RLS)

### "Permission denied"

**Problem:** Not authenticated or insufficient permissions
**Solution:** Use SQL Editor method instead of command line

### Scores still showing

**Problem:** Browser cache
**Solution:** 
1. Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)
2. Or clear browser cache
3. Or restart dev server

### Points still showing

**Problem:** React Query cache
**Solution:**
1. Refresh the page
2. Or restart dev server

---

## 📚 Related Guides

- **[TESTING_QUICKSTART.md](TESTING_QUICKSTART.md)** - Complete testing workflow
- **[LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md)** - Set up local database
- **[supabase/reset_test_data.sql](supabase/reset_test_data.sql)** - Full reset script
- **[docs/TESTING_REALTIME.md](docs/TESTING_REALTIME.md)** - Test real-time features

---

## 🎉 Quick Reference

| Method | Speed | Difficulty | Best For |
|--------|-------|------------|----------|
| SQL One-liner | ⚡ 30s | Easy | Quick resets |
| Test Page | ⚡ 1min | Very Easy | Non-technical users |
| Full SQL Script | 🔄 2min | Easy | Detailed verification |
| Command Line | ❌ May fail | Medium | Automated scripts |

**Recommended:** Use SQL One-liner for quick resets, Full SQL Script for detailed resets.

---

## 💡 Pro Tips

1. **Bookmark the SQL Editor** in your browser for quick access
2. **Save the one-liner SQL** as a snippet in Supabase for one-click reset
3. **Use the Test Page** when demonstrating to non-technical users
4. **Check the verification queries** after reset to confirm it worked

---

## 🚀 Next Steps

After resetting:
1. ✅ Make test predictions
2. ✅ Update scores via Admin page or Test Live page
3. ✅ Verify points are calculated correctly
4. ✅ Test real-time updates

Happy testing! 🎮

