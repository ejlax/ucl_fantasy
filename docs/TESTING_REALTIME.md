# Testing Real-Time Updates - Complete Guide

This guide shows you how to test the real-time live scores and leaderboard functionality **without waiting for actual UCL matches**.

## 🎯 Test Environment Overview

We've created a **dedicated testing page** at `/test-live` that simulates live match updates in real-time.

### What You Can Test:
- ✅ WebSocket connections (Supabase Realtime)
- ✅ Live score updates without refresh
- ✅ Live leaderboard rank changes
- ✅ Polling fallback mechanism
- ✅ UI animations and indicators
- ✅ Performance under rapid updates

---

## 🚀 Quick Start - Testing in 5 Minutes

### Step 1: Enable Supabase Realtime

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Database** → **Replication**
3. Find the `matches` table
4. Toggle **Enable Realtime** to ON
5. Click **Save**

**Optional but Recommended:**
```sql
-- Run in Supabase SQL Editor to enable full row updates
ALTER TABLE matches REPLICA IDENTITY FULL;
```

### Step 2: Start Your Dev Server

```bash
npm run dev
```

### Step 3: Navigate to Test Page

Open your browser to:
```
http://localhost:5173/test-live
```

You should see:
- 🎮 Simulation control panel
- ⚽ Live match scores
- 🏆 Live leaderboard

### Step 4: Test Real-Time Updates

#### Manual Test:
1. Click **"Simulate Goal"** button
2. Watch the console for WebSocket messages:
   ```
   ⚡ Match updated via Realtime: { id: '...', home_score: 1, ... }
   ✅ Match cache updated for: Barcelona vs Real Madrid
   ```
3. See the UI update **instantly** without refresh!

#### Auto-Simulation Test:
1. Click **"Start Auto-Simulation"**
2. Adjust speed slider (1-10 seconds per goal)
3. Watch scores update automatically
4. Check activity log for all updates

#### Reset Test:
1. Click **"Reset All Scores"** to set all matches to 0-0
2. Start fresh testing

---

## 🔍 What to Look For

### ✅ Success Indicators

#### In Browser Console:
```
🔴 Setting up Realtime subscription for matches...
📡 Realtime subscription status: SUBSCRIBED
⚡ Match updated via Realtime: { ... }
✅ Match cache updated for: Team A vs Team B
```

#### In UI:
- 🔴 Red "LIVE" badges appear on matches
- ⚡ Scores pulse when updated
- 📡 "Live Updates Active" banner shows
- ⏰ "Last update" timestamp changes
- 🏆 Leaderboard ranks update automatically
- ⬆️⬇️ Rank change arrows appear

### ❌ Failure Indicators

#### In Browser Console:
```
❌ Error: Realtime is not enabled for this table
❌ CHANNEL_ERROR
❌ WebSocket connection failed
```

**Fix**: Enable Realtime in Supabase Dashboard (see Step 1)

#### In UI:
- Scores don't update after clicking "Simulate Goal"
- No "LIVE" badges appear
- Manual refresh required to see changes

**Fix**: Check browser console for errors, verify Realtime is enabled

---

## 🧪 Test Scenarios

### Scenario 1: Single Goal Update
**Purpose**: Test basic WebSocket functionality

1. Click "Simulate Goal" once
2. **Expected**: Score updates within 100ms
3. **Check**: Console shows WebSocket message
4. **Check**: UI updates without refresh

### Scenario 2: Rapid Updates
**Purpose**: Test performance under load

1. Set speed to "1s per goal"
2. Click "Start Auto-Simulation"
3. Let run for 30 seconds
4. **Expected**: All updates appear smoothly
5. **Expected**: No lag or missed updates
6. **Check**: Activity log shows all goals

### Scenario 3: Leaderboard Updates
**Purpose**: Test fantasy standings recalculation

1. Reset all scores to 0-0
2. Make predictions on some matches (if not already done)
3. Simulate goals on predicted matches
4. **Expected**: Leaderboard ranks change
5. **Expected**: Points update automatically
6. **Check**: Rank change arrows appear

### Scenario 4: WebSocket Reconnection
**Purpose**: Test fallback mechanism

