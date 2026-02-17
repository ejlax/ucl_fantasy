import { useQuery } from '@tanstack/react-query';
import { standingsService } from '@/services/standingsService';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * Hook to fetch league standings
 */
export function useLeagueStandings(leagueId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.STANDINGS, leagueId],
    queryFn: () => standingsService.getLeagueStandings(leagueId),
    enabled: !!leagueId,
  });
}

/**
 * Hook to fetch user's rank in a league
 */
export function useUserRank(leagueId: string, userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.STANDINGS, leagueId, 'user', userId, 'rank'],
    queryFn: () => standingsService.getUserRank(leagueId, userId),
    enabled: !!leagueId && !!userId,
  });
}

/**
 * Hook to fetch user's stats in a league
 */
export function useUserStats(leagueId: string, userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.STANDINGS, leagueId, 'user', userId, 'stats'],
    queryFn: () => standingsService.getUserStats(leagueId, userId),
    enabled: !!leagueId && !!userId,
  });
}

/**
 * Hook to fetch top users in a league
 */
export function useTopUsers(leagueId: string, limit: number = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.STANDINGS, leagueId, 'top', limit],
    queryFn: () => standingsService.getTopUsers(leagueId, limit),
    enabled: !!leagueId,
  });
}
