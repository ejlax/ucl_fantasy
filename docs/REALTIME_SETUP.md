# Real-Time Live Scores & Leaderboard Setup

This document explains how to implement real-time live scores and fantasy leaderboards in your UCL Fantasy app **without requiring users to manually refresh**.

## 🎯 Architecture Overview

We use a **3-tier hybrid approach** for maximum reliability:

### Tier 1: Supabase Realtime (WebSocket) - PRIMARY ⚡
- **Speed**: Instant updates (< 100ms)
- **Method**: WebSocket connection to Supabase
- **Triggers**: Database changes (UPDATE on matches table)
- **Reliability**: 99.9% uptime
- **Cost**: Free on Supabase (included in all plans)

### Tier 2: ESPN API Polling - BACKUP 🔄
- **Speed**: 10-30 second updates
- **Method**: HTTP polling to ESPN API
- **Triggers**: Interval-based (every 10s during live matches)
- **Reliability**: Depends on ESPN API availability
- **Cost**: Free (ESPN API is public)

### Tier 3: Manual Refresh - FALLBACK 🔃
- **Speed**: User-initiated
- **Method**: React Query refetch
- **Triggers**: User clicks refresh button
- **Reliability**: 100% (always works)
- **Cost**: Free

---

## 📦 What Was Created

### 1. **`src/hooks/useRealtimeMatches.ts`**
Core hooks for real-time functionality:

- `useRealtimeMatches()` - Subscribe to match score updates via WebSocket
- `useRealtimeStandings()` - Subscribe to standings updates
- `useLiveMatchUpdates()` - Combined hook with polling + WebSocket

### 2. **`src/components/live/LiveLeaderboard.tsx`**
Real-time fantasy leaderboard component:

- Shows live standings with rank changes
- Auto-updates when predictions/scores change
- Visual indicators for live matches
- Rank change arrows (up/down/same)

### 3. **`src/components/live/LiveMatchScores.tsx`**
Real-time match scores component:

- Shows live match scores with team logos
- Pulse animation on score updates
- Live/FT/Scheduled status badges
- Filters by round or live matches only

---

## 🚀 How to Use

### Option 1: Add to Existing Pages

```tsx
import { useLiveMatchUpdates } from '@/hooks/useRealtimeMatches';
import { LiveLeaderboard } from '@/components/live/LiveLeaderboard';
import { LiveMatchScores } from '@/components/live/LiveMatchScores';

function StandingsPage() {
  const { user } = useAuth();
  const { data: leagues } = useUserLeagues(user?.id);
  const leagueId = leagues?.[0]?.id;

  // Enable real-time updates
  useLiveMatchUpdates(leagueId);

  return (
    <div>
      <LiveLeaderboard leagueId={leagueId} />
      <LiveMatchScores showOnlyLive={true} />
    </div>
  );
}
```

### Option 2: Create Dedicated Live Page

```tsx
// src/pages/LivePage.tsx
export function LivePage() {
  const { user } = useAuth();
  const { data: leagues } = useUserLeagues(user?.id);
  const leagueId = leagues?.[0]?.id;

  useLiveMatchUpdates(leagueId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <h1 className="text-4xl font-bold">Live Scores</h1>
        
        <LiveMatchScores showOnlyLive={true} />
        
        <LiveLeaderboard 
          leagueId={leagueId} 
          showLiveIndicator={true} 
        />
      </div>
    </div>
  );
}
```

---

## ⚙️ Supabase Realtime Configuration

### Step 1: Enable Realtime in Supabase Dashboard

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Database** → **Replication**
3. Find the `matches` table
4. Toggle **Enable Realtime** to ON
5. Click **Save**

### Step 2: Verify Realtime is Working

Open browser console and look for:
```
🔴 Setting up Realtime subscription for matches...
📡 Realtime subscription status: SUBSCRIBED
```

When a match score updates:
```
⚡ Match updated via Realtime: { id: '...', home_score: 2, ... }
✅ Match cache updated for: Barcelona vs Real Madrid
```

---

## 🔧 How It Works

### 1. WebSocket Connection

```typescript
const channel = supabase
  .channel('matches-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'matches',
  }, (payload) => {
    // Update React Query cache instantly
    queryClient.setQueriesData(...)
  })
  .subscribe();
```

### 2. Automatic Cache Updates

When a match score changes in the database:
1. Supabase sends WebSocket message to all connected clients
2. Hook receives the update
3. React Query cache is updated
4. UI re-renders automatically
5. **Total time: < 100ms** ⚡

### 3. Polling Fallback

If WebSocket fails or during high traffic:
```typescript
setInterval(() => {
  if (hasLiveMatches) {
    queryClient.invalidateQueries({ queryKey: ['matches'] });
  }
}, 10000); // Every 10 seconds
```

---

## 📊 Performance Characteristics

| Method | Latency | Bandwidth | Battery Impact |
|--------|---------|-----------|----------------|
| WebSocket | < 100ms | Very Low | Low |
| Polling (10s) | 0-10s | Medium | Medium |
| Manual Refresh | Instant | Low | None |

---

## 🎨 UI Features

### Live Indicators
- 🔴 Red "LIVE" badge on active matches
- ⚡ Pulse animation on score updates
- 📡 "Live Updates Active" banner
- ⏰ Last update timestamp

### Leaderboard Features
- 🏆 Top 3 highlighted with gold/silver/bronze
- ⬆️ Rank change indicators (up/down arrows)
- 📊 Real-time point updates
- 👤 User names and prediction counts

### Match Cards
- 🎯 Team logos from ESPN
- 🔴 Live scores in red
- ✅ Completed matches in green
- ⏰ Scheduled matches in gray

---

## 🐛 Troubleshooting

### WebSocket Not Connecting

**Check 1**: Verify Realtime is enabled in Supabase
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_publication;
-- Should show 'supabase_realtime' publication
```

**Check 2**: Check browser console for errors
```
❌ Error: Realtime is not enabled for this table
```

**Fix**: Enable Realtime in Supabase Dashboard (see Step 1 above)

### Updates Not Appearing

**Check**: Verify match updates are happening in database
```sql
-- Update a match score manually
UPDATE matches 
SET home_score = 2, away_score = 1 
WHERE id = 'some-match-id';
```

**Expected**: Should see console log:
```
⚡ Match updated via Realtime: ...
```

---

## 🚀 Next Steps

1. **Enable Supabase Realtime** for `matches` table
2. **Add `useLiveMatchUpdates()`** to your standings/live pages
3. **Use `<LiveLeaderboard />` and `<LiveMatchScores />`** components
4. **Test** by updating match scores in Supabase dashboard
5. **Deploy** and enjoy real-time updates!

---

## 💡 Pro Tips

- **Mobile**: WebSocket works great on mobile (low battery impact)
- **Offline**: Polling continues when WebSocket disconnects
- **Scale**: Supabase Realtime handles 1000s of concurrent connections
- **Cost**: Completely free on all Supabase plans

