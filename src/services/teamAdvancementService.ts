/**
 * Team Advancement Service
 * Handles advancing teams from one round to the next in the knockout stages
 */

import { supabase } from '@/lib/supabase';
import { groupMatchesIntoTies, type Tie } from '@/utils/tieUtils';
import type { Match } from '@/types/database';

// Round progression mapping
const ROUND_PROGRESSION: Record<string, string> = {
  PLAYOFF: 'R16',
  R16: 'QF',
  QF: 'SF',
  SF: 'FINAL',
};

export const teamAdvancementService = {
  /**
   * Get all winners from a completed round
   * Returns array of team names that won their ties
   */
  async getRoundWinners(round: string): Promise<string[]> {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('round', round);

    if (error || !matches) {
      throw new Error(`Failed to fetch matches for round ${round}`);
    }

    const ties = groupMatchesIntoTies(matches);
    const winners: string[] = [];

    for (const tie of ties) {
      if (tie.isCompleted && tie.winner) {
        winners.push(tie.winner);
      }
    }

    return winners;
  },

  /**
   * Check if a round is fully completed
   */
  async isRoundComplete(round: string): Promise<boolean> {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('round', round);

    if (error || !matches) return false;

    const ties = groupMatchesIntoTies(matches);
    return ties.every((tie) => tie.isCompleted && tie.winner !== null);
  },

  /**
   * Get TBD matches for a specific round
   */
  async getTBDMatches(round: string): Promise<Match[]> {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('round', round)
      .or('home_team.ilike.%TBD%,away_team.ilike.%TBD%');

    if (error) throw error;
    return matches || [];
  },

  /**
   * Advance a team to a specific match in the next round
   * @param matchId - The match ID to update
   * @param team - The team name to advance
   * @param position - 'home' or 'away'
   */
  async advanceTeamToMatch(
    matchId: string,
    team: string,
    position: 'home' | 'away'
  ): Promise<Match> {
    const updateField = position === 'home' ? 'home_team' : 'away_team';

    const { data, error } = await supabase
      .from('matches')
      .update({ [updateField]: team })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Automatically advance winners from a completed round to the next round
   * This works for predetermined matchups (no draw needed)
   * 
   * @param fromRound - The completed round (e.g., 'PLAYOFF')
   * @param matchupMapping - Optional mapping of tie winners to next round matches
   *                        Format: { 'PLAYOFF-TIE-1': { nextMatchTieId: 'R16-TIE-1', position: 'home' } }
   */
  async advanceWinnersToNextRound(
    fromRound: string,
    matchupMapping?: Record<string, { nextMatchTieId: string; position: 'home' | 'away' }>
  ): Promise<{ updated: number; winners: string[] }> {
    // Check if round is complete
    const isComplete = await this.isRoundComplete(fromRound);
    if (!isComplete) {
      throw new Error(`Round ${fromRound} is not yet complete`);
    }

    // Get winners
    const { data: fromMatches, error: fromError } = await supabase
      .from('matches')
      .select('*')
      .eq('round', fromRound);

    if (fromError || !fromMatches) {
      throw new Error(`Failed to fetch matches for round ${fromRound}`);
    }

    const ties = groupMatchesIntoTies(fromMatches);
    const toRound = ROUND_PROGRESSION[fromRound];

    if (!toRound) {
      throw new Error(`No next round defined for ${fromRound}`);
    }

    const winners: string[] = [];
    let updated = 0;

    // If mapping provided, use it to advance teams
    if (matchupMapping) {
      for (const tie of ties) {
        if (!tie.winner || !tie.id) continue;

        const mapping = matchupMapping[tie.id];
        if (!mapping) continue;

        // Find the next round match by tie_id
        const { data: nextMatches } = await supabase
          .from('matches')
          .select('*')
          .eq('tie_id', mapping.nextMatchTieId)
          .eq('leg', 1) // Update leg 1 first
          .single();

        if (nextMatches) {
          await this.advanceTeamToMatch(nextMatches.id, tie.winner, mapping.position);
          winners.push(tie.winner);
          updated++;
        }
      }
    }

    return { updated, winners };
  },
};

