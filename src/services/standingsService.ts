import { supabase } from '@/lib/supabase';
import type { StandingsEntry, User, LeagueSettings, Match } from '@/types/database';
import { predictionService } from './predictionService';
import { groupMatchesIntoTies, isTwoLegRound } from '@/utils/tieUtils';
import { BONUS_POINTS } from '@/utils/constants';

export const standingsService = {
  /**
   * Get standings for a league
   */
  async getLeagueStandings(leagueId: string): Promise<StandingsEntry[]> {
    // Get league settings to check if bonus points are enabled
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('settings')
      .eq('id', leagueId)
      .single();

    if (leagueError) throw leagueError;

    const settings = (league?.settings as LeagueSettings) || {};

    // Get all predictions with points for this league
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select(
        `
        user_id,
        points_earned,
        predicted_home_score,
        predicted_away_score,
        match:match_id (
          home_score,
          away_score
        )
      `
      )
      .eq('league_id', leagueId)
      .not('points_earned', 'is', null);

    if (predictionsError) throw predictionsError;

    // Get all league members
    const { data: members, error: membersError } = await supabase
      .from('league_members')
      .select(
        `
        user_id,
        user:user_id (*)
      `
      )
      .eq('league_id', leagueId);

    if (membersError) throw membersError;

    // Calculate standings
    const userStats = new Map<
      string,
      {
        user: User;
        total_points: number;
        correct_predictions: number;
        exact_score_predictions: number;
      }
    >();

    // Initialize all members with 0 points
    members?.forEach((member: any) => {
      userStats.set(member.user_id, {
        user: member.user,
        total_points: 0,
        correct_predictions: 0,
        exact_score_predictions: 0,
      });
    });

    // Calculate stats from predictions
    predictions?.forEach((prediction: any) => {
      const stats = userStats.get(prediction.user_id);
      if (!stats) return;

      const points = prediction.points_earned || 0;
      stats.total_points += points;

      if (points > 0) {
        stats.correct_predictions += 1;
      }

      // Check if exact score (3 points by default)
      if (points === 3) {
        stats.exact_score_predictions += 1;
      }
    });

    // Calculate bonus points if enabled
    if (settings.enable_tie_winner_bonus || settings.enable_round_winner_bonus) {
      await this.calculateBonusPoints(leagueId, userStats, settings);
    }

    // Convert to array and sort
    const standings = Array.from(userStats.entries()).map(([user_id, stats]) => ({
      user_id,
      user: stats.user,
      total_points: stats.total_points,
      correct_predictions: stats.correct_predictions,
      exact_score_predictions: stats.exact_score_predictions,
      rank: 0, // Will be set below
    }));

    // Sort by total points (desc), then by exact scores (desc), then by correct predictions (desc)
    standings.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      if (b.exact_score_predictions !== a.exact_score_predictions) {
        return b.exact_score_predictions - a.exact_score_predictions;
      }
      return b.correct_predictions - a.correct_predictions;
    });

    // Assign ranks
    standings.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return standings;
  },

  /**
   * Get user's rank in a league
   */
  async getUserRank(leagueId: string, userId: string): Promise<number> {
    const standings = await this.getLeagueStandings(leagueId);
    const userEntry = standings.find((entry) => entry.user_id === userId);
    return userEntry?.rank || 0;
  },

  /**
   * Get user's stats in a league
   */
  async getUserStats(leagueId: string, userId: string): Promise<StandingsEntry | null> {
    const standings = await this.getLeagueStandings(leagueId);
    return standings.find((entry) => entry.user_id === userId) || null;
  },

  /**
   * Get top N users in a league
   */
  async getTopUsers(leagueId: string, limit: number = 10): Promise<StandingsEntry[]> {
    const standings = await this.getLeagueStandings(leagueId);
    return standings.slice(0, limit);
  },

  /**
   * Calculate bonus points for all users in a league
   * @private
   */
  async calculateBonusPoints(
    leagueId: string,
    userStats: Map<
      string,
      {
        user: User;
        total_points: number;
        correct_predictions: number;
        exact_score_predictions: number;
      }
    >,
    settings: LeagueSettings
  ): Promise<void> {
    // Get all matches
    const { data: matches, error: matchesError } = await supabase.from('matches').select('*');

    if (matchesError || !matches) return;

    // Group matches by tie_id for tie winner bonus
    if (settings.enable_tie_winner_bonus) {
      const tieWinnerBonus = settings.tie_winner_bonus_points || BONUS_POINTS.TIE_WINNER;
      await this.calculateTieWinnerBonuses(leagueId, matches, userStats, tieWinnerBonus);
    }

    // Calculate round winner bonuses
    if (settings.enable_round_winner_bonus) {
      const bonusPoints = settings.round_winner_bonus_points || {
        r16: BONUS_POINTS.ROUND_WINNER_R16,
        qf: BONUS_POINTS.ROUND_WINNER_QF,
        sf: BONUS_POINTS.ROUND_WINNER_SF,
      };

      await this.calculateRoundWinnerBonuses(leagueId, matches, userStats, bonusPoints);
    }
  },

  /**
   * Calculate tie winner bonuses for all completed ties
   * @private
   */
  async calculateTieWinnerBonuses(
    leagueId: string,
    matches: Match[],
    userStats: Map<string, any>,
    bonusPoints: number
  ): Promise<void> {
    // Group matches into ties
    const ties = groupMatchesIntoTies(matches);

    // Filter for completed ties only
    const completedTies = ties.filter((tie) => tie.isCompleted && tie.winner);

    // Calculate bonus for each user for each completed tie
    for (const [userId] of userStats) {
      for (const tie of completedTies) {
        if (!tie.id) continue;

        const bonus = await predictionService.calculateTieWinnerBonus(
          leagueId,
          userId,
          tie.id,
          bonusPoints
        );

        if (bonus > 0) {
          const stats = userStats.get(userId);
          if (stats) {
            stats.total_points += bonus;
          }
        }
      }
    }
  },

  /**
   * Calculate round winner bonuses for all completed rounds
   * @private
   */
  async calculateRoundWinnerBonuses(
    leagueId: string,
    matches: Match[],
    userStats: Map<string, any>,
    bonusPoints: { r16?: number; qf?: number; sf?: number }
  ): Promise<void> {
    // Check each round
    const rounds = [
      { round: 'R16', bonus: bonusPoints.r16 || BONUS_POINTS.ROUND_WINNER_R16 },
      { round: 'QF', bonus: bonusPoints.qf || BONUS_POINTS.ROUND_WINNER_QF },
      { round: 'SF', bonus: bonusPoints.sf || BONUS_POINTS.ROUND_WINNER_SF },
    ];

    for (const { round, bonus } of rounds) {
      const roundMatches = matches.filter((m) => m.round === round);
      if (roundMatches.length === 0) continue;

      // Check if all matches in round are completed
      const ties = groupMatchesIntoTies(roundMatches);
      const allCompleted = ties.every((tie) => tie.isCompleted);

      if (!allCompleted) continue;

      // Calculate bonus for each user
      for (const [userId] of userStats) {
        const roundBonus = await predictionService.calculateRoundWinnerBonus(
          leagueId,
          userId,
          round,
          bonus
        );

        if (roundBonus > 0) {
          const stats = userStats.get(userId);
          if (stats) {
            stats.total_points += roundBonus;
          }
        }
      }
    }
  },
};
