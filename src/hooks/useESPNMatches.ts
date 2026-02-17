import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { espnApiService, ESPNMatch } from '@/services/espnApiService';
import { matchSyncService } from '@/services/matchSyncService';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * Hook to fetch live ESPN matches
 * Refetches every 10 seconds when there are live matches
 */
export function useESPNLiveMatches() {
  return useQuery({
    queryKey: [QUERY_KEYS.ESPN_MATCHES, 'live'],
    queryFn: () => espnApiService.getLiveMatches(),
    refetchInterval: (data) => {
      // Refetch every 10 seconds if there are live matches
      return data && data.length > 0 ? 10000 : false;
    },
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });
}

/**
 * Hook to fetch all current ESPN matches
 */
export function useESPNCurrentMatches() {
  return useQuery({
    queryKey: [QUERY_KEYS.ESPN_MATCHES, 'current'],
    queryFn: () => espnApiService.getCurrentMatches(),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch completed ESPN matches
 */
export function useESPNCompletedMatches() {
  return useQuery({
    queryKey: [QUERY_KEYS.ESPN_MATCHES, 'completed'],
    queryFn: () => espnApiService.getCompletedMatches(),
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

/**
 * Hook to sync matches from ESPN to database
 */
export function useSyncMatches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leagueIds: string[]) => {
      return matchSyncService.fullSync(leagueIds);
    },
    onSuccess: () => {
      // Invalidate all match-related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PREDICTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STANDINGS] });
    },
  });
}

/**
 * Hook to auto-sync matches at regular intervals
 * Only syncs when there are live matches
 */
export function useAutoSyncMatches(leagueIds: string[], enabled: boolean = true) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEYS.ESPN_MATCHES, 'auto-sync', leagueIds],
    queryFn: async () => {
      const result = await matchSyncService.fullSync(leagueIds);
      return result;
    },
    enabled: enabled && leagueIds.length > 0,
    refetchInterval: 60000, // Sync every minute
    refetchIntervalInBackground: false,
    onSuccess: () => {
      // Invalidate queries after successful sync
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PREDICTIONS] });
    },
  });
}

