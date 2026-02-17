# 🧪 Testing Guide - UCL Fantasy

Complete guide for testing your UCL Fantasy application with local or hosted databases.

---

## 🎯 Quick Links

- **[Quick Start Guide](TESTING_QUICKSTART.md)** - Get testing in 30 seconds
- **[Local Database Setup](LOCAL_TESTING_GUIDE.md)** - Full local Supabase setup
- **[Reset SQL Script](supabase/reset_test_data.sql)** - Manual database reset

---

## ⚡ Fastest Way to Start Testing

### 1. Reset Scores (Choose One)

**Option A: Command Line** (Recommended)
```bash
npm run reset-scores
```

**Option B: Test Page**
- Go to http://localhost:5173/test-live
- Click "Reset All Scores"

**Option C: SQL Editor**
- Run `supabase/reset_test_data.sql` in Supabase Dashboard

### 2. Test the App

**Automated Testing:**
```bash
# Start app
npm run dev

# Open test page
# http://localhost:5173/test-live

# Click "Start Simulation" and watch!
```

**Manual Testing:**
- Create test users via signup page
- Create a league
- Make predictions
- Update scores via Admin page
- Check standings

---

## 🗂️ Available Resources

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Reset Scores | `npm run reset-scores` | Reset all match scores and points |
| Reset Scores (alt) | `npm run db:reset` | Same as above |
| Setup Local DB | `./scripts/setup-local-supabase.sh` | Set up local Supabase with Docker |

### SQL Files

| File | Purpose |
|------|---------|
| `supabase/reset_test_data.sql` | Reset database for testing |
| `supabase/migrations/001_initial_schema.sql` | Create tables |
| `supabase/migrations/004_seed_ucl_matches.sql` | Seed match data |
| `supabase/migrations/005_add_tie_support.sql` | Add two-leg support |

### Documentation

| File | Purpose |
|------|---------|
| `TESTING_QUICKSTART.md` | Quick start guide (30 seconds) |
| `LOCAL_TESTING_GUIDE.md` | Complete local setup guide |
| `docs/TESTING_REALTIME.md` | Real-time features testing |
| `SETUP.md` | Initial project setup |

---

## 🏗️ Two Testing Approaches

### Approach 1: Use Hosted Supabase (Simpler)

**Pros:**
- ✅ No Docker required
- ✅ No additional setup
- ✅ Works immediately

**Cons:**
- ❌ Shares database with production
- ❌ Need to reset data manually

**Setup:**
```bash
# Already done if you followed SETUP.md
npm run dev
npm run reset-scores  # Reset when needed
```

### Approach 2: Use Local Supabase (Recommended)

**Pros:**
- ✅ Isolated test environment
- ✅ Can reset anytime without affecting production
- ✅ Faster development
- ✅ Works offline

**Cons:**
- ❌ Requires Docker
- ❌ Initial setup time

**Setup:**
```bash
# One-time setup
./scripts/setup-local-supabase.sh

# Create .env.local with local credentials
# Start app
npm run dev
```

See [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md) for detailed instructions.

---

## 🎮 Testing Features

### 1. Authentication
- Sign up new users
- Sign in/out
- Profile management

### 2. Leagues
- Create league
- Join league with invite code
- View league members
- Leave league

### 3. Predictions
- Make predictions before match starts
- Edit predictions before match starts
- View own predictions
- View other users' predictions (after match)

### 4. Scoring
- Update match scores (Admin page)
- Automatic points calculation
- Standings updates
- Leaderboard ranking

### 5. Real-Time Updates
- Live score updates
- Live leaderboard updates
- WebSocket connections
- Polling fallback

### 6. Bracket Visualization
- View tournament bracket
- See match results
- Track progression

---

## 📊 Test Data Examples

### Sample Users
```
test1@example.com / password123
test2@example.com / password123
test3@example.com / password123
```

### Sample Predictions
```
User 1: Real Madrid 2-1 PSG
User 2: Real Madrid 3-0 PSG
User 3: PSG 1-0 Real Madrid
```

### Sample Results
```
Actual: Real Madrid 2-1 PSG

Points:
- User 1: 3 points (exact score)
- User 2: 1 point (correct winner)
- User 3: 0 points (wrong result)
```

---

## 🔧 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| No matches found | Run migration 004 in SQL Editor |
| Points not calculating | Check match is marked `is_completed = true` |
| Real-time not working | Enable Realtime for `matches` table in Supabase |
| Reset script fails | Check `.env` file has correct credentials |
| Docker won't start | Restart Docker Desktop |

### Getting Help

1. Check the error message
2. Look in browser console (F12)
3. Check Supabase logs in Dashboard
4. Review the relevant guide above

---

## 🚀 Production Testing Checklist

Before deploying to production:

- [ ] Test authentication flow
- [ ] Test league creation and joining
- [ ] Test predictions (create, edit, view)
- [ ] Test score updates and points calculation
- [ ] Test real-time updates
- [ ] Test on mobile devices
- [ ] Test with multiple users simultaneously
- [ ] Test edge cases (ties, draws, etc.)
- [ ] Verify RLS policies work correctly
- [ ] Test performance with many predictions

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev/)

---

## 🎯 Next Steps

1. **Start Testing**: Follow [TESTING_QUICKSTART.md](TESTING_QUICKSTART.md)
2. **Set Up Local DB**: Follow [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md)
3. **Test Real-Time**: Follow [docs/TESTING_REALTIME.md](docs/TESTING_REALTIME.md)
4. **Deploy**: When ready, deploy to production

Happy testing! 🎉

