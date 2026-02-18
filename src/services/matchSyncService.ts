/**
 * Match Sync Service
 * Syncs match data from ESPN API to our Supabase database
 */

import { supabase } from '@/lib/supabase';
import { espnApiService, ESPNMatch } from './espnApiService';
import { matchService } from './matchService';
import { predictionService } from './predictionService';
import type { Match } from '@/types/database';

export const matchSyncService = {
  /**
   * Sync completed match scores from ESPN to database
   * Returns array of match IDs that were updated
   */
  async syncCompletedMatches(): Promise<string[]> {
    const espnMatches = await espnApiService.getCompletedMatches();
    const updatedMatchIds: string[] = [];

    for (const espnMatch of espnMatches) {
      try {
        // Find matching database match by team names and date
        const homeTeam = espnApiService.mapTeamName(espnMatch.homeTeam.displayName);
        const awayTeam = espnApiService.mapTeamName(espnMatch.awayTeam.displayName);

        // Get all matches from database
        const { data: dbMatches, error } = await supabase
          .from('matches')
          .select('*')
          .eq('home_team', homeTeam)
          .eq('away_team', awayTeam);

        if (error || !dbMatches || dbMatches.length === 0) {
          console.warn(`No database match found for ${homeTeam} vs ${awayTeam}`);
          continue;
        }

        // Use the first match (should only be one per tie leg)
        const dbMatch = dbMatches[0];

        // Only update if match is completed in ESPN but not in our DB
        if (espnMatch.status.completed && !dbMatch.is_completed) {
          const homeScore = parseInt(espnMatch.homeTeam.score || '0');
          const awayScore = parseInt(espnMatch.awayTeam.score || '0');

          // Update match score
          await matchService.updateMatchScore(dbMatch.id, homeScore, awayScore, true);

          updatedMatchIds.push(dbMatch.id);

          console.log(
            `✅ Updated match: ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`
          );
        }
      } catch (err) {
        console.error(`Error syncing match ${espnMatch.name}:`, err);
      }
    }

    return updatedMatchIds;
  },

  /**
   * Sync live match scores (updates scores but doesn't mark as completed)
   */
  async syncLiveMatches(): Promise<string[]> {
    const espnMatches = await espnApiService.getLiveMatches();
    const updatedMatchIds: string[] = [];

    console.log(`🔍 syncLiveMatches: Processing ${espnMatches.length} live matches`);

    for (const espnMatch of espnMatches) {
      try {
        // Log raw ESPN data
        console.log(`📡 ESPN Raw Data:`, {
          homeTeamRaw: espnMatch.homeTeam.displayName,
          awayTeamRaw: espnMatch.awayTeam.displayName,
          homeScoreRaw: espnMatch.homeTeam.score,
          awayScoreRaw: espnMatch.awayTeam.score,
          status: espnMatch.status,
        });

        const homeTeam = espnApiService.mapTeamName(espnMatch.homeTeam.displayName);
        const awayTeam = espnApiService.mapTeamName(espnMatch.awayTeam.displayName);

        console.log(`🗺️ Mapped team names: "${homeTeam}" vs "${awayTeam}"`);

        const { data: dbMatches, error: dbError } = await supabase
          .from('matches')
          .select('*')
          .eq('home_team', homeTeam)
          .eq('away_team', awayTeam);

        console.log(`🔎 Database query result:`, {
          found: dbMatches?.length || 0,
          error: dbError,
          matches: dbMatches
        });

        if (!dbMatches || dbMatches.length === 0) {
          console.log(`⚠️ No matching match found in DB for: "${homeTeam}" vs "${awayTeam}"`);
          continue;
        }

        const dbMatch = dbMatches[0];
        const homeScore = parseInt(espnMatch.homeTeam.score || '0');
        const awayScore = parseInt(espnMatch.awayTeam.score || '0');

        console.log(`📊 Updating score: ${homeScore}-${awayScore} for match ${dbMatch.id}`);

        // Update score but don't mark as completed yet
        await matchService.updateMatchScore(dbMatch.id, homeScore, awayScore, false);

        updatedMatchIds.push(dbMatch.id);

        console.log(
          `🔴 LIVE: ${homeTeam} ${homeScore}-${awayScore} ${awayTeam} (${espnMatch.status.displayClock})`
        );
      } catch (err) {
        console.error(`Error syncing live match ${espnMatch.name}:`, err);
      }
    }

    return updatedMatchIds;
  },

  /**
   * Calculate prediction points for all completed matches
   */
  async calculatePointsForCompletedMatches(leagueIds: string[]): Promise<void> {
    const espnMatches = await espnApiService.getCompletedMatches();

    for (const espnMatch of espnMatches) {
      try {
        const homeTeam = espnApiService.mapTeamName(espnMatch.homeTeam.displayName);
        const awayTeam = espnApiService.mapTeamName(espnMatch.awayTeam.displayName);

        const { data: dbMatches } = await supabase
          .from('matches')
          .select('*')
          .eq('home_team', homeTeam)
          .eq('away_team', awayTeam)
          .eq('is_completed', true);

        if (!dbMatches || dbMatches.length === 0) continue;

        const dbMatch = dbMatches[0];

        // Calculate points for each league
        for (const leagueId of leagueIds) {
          await predictionService.calculateMatchPredictionPoints(
            leagueId,
            dbMatch.id,
            dbMatch.home_score || 0,
            dbMatch.away_score || 0
          );
        }

        console.log(`📊 Calculated points for ${homeTeam} vs ${awayTeam}`);
      } catch (err) {
        console.error(`Error calculating points for ${espnMatch.name}:`, err);
      }
    }
  },

  /**
   * Full sync: Update live matches, complete finished matches, calculate points
   */
  async fullSync(leagueIds: string[]): Promise<{
    liveUpdates: number;
    completedUpdates: number;
  }> {
    console.log('🔄 Starting full match sync...');

    // Sync live matches first
    const liveUpdates = await this.syncLiveMatches();

    // Sync completed matches
    const completedUpdates = await this.syncCompletedMatches();

    // Calculate points for completed matches
    if (completedUpdates.length > 0) {
      await this.calculatePointsForCompletedMatches(leagueIds);
    }

    console.log(
      `✅ Sync complete: ${liveUpdates.length} live, ${completedUpdates.length} completed`
    );

    return {
      liveUpdates: liveUpdates.length,
      completedUpdates: completedUpdates.length,
    };
  },
};