1. Start auto-simulation
2. Open browser DevTools → Network tab
3. Throttle network to "Slow 3G"
4. **Expected**: Polling takes over
5. **Expected**: Updates continue (slower)
6. Restore network speed
7. **Expected**: WebSocket reconnects
8. **Expected**: Updates become instant again

### Scenario 5: Multiple Tabs
**Purpose**: Test concurrent connections

1. Open `/test-live` in two browser tabs
2. Simulate goal in Tab 1
3. **Expected**: Tab 2 updates automatically
4. **Expected**: Both tabs stay in sync

---

## 🐛 Troubleshooting

### Problem: "No matches available"

**Cause**: Database has no matches

**Fix**:
```sql
-- Check if matches exist
SELECT COUNT(*) FROM matches;

-- If 0, you need to seed matches or sync from ESPN
```

### Problem: WebSocket shows "CHANNEL_ERROR"

**Cause**: Realtime not enabled for `matches` table

**Fix**:
1. Supabase Dashboard → Database → Replication
2. Enable Realtime for `matches` table
3. Refresh browser

### Problem: Updates appear but UI doesn't change

**Cause**: React Query cache not updating

**Fix**:
1. Check console for cache update messages
2. Verify `queryClient.setQueriesData()` is called
3. Check React DevTools → Components → Query cache

### Problem: "Error updating match"

**Cause**: Permission issue or invalid match ID

**Fix**:
```sql
-- Check RLS policies
SELECT * FROM matches WHERE id = 'your-match-id';

-- Verify user has permission to update
```

---

## 📊 Performance Benchmarks

### Expected Performance:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| WebSocket Latency | < 100ms | < 500ms | > 1s |
| UI Update Time | < 50ms | < 200ms | > 500ms |
| Memory Usage | < 50MB | < 100MB | > 200MB |
| CPU Usage | < 5% | < 15% | > 30% |

### How to Measure:

1. Open Chrome DevTools → Performance tab
2. Click "Record"
3. Simulate 10 goals
4. Stop recording
5. Check metrics in timeline

---

## 🎓 Advanced Testing

### Test Database Triggers

Manually update a match in Supabase SQL Editor:

```sql
UPDATE matches 
SET home_score = 3, away_score = 1 
WHERE id = 'your-match-id';
```

**Expected**: UI updates automatically in browser

### Test Polling Fallback

Disable WebSocket in code temporarily:

```typescript
// In useRealtimeMatches.ts, comment out subscription
// const channel = supabase.channel(...).subscribe();
```

**Expected**: Polling continues to work (updates every 10s)

### Test Error Handling

Simulate network failure:

1. DevTools → Network → Offline
2. Try to simulate goal
3. **Expected**: Error message in activity log
4. Go back online
5. **Expected**: Next update succeeds

---

## ✅ Testing Checklist

Before deploying to production, verify:

- [ ] WebSocket connects successfully
- [ ] Match scores update in real-time
- [ ] Leaderboard ranks update automatically
- [ ] No console errors
- [ ] UI animations work smoothly
- [ ] Multiple tabs stay in sync
- [ ] Polling fallback works when WebSocket fails
- [ ] Performance is acceptable (< 100ms latency)
- [ ] Mobile browser works (test on phone)
- [ ] Works in incognito/private mode

---

## 🚀 Next Steps

Once testing is complete:

1. **Integrate into production pages**:
   - Add `useLiveMatchUpdates()` to StandingsPage
   - Add `<LiveMatchScores />` to a matches page
   - Add `<LiveLeaderboard />` to standings

2. **Monitor in production**:
   - Set up error tracking (Sentry, LogRocket)
   - Monitor WebSocket connection rates
   - Track update latency

3. **Optimize if needed**:
   - Add connection pooling
   - Implement exponential backoff for reconnection
   - Add rate limiting for rapid updates

---

## 💡 Pro Tips

- **Use Chrome DevTools**: Network tab shows WebSocket frames
- **Check Supabase Logs**: Dashboard → Logs shows Realtime activity
- **Test on Mobile**: Real-time works great on mobile browsers
- **Simulate Real Matches**: Set speed to match real UCL pace (goals every 5-10 min)
- **Test During Peak**: Simulate multiple users with multiple browser tabs

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Verify Supabase Realtime is enabled
3. Check network tab for WebSocket connection
4. Review `docs/REALTIME_SETUP.md` for architecture details
5. Test with manual SQL updates to isolate issue

