import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leagueService } from '@/services/leagueService';
import { QUERY_KEYS } from '@/utils/constants';

/**
 * Hook to fetch user's leagues
 */
export function useUserLeagues(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.LEAGUES, 'user', userId],
    queryFn: () => leagueService.getUserLeagues(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch a single league
 */
export function useLeague(leagueId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.LEAGUES, leagueId],
    queryFn: () => leagueService.getLeagueById(leagueId),
    enabled: !!leagueId,
  });
}

/**
 * Hook to fetch league with members
 */
export function useLeagueWithMembers(leagueId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.LEAGUES, leagueId, 'members'],
    queryFn: () => leagueService.getLeagueWithMembers(leagueId),
    enabled: !!leagueId,
  });
}

/**
 * Hook to fetch league by invite code
 */
export function useLeagueByInviteCode(inviteCode: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.LEAGUES, 'invite', inviteCode],
    queryFn: () => leagueService.getLeagueByInviteCode(inviteCode),
    enabled: !!inviteCode,
  });
}

/**
 * Hook to create a league
 */
export function useCreateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
      ownerId,
      settings,
    }: {
      name: string;
      description: string | null;
      ownerId: string;
      settings?: Record<string, any>;
    }) => leagueService.createLeague(name, description, ownerId, settings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES, 'user', variables.ownerId] });
    },
  });
}

/**
 * Hook to join a league
 */
export function useJoinLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leagueId, userId }: { leagueId: string; userId: string }) =>
      leagueService.joinLeague(leagueId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES, 'user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES, variables.leagueId] });
    },
  });
}

/**
 * Hook to join league by invite code
 */
export function useJoinLeagueByInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteCode, userId }: { inviteCode: string; userId: string }) =>
      leagueService.joinLeagueByInviteCode(inviteCode, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES, 'user', variables.userId] });
    },
  });
}

/**
 * Hook to leave a league
 */
export function useLeaveLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leagueId, userId }: { leagueId: string; userId: string }) =>
      leagueService.leaveLeague(leagueId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES, 'user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES, variables.leagueId] });
    },
  });
}

/**
 * Hook to update league
 */
export function useUpdateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leagueId,
      updates,
    }: {
      leagueId: string;
      updates: {
        name?: string;
        description?: string | null;
        settings?: Record<string, any>;
      };
    }) => leagueService.updateLeague(leagueId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES, variables.leagueId] });
    },
  });
}

/**
 * Hook to delete league
 */
export function useDeleteLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leagueId: string) => leagueService.deleteLeague(leagueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAGUES] });
    },
  });
}
