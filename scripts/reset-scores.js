#!/usr/bin/env node

/**
 * Reset Scores Script
 * 
 * This script resets all match scores and prediction points in your Supabase database.
 * 
 * Usage:
 *   node scripts/reset-scores.js
 *   npm run reset-scores
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Also try .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env or .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetScores() {
  console.log('🔄 Starting score reset...\n');

  try {
    // 1. Get current stats
    console.log('📊 Current database state:');
    const { data: matchesBefore, error: matchesError } = await supabase
      .from('matches')
      .select('id, is_completed');

    if (matchesError) throw matchesError;

    const completedBefore = matchesBefore?.filter(m => m.is_completed).length || 0;
    console.log(`   - Total matches: ${matchesBefore?.length || 0}`);
    console.log(`   - Completed matches: ${completedBefore}`);

    const { data: predictionsBefore, error: predsError } = await supabase
      .from('predictions')
      .select('id, points_earned');

    if (predsError) throw predsError;

    const withPointsBefore = predictionsBefore?.filter(p => p.points_earned !== null).length || 0;
    console.log(`   - Total predictions: ${predictionsBefore?.length || 0}`);
    console.log(`   - Predictions with points: ${withPointsBefore}\n`);

    // 2. Reset match scores
    console.log('⚽ Resetting match scores...');
    const { error: resetMatchesError } = await supabase
      .from('matches')
      .update({
        home_score: 0,
        away_score: 0,
        is_completed: false,
      })
      .not('id', 'is', null); // Update all rows

    if (resetMatchesError) throw resetMatchesError;
    console.log('   ✅ All match scores reset to 0-0\n');

    // 3. Reset prediction points
    console.log('🎯 Resetting prediction points...');
    const { error: resetPointsError } = await supabase
      .from('predictions')
      .update({
        points_earned: null,
      })
      .not('id', 'is', null); // Update all rows

    if (resetPointsError) throw resetPointsError;
    console.log('   ✅ All prediction points cleared\n');

    // 4. Verify reset
    console.log('✅ Verification:');
    const { data: matchesAfter } = await supabase
      .from('matches')
      .select('id, is_completed, home_score, away_score');

    const completedAfter = matchesAfter?.filter(m => m.is_completed).length || 0;
    const withScores = matchesAfter?.filter(m => m.home_score > 0 || m.away_score > 0).length || 0;

    console.log(`   - Completed matches: ${completedAfter} (should be 0)`);
    console.log(`   - Matches with scores: ${withScores} (should be 0)`);

    const { data: predictionsAfter } = await supabase
      .from('predictions')
      .select('id, points_earned');

    const withPointsAfter = predictionsAfter?.filter(p => p.points_earned !== null).length || 0;
    console.log(`   - Predictions with points: ${withPointsAfter} (should be 0)\n`);

    if (completedAfter === 0 && withScores === 0 && withPointsAfter === 0) {
      console.log('🎉 Success! Database reset complete.\n');
      console.log('You can now:');
      console.log('  1. Go to http://localhost:5173/test-live to simulate matches');
      console.log('  2. Go to http://localhost:5173/admin to manually set scores');
      console.log('  3. Make predictions and test the scoring system\n');
    } else {
      console.log('⚠️  Warning: Reset may not be complete. Check the numbers above.\n');
    }

  } catch (error) {
    console.error('❌ Error resetting scores:', error.message);
    process.exit(1);
  }
}

// Run the script
resetScores();

