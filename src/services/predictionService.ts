import { supabase } from '@/lib/supabase';
import type { Prediction, PredictionWithMatch, Match, LeagueSettings } from '@/types/database';
import { arePredictionsLocked } from '@/utils/dateUtils';
import { matchService } from './matchService';
import { groupMatchesIntoTies, isTwoLegRound } from '@/utils/tieUtils';
import { BONUS_POINTS } from '@/utils/constants';

export const predictionService = {
  /**
   * Create or update a prediction
   */
  async savePrediction(
    leagueId: string,
    userId: string,
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ): Promise<Prediction> {
    // Check if predictions are locked
    const match = await matchService.getMatchById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (arePredictionsLocked(match.match_date)) {
      throw new Error('Predictions are locked for this match');
    }

    // Try to update existing prediction first
    const { data: existing } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .single();

    if (existing) {
      // Update existing prediction
      const { data, error } = await supabase
        .from('predictions')
        .update({
          predicted_home_score: predictedHomeScore,
          predicted_away_score: predictedAwayScore,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new prediction
      const { data, error } = await supabase
        .from('predictions')
        .insert({
          league_id: leagueId,
          user_id: userId,
          match_id: matchId,
          predicted_home_score: predictedHomeScore,
          predicted_away_score: predictedAwayScore,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  /**
   * Admin override: Create or update a prediction even after match has started
   * Only league owners/commissioners should be able to call this
   */
  async savePredictionAdminOverride(
    leagueId: string,
    userId: string,
    matchId: string,
    predictedHomeScore: number,
    predictedAwayScore: number
  ): Promise<Prediction> {
    // Verify match exists
    const match = await matchService.getMatchById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Try to update existing prediction first
    const { data: existing } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .single();

    if (existing) {
      // Update existing prediction
      const { data, error } = await supabase
        .from('predictions')
        .update({
          predicted_home_score: predictedHomeScore,
          predicted_away_score: predictedAwayScore,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new prediction
      const { data, error } = await supabase
        .from('predictions')
        .insert({
          league_id: leagueId,
          user_id: userId,
          match_id: matchId,
          predicted_home_score: predictedHomeScore,
          predicted_away_score: predictedAwayScore,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  /**
   * Get user's predictions for a league
   */
  async getUserPredictions(leagueId: string, userId: string): Promise<PredictionWithMatch[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select(
        `
        *,
        match:match_id (*)
      `
      )
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all predictions for a league (all users, all matches)
   */
  async getLeaguePredictions(leagueId: string): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all predictions for a match in a league
   */
  async getMatchPredictions(leagueId: string, matchId: string): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('match_id', matchId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a specific prediction
   */
  async getPrediction(
    leagueId: string,
    userId: string,
    matchId: string
  ): Promise<Prediction | null> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Calculate points for a prediction
   */
  calculatePoints(
    predictedHomeScore: number,
    predictedAwayScore: number,
    actualHomeScore: number,
    actualAwayScore: number,
    pointsExactScore: number = 3,
    pointsCorrectResult: number = 1
  ): number {
    // Exact score
    if (predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore) {
      return pointsExactScore;
    }

    // Correct result (winner or draw)
    const predictedResult =
      predictedHomeScore > predictedAwayScore
        ? 'home'
        : predictedHomeScore < predictedAwayScore
          ? 'away'
          : 'draw';

    const actualResult =
      actualHomeScore > actualAwayScore
        ? 'home'
        : actualHomeScore < actualAwayScore
          ? 'away'
          : 'draw';

    if (predictedResult === actualResult) {
      return pointsCorrectResult;
    }

    return 0;
  },

  /**
   * Update points for a prediction after match completion
   */
  async updatePredictionPoints(predictionId: string, points: number): Promise<Prediction> {
    const { data, error } = await supabase
      .from('predictions')
      .update({ points_earned: points })
      .eq('id', predictionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Calculate and update points for all predictions of a match
   */
  async calculateMatchPredictionPoints(
    leagueId: string,
    matchId: string,
    actualHomeScore: number,
    actualAwayScore: number
  ): Promise<void> {
    const predictions = await this.getMatchPredictions(leagueId, matchId);

    for (const prediction of predictions) {
      const points = this.calculatePoints(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
        actualHomeScore,
        actualAwayScore
      );

      await this.updatePredictionPoints(prediction.id, points);
    }
  },

  /**
   * Calculate tie winner bonus for a user
   * Awards bonus points if user correctly predicted which team advances from a two-leg tie
   */
  async calculateTieWinnerBonus(
    leagueId: string,
    userId: string,
    tieId: string,
    bonusPoints: number = BONUS_POINTS.TIE_WINNER
  ): Promise<number> {
    // Get both matches in the tie
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('tie_id', tieId)
      .order('leg', { ascending: true });

    if (matchesError || !matches || matches.length !== 2) {
      return 0;
    }

    const [leg1, leg2] = matches;

    // Check if both legs are completed
    if (!leg1.is_completed || !leg2.is_completed) {
      return 0;
    }

    // Calculate actual aggregate winner using tie utils
    const ties = groupMatchesIntoTies(matches);
    if (ties.length === 0 || !ties[0].winner) {
      return 0;
    }

    const actualWinner = ties[0].winner;

    // Get user's predictions for both legs
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .in('match_id', [leg1.id, leg2.id]);

    if (predictionsError || !predictions || predictions.length !== 2) {
      return 0;
    }

    // Find predictions for each leg
    const leg1Prediction = predictions.find((p) => p.match_id === leg1.id);
    const leg2Prediction = predictions.find((p) => p.match_id === leg2.id);

    if (!leg1Prediction || !leg2Prediction) {
      return 0;
    }

    // Calculate predicted aggregate scores
    // Leg 1: team1 (home) vs team2 (away)
    const team1 = leg1.home_team;
    const team2 = leg1.away_team;

    const predictedTeam1Leg1 = leg1Prediction.predicted_home_score;
    const predictedTeam2Leg1 = leg1Prediction.predicted_away_score;

    // Leg 2: team2 (home) vs team1 (away) - teams swap
    const predictedTeam1Leg2 = leg2Prediction.predicted_away_score;
    const predictedTeam2Leg2 = leg2Prediction.predicted_home_score;

    const predictedTeam1Aggregate = predictedTeam1Leg1 + predictedTeam1Leg2;
    const predictedTeam2Aggregate = predictedTeam2Leg1 + predictedTeam2Leg2;

    // Determine predicted winner
    let predictedWinner: string | null = null;
    if (predictedTeam1Aggregate > predictedTeam2Aggregate) {
      predictedWinner = team1;
    } else if (predictedTeam2Aggregate > predictedTeam1Aggregate) {
      predictedWinner = team2;
    } else {
      // If aggregate tied, use away goals rule
      const predictedTeam1AwayGoals = predictedTeam1Leg2;
      const predictedTeam2AwayGoals = predictedTeam2Leg1;

      if (predictedTeam1AwayGoals > predictedTeam2AwayGoals) {
        predictedWinner = team1;
      } else if (predictedTeam2AwayGoals > predictedTeam1AwayGoals) {
        predictedWinner = team2;
      }
    }

    // Award bonus if predicted winner matches actual winner
    return predictedWinner === actualWinner ? bonusPoints : 0;
  },

  /**
   * Calculate round winner bonus for a user
   * Awards bonus points if user correctly predicted all winners in a round
   */
  async calculateRoundWinnerBonus(
    leagueId: string,
    userId: string,
    round: string,
    bonusPoints: number
  ): Promise<number> {
    // Only calculate for two-leg rounds
    if (!isTwoLegRound(round)) {
      return 0;
    }

    // Get all matches in the round
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('round', round);

    if (matchesError || !matches) {
      return 0;
    }

    // Group into ties
    const ties = groupMatchesIntoTies(matches);

    // Check if all ties are completed
    const allCompleted = ties.every((tie) => tie.isCompleted);
    if (!allCompleted) {
      return 0;
    }

    // Get all user predictions for this round
    const matchIds = matches.map((m) => m.id);
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .in('match_id', matchIds);

    if (predictionsError || !predictions) {
      return 0;
    }

    // Check each tie to see if user predicted the winner correctly
    let correctWinners = 0;
    let totalTies = 0;

    for (const tie of ties) {
      if (!tie.winner || !tie.leg1Match || !tie.leg2Match) {
        continue;
      }

      totalTies++;

      // Get predictions for both legs
      const leg1Prediction = predictions.find((p) => p.match_id === tie.leg1Match!.id);
      const leg2Prediction = predictions.find((p) => p.match_id === tie.leg2Match!.id);

      if (!leg1Prediction || !leg2Prediction) {
        continue; // User didn't predict both legs
      }

      // Calculate predicted aggregate
      const team1 = tie.team1;
      const team2 = tie.team2;

      const predictedTeam1Aggregate =
        leg1Prediction.predicted_home_score + leg2Prediction.predicted_away_score;
      const predictedTeam2Aggregate =
        leg1Prediction.predicted_away_score + leg2Prediction.predicted_home_score;

      let predictedWinner: string | null = null;
      if (predictedTeam1Aggregate > predictedTeam2Aggregate) {
        predictedWinner = team1;
      } else if (predictedTeam2Aggregate > predictedTeam1Aggregate) {
        predictedWinner = team2;
      } else {
        // Away goals rule
        const predictedTeam1AwayGoals = leg2Prediction.predicted_away_score;
        const predictedTeam2AwayGoals = leg1Prediction.predicted_away_score;

        if (predictedTeam1AwayGoals > predictedTeam2AwayGoals) {
          predictedWinner = team1;
        } else if (predictedTeam2AwayGoals > predictedTeam1AwayGoals) {
          predictedWinner = team2;
        }
      }

      if (predictedWinner === tie.winner) {
        correctWinners++;
      }
    }

    // Award bonus only if user got ALL winners correct
    return correctWinners === totalTies && totalTies > 0 ? bonusPoints : 0;
  },
};
