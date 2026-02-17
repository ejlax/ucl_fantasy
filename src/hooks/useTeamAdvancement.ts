/**
 * Hooks for managing team advancement through knockout rounds
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamAdvancementService } from '@/services/teamAdvancementService';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * Hook to check if a round is complete
 */
export function useIsRoundComplete(round: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'round-complete', round],
    queryFn: () => teamAdvancementService.isRoundComplete(round),
    enabled: !!round,
  });
}

/**
 * Hook to get winners from a round
 */
export function useRoundWinners(round: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'round-winners', round],
    queryFn: () => teamAdvancementService.getRoundWinners(round),
    enabled: !!round,
  });
}

/**
 * Hook to get TBD matches for a round
 */
export function useTBDMatches(round: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'tbd', round],
    queryFn: () => teamAdvancementService.getTBDMatches(round),
    enabled: !!round,
  });
}

/**
 * Hook to advance a single team to a match
 */
export function useAdvanceTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      team,
      position,
    }: {
      matchId: string;
      team: string;
      position: 'home' | 'away';
    }) => teamAdvancementService.advanceTeamToMatch(matchId, team, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
    },
  });
}

/**
 * Hook to automatically advance all winners from a round
 */
export function useAdvanceWinners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fromRound,
      matchupMapping,
    }: {
      fromRound: string;
      matchupMapping?: Record<string, { nextMatchTieId: string; position: 'home' | 'away' }>;
    }) => teamAdvancementService.advanceWinnersToNextRound(fromRound, matchupMapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PREDICTIONS] });
    },
  });
}

