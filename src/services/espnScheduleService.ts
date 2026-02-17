/**
 * ESPN Schedule Service
 * Syncs upcoming UCL matches from ESPN API to populate TBD matches
 */

import { supabase } from '@/lib/supabase';
import type { Match } from '@/types/database';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions';

// Map ESPN round types to our database rounds
const ROUND_MAPPING: Record<number, string> = {
  13681: 'PLAYOFF', // Knockout Round Playoffs
  13682: 'R16',     // Round of 16
  13683: 'QF',      // Quarter Finals
  13684: 'SF',      // Semi Finals
  13685: 'FINAL',   // Final
};

interface ESPNTeam {
  id: string;
  displayName: string;
  shortDisplayName: string;
  abbreviation: string;
  logo: string;
}

interface ESPNMatch {
  id: string;
  date: string;
  name: string;
  season: {
    type: number; // Round type ID
  };
  competitions: Array<{
    leg?: {
      value: number; // 1 or 2
    };
    competitors: Array<{
      id: string;
      homeAway: 'home' | 'away';
      team: ESPNTeam;
    }>;
  }>;
}

interface ESPNScheduleResponse {
  events: ESPNMatch[];
}

export const espnScheduleService = {
  /**
   * Fetch upcoming matches from ESPN for a specific date range
   */
  async fetchSchedule(startDate: string, endDate: string): Promise<ESPNMatch[]> {
    const url = `${ESPN_API_BASE}/scoreboard?dates=${startDate}-${endDate}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data: ESPNScheduleResponse = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Failed to fetch ESPN schedule:', error);
      throw error;
    }
  },

  /**
   * Sync ESPN schedule to database TBD matches
   * Updates matches with actual team names from ESPN
   */
  async syncScheduleToDatabase(startDate: string, endDate: string): Promise<{
    updated: number;
    matches: Match[];
  }> {
    // Fetch ESPN schedule
    const espnMatches = await this.fetchSchedule(startDate, endDate);
    
    const updatedMatches: Match[] = [];
    let updateCount = 0;

    for (const espnMatch of espnMatches) {
      try {
        const competition = espnMatch.competitions[0];
        if (!competition) continue;

        // Get round from ESPN season type
        const round = ROUND_MAPPING[espnMatch.season.type];
        if (!round) continue;

        // Get leg number (default to 1 if not specified)
        const leg = competition.leg?.value || 1;

        // Get teams
        const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
        const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');

        if (!homeCompetitor || !awayCompetitor) continue;

        const homeTeam = homeCompetitor.team.displayName;
        const awayTeam = awayCompetitor.team.displayName;

        // Find matching TBD match in database
        const { data: dbMatches } = await supabase
          .from('matches')
          .select('*')
          .eq('round', round)
          .eq('leg', leg)
          .or('home_team.ilike.%TBD%,away_team.ilike.%TBD%')
          .limit(1);

        if (dbMatches && dbMatches.length > 0) {
          const dbMatch = dbMatches[0];

          // Update match with real team names
          const { data: updated, error } = await supabase
            .from('matches')
            .update({
              home_team: homeTeam,
              away_team: awayTeam,
              match_date: espnMatch.date,
            })
            .eq('id', dbMatch.id)
            .select()
            .single();

          if (!error && updated) {
            updatedMatches.push(updated);
            updateCount++;
            console.log(`✅ Updated ${round} Leg ${leg}: ${homeTeam} vs ${awayTeam}`);
          }
        }
      } catch (error) {
        console.error(`Error syncing match ${espnMatch.id}:`, error);
      }
    }

    return {
      updated: updateCount,
      matches: updatedMatches,
    };
  },

  /**
   * Get all upcoming playoff matches (Feb 17-25, 2026)
   */
  async syncPlayoffMatches(): Promise<{ updated: number; matches: Match[] }> {
    return this.syncScheduleToDatabase('20260217', '20260225');
  },

  /**
   * Get all upcoming R16 matches (Mar 10-19, 2026)
   */
  async syncR16Matches(): Promise<{ updated: number; matches: Match[] }> {
    return this.syncScheduleToDatabase('20260310', '20260319');
  },
};

