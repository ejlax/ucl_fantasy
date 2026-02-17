import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * Hook to fetch all matches
 */
export function useMatches() {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES],
    queryFn: () => matchService.getAllMatches(),
  });
}

/**
 * Hook to fetch matches by round
 */
export function useMatchesByRound(round: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, round],
    queryFn: () => matchService.getMatchesByRound(round),
  });
}

/**
 * Hook to fetch a single match
 */
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, matchId],
    queryFn: () => matchService.getMatchById(matchId),
    enabled: !!matchId,
  });
}

/**
 * Hook to fetch upcoming matches
 */
export function useUpcomingMatches() {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'upcoming'],
    queryFn: () => matchService.getUpcomingMatches(),
  });
}

/**
 * Hook to fetch completed matches
 */
export function useCompletedMatches() {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'completed'],
    queryFn: () => matchService.getCompletedMatches(),
  });
}

/**
 * Hook to fetch matches grouped by round
 */
export function useMatchesGroupedByRound() {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'grouped'],
    queryFn: () => matchService.getMatchesGroupedByRound(),
  });
}

/**
 * Hook to update match score (admin only)
 */
export function useUpdateMatchScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      homeScore,
      awayScore,
      isCompleted,
    }: {
      matchId: string;
      homeScore: number;
      awayScore: number;
      isCompleted?: boolean;
    }) => matchService.updateMatchScore(matchId, homeScore, awayScore, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
    },
  });
}

/**
 * Hook to update match teams
 */
export function useUpdateMatchTeams() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      homeTeam,
      awayTeam,
    }: {
      matchId: string;
      homeTeam: string;
      awayTeam: string;
    }) => matchService.updateMatchTeams(matchId, homeTeam, awayTeam),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
    },
  });
}
