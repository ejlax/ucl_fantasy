import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictionService } from '@/services/predictionService';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * Hook to fetch user's predictions for a league
 */
export function useUserPredictions(leagueId: string, userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PREDICTIONS, 'league', leagueId, 'user', userId],
    queryFn: () => predictionService.getUserPredictions(leagueId, userId),
    enabled: !!leagueId && !!userId,
  });
}

/**
 * Hook to fetch all predictions for a match
 */
export function useMatchPredictions(leagueId: string, matchId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PREDICTIONS, 'league', leagueId, 'match', matchId],
    queryFn: () => predictionService.getMatchPredictions(leagueId, matchId),
    enabled: !!leagueId && !!matchId,
  });
}

/**
 * Hook to fetch a specific prediction
 */
export function usePrediction(leagueId: string, userId: string, matchId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PREDICTIONS, 'league', leagueId, 'user', userId, 'match', matchId],
    queryFn: () => predictionService.getPrediction(leagueId, userId, matchId),
    enabled: !!leagueId && !!userId && !!matchId,
  });
}

/**
 * Hook to save a prediction
 */
export function useSavePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leagueId,
      userId,
      matchId,
      predictedHomeScore,
      predictedAwayScore,
    }: {
      leagueId: string;
      userId: string;
      matchId: string;
      predictedHomeScore: number;
      predictedAwayScore: number;
    }) =>
      predictionService.savePrediction(
        leagueId,
        userId,
        matchId,
        predictedHomeScore,
        predictedAwayScore
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PREDICTIONS, 'league', variables.leagueId],
      });
    },
  });
}

/**
 * Hook to save a prediction with admin override (bypasses lock check)
 * Only league owners/commissioners should use this
 */
export function useSavePredictionAdminOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leagueId,
      userId,
      matchId,
      predictedHomeScore,
      predictedAwayScore,
    }: {
      leagueId: string;
      userId: string;
      matchId: string;
      predictedHomeScore: number;
      predictedAwayScore: number;
    }) =>
      predictionService.savePredictionAdminOverride(
        leagueId,
        userId,
        matchId,
        predictedHomeScore,
        predictedAwayScore
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PREDICTIONS, 'league', variables.leagueId],
      });
    },
  });
}

/**
 * Hook to calculate match prediction points (admin only)
 */
export function useCalculateMatchPredictionPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leagueId,
      matchId,
      actualHomeScore,
      actualAwayScore,
    }: {
      leagueId: string;
      matchId: string;
      actualHomeScore: number;
      actualAwayScore: number;
    }) =>
      predictionService.calculateMatchPredictionPoints(
        leagueId,
        matchId,
        actualHomeScore,
        actualAwayScore
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PREDICTIONS, 'league', variables.leagueId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.STANDINGS, variables.leagueId],
      });
    },
  });
}
