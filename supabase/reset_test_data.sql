-- ============================================
-- RESET TEST DATA
-- ============================================
-- Use this script to reset your database for testing
-- Run this in Supabase SQL Editor or via CLI

-- ============================================
-- 1. RESET MATCH SCORES
-- ============================================

-- Reset all matches to 0-0 and mark as not completed
UPDATE matches 
SET 
  home_score = 0,
  away_score = 0,
  is_completed = false,
  updated_at = NOW();

-- ============================================
-- 2. RESET PREDICTIONS
-- ============================================

-- Clear all points earned (but keep predictions)
UPDATE predictions 
SET 
  points_earned = NULL,
  updated_at = NOW();

-- Optional: Delete all predictions entirely
-- Uncomment the line below if you want to start fresh
-- DELETE FROM predictions;

-- ============================================
-- 3. VERIFICATION QUERIES
-- ============================================

-- Check matches are reset
SELECT 
  round,
  home_team,
  away_team,
  home_score,
  away_score,
  is_completed,
  match_date
FROM matches 
ORDER BY match_date, round;

-- Check predictions are reset
SELECT 
  COUNT(*) as total_predictions,
  COUNT(points_earned) as predictions_with_points
FROM predictions;

-- Check leagues still exist
SELECT 
  id,
  name,
  owner_id,
  created_at
FROM leagues;

-- ============================================
-- 4. OPTIONAL: SET SOME MATCHES TO "IN PROGRESS"
-- ============================================

-- Uncomment to set playoff matches as in progress for testing
/*
UPDATE matches 
SET 
  is_completed = false,
  home_score = 0,
  away_score = 0
WHERE round = 'PLAYOFF';
*/

-- ============================================
-- 5. OPTIONAL: ADD SAMPLE SCORES FOR TESTING
-- ============================================

-- Uncomment to add some test scores
/*
-- Set first playoff match to 2-1
UPDATE matches 
SET 
  home_score = 2,
  away_score = 1,
  is_completed = true
WHERE round = 'PLAYOFF' 
  AND home_team = 'Galatasaray' 
  AND away_team = 'Juventus'
  AND leg = 1;

-- Set second playoff match to 1-1
UPDATE matches 
SET 
  home_score = 1,
  away_score = 1,
  is_completed = true
WHERE round = 'PLAYOFF' 
  AND home_team = 'Borussia Dortmund' 
  AND away_team = 'Atalanta'
  AND leg = 1;
*/

-- ============================================
-- 6. OPTIONAL: CLEAN UP TEST DATA COMPLETELY
-- ============================================

-- ⚠️ WARNING: This deletes ALL data except matches
-- Uncomment only if you want to completely reset
/*
-- Delete all predictions
DELETE FROM predictions;

-- Delete all league members
DELETE FROM league_members;

-- Delete all leagues
DELETE FROM leagues;

-- Delete all user profiles (keeps auth.users)
DELETE FROM users;
*/

-- ============================================
-- 7. SUMMARY
-- ============================================

SELECT 
  'Matches' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN is_completed THEN 1 END) as completed,
  COUNT(CASE WHEN NOT is_completed THEN 1 END) as pending
FROM matches

UNION ALL

SELECT 
  'Predictions' as table_name,
  COUNT(*) as total_rows,
  COUNT(points_earned) as with_points,
  COUNT(*) - COUNT(points_earned) as without_points
FROM predictions

UNION ALL

SELECT 
  'Leagues' as table_name,
  COUNT(*) as total_rows,
  NULL as col2,
  NULL as col3
FROM leagues

UNION ALL

SELECT 
  'Users' as table_name,
  COUNT(*) as total_rows,
  NULL as col2,
  NULL as col3
FROM users;

-- ============================================
-- DONE! 🎉
-- ============================================
-- Your database is now reset and ready for testing

