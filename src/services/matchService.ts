import { supabase } from '@/lib/supabase';
import type { Match } from '@/types/database';

export const matchService = {
  /**
   * Get all matches
   */
  async getAllMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get matches by round
   */
  async getMatchesByRound(round: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('round', round)
      .order('match_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single match by ID
   */
  async getMatchById(matchId: string): Promise<Match | null> {
    const { data, error } = await supabase.from('matches').select('*').eq('id', matchId).single();

    if (error) throw error;
    return data;
  },

  /**
   * Get upcoming matches (not yet completed)
   */
  async getUpcomingMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('is_completed', false)
      .order('match_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get completed matches
   */
  async getCompletedMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('is_completed', true)
      .order('match_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update match score (admin only)
   */
  async updateMatchScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
    isCompleted: boolean = true
  ): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        is_completed: isCompleted,
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update match teams (for TBD matches after previous rounds complete)
   */
  async updateMatchTeams(matchId: string, homeTeam: string, awayTeam: string): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .update({
        home_team: homeTeam,
        away_team: awayTeam,
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new match (admin only)
   */
  async createMatch(match: {
    round: string;
    home_team: string;
    away_team: string;
    match_date: string;
  }): Promise<Match> {
    const { data, error } = await supabase.from('matches').insert(match).select().single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a match (admin only)
   */
  async deleteMatch(matchId: string): Promise<void> {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);

    if (error) throw error;
  },

  /**
   * Get matches grouped by round
   */
  async getMatchesGroupedByRound(): Promise<Record<string, Match[]>> {
    const matches = await this.getAllMatches();

    return matches.reduce(
      (acc, match) => {
        if (!acc[match.round]) {
          acc[match.round] = [];
        }
        acc[match.round].push(match);
        return acc;
      },
      {} as Record<string, Match[]>
    );
  },
};
