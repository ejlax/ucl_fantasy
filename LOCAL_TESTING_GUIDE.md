# Local Testing Guide - UCL Fantasy

This guide shows you how to set up a local test database and reset scores for testing.

## 🎯 Two Options for Testing

### Option 1: Use Supabase Local Development (Recommended)
Run a complete local Supabase instance with Docker.

### Option 2: Use Your Hosted Instance with Test Data
Use your existing hosted Supabase instance but with test data.

---

## 🐳 Option 1: Local Supabase with Docker

### Prerequisites
- Docker Desktop installed and running
- Node.js 20+ installed

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Initialize Supabase Locally

```bash
# Initialize Supabase in your project
supabase init

# Start local Supabase (this will download Docker images)
supabase start
```

This will start:
- PostgreSQL database (localhost:54322)
- Supabase Studio (http://localhost:54323)
- Auth server
- Realtime server
- Storage server

### Step 3: Apply Migrations

```bash
# Apply all migrations to local database
supabase db reset
```

This automatically runs all migrations in `supabase/migrations/` in order.

### Step 4: Create Local Environment File

Create `.env.local`:

```bash
# After running 'supabase start', you'll see output like this:
# API URL: http://localhost:54321
# anon key: eyJhbGc...

# Copy those values here:
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key_from_supabase_start_output
```

### Step 5: Update Vite Config to Use Local Env

Your app will automatically use `.env.local` if it exists (it takes precedence over `.env`).

### Step 6: Start Your App

```bash
npm run dev
```

Your app now connects to the local database! 🎉

### Step 7: Access Local Supabase Studio

Open http://localhost:54323 to:
- View tables and data
- Run SQL queries
- Manage auth users
- Test realtime subscriptions

### Useful Local Commands

```bash
# Stop local Supabase
supabase stop

# Reset database (drops all data and re-runs migrations)
supabase db reset

# View local database status
supabase status

# Generate TypeScript types from local schema
supabase gen types typescript --local > src/types/database.ts
```

---

## 🔄 Option 2: Reset Scores on Hosted Instance

If you want to use your hosted Supabase instance for testing:

### Quick Reset via SQL

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Reset all match scores to 0-0 and mark as not completed
UPDATE matches 
SET 
  home_score = 0,
  away_score = 0,
  is_completed = false;

-- Reset all prediction points
UPDATE predictions 
SET points_earned = NULL;

-- Verify reset
SELECT round, home_team, away_team, home_score, away_score, is_completed 
FROM matches 
ORDER BY match_date;
```

### Reset via Test Page

1. Navigate to http://localhost:5173/test-live
2. Click **"Reset All Scores"** button
3. All matches will be reset to 0-0

---

## 🧪 Testing Workflow

### 1. Create Test Users

```sql
-- In Supabase SQL Editor, create test users
-- Note: You'll need to sign up via the app UI for proper auth setup
```

Or use the signup page: http://localhost:5173/signup

### 2. Create Test League

1. Sign in as a test user
2. Go to "My Leagues"
3. Create a new league (e.g., "Test League")
4. Note the invite code

### 3. Add Test Predictions

1. Join the league with multiple test accounts
2. Make predictions for upcoming matches
3. Use the Admin page or Test Live page to update scores

### 4. Test Score Updates

**Via Admin Page:**
- Go to http://localhost:5173/admin
- Edit match scores
- Points are automatically calculated

**Via Test Live Page:**
- Go to http://localhost:5173/test-live
- Click "Simulate Goal" to randomly update scores
- Watch real-time updates

### 5. Verify Points Calculation

Check the standings page to see if points are calculated correctly:
- Exact score: 3 points
- Correct result (win/draw): 1 point
- Wrong result: 0 points

---

## 🔧 Troubleshooting

### Local Supabase won't start

**Problem:** Docker not running
**Solution:** Start Docker Desktop

**Problem:** Port conflicts
**Solution:** 
```bash
supabase stop
supabase start
```

### Can't connect to local database

**Problem:** Wrong environment variables
**Solution:** Check `.env.local` has correct values from `supabase start` output

### Migrations fail

**Problem:** Schema conflicts
**Solution:**
```bash
supabase db reset --force
```

---

## 📊 Sample Test Data

Want to populate with realistic test data? Run this in SQL Editor:

```sql
-- This is already done by migration 004, but you can modify teams
-- Update playoff matches with current teams
UPDATE matches 
SET home_team = 'Real Madrid', away_team = 'PSG'
WHERE round = 'PLAYOFF' AND tie_id = 'PLAYOFF-TIE-4' AND leg = 1;
```

---

## 🎮 Quick Start for Testing

**Fastest way to start testing:**

```bash
# 1. Start local Supabase
supabase start

# 2. Copy the API URL and anon key to .env.local

# 3. Reset database with all migrations
supabase db reset

# 4. Start your app
npm run dev

# 5. Open test page
# http://localhost:5173/test-live

# 6. Click "Simulate Goal" and watch real-time updates!
```

---

## 🔄 Switching Between Local and Hosted

**Use Local:**
- Rename `.env` to `.env.hosted`
- Rename `.env.local` to `.env`

**Use Hosted:**
- Rename `.env` to `.env.local`
- Rename `.env.hosted` to `.env`

Or use environment-specific files and update your Vite config.

