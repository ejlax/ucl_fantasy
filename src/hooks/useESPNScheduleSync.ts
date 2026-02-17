/**
 * React hooks for ESPN Schedule sync operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { espnScheduleService } from '@/services/espnScheduleService';
import type { Match } from '@/types/database';

interface SyncResult {
  updated: number;
  matches: Match[];
}

/**
 * Hook to sync playoff matches from ESPN
 */
export function useSyncPlayoffMatches() {
  const queryClient = useQueryClient();

  return useMutation<SyncResult, Error>({
    mutationFn: () => espnScheduleService.syncPlayoffMatches(),
    onSuccess: (data) => {
      // Invalidate matches query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      console.log(`✅ Synced ${data.updated} playoff matches from ESPN`);
    },
    onError: (error) => {
      console.error('Failed to sync playoff matches:', error);
    },
  });
}

/**
 * Hook to sync R16 matches from ESPN
 */
export function useSyncR16Matches() {
  const queryClient = useQueryClient();

  return useMutation<SyncResult, Error>({
    mutationFn: () => espnScheduleService.syncR16Matches(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      console.log(`✅ Synced ${data.updated} R16 matches from ESPN`);
    },
    onError: (error) => {
      console.error('Failed to sync R16 matches:', error);
    },
  });
}

/**
 * Hook to sync custom date range from ESPN
 */
export function useSyncESPNSchedule() {
  const queryClient = useQueryClient();

  return useMutation<SyncResult, Error, { startDate: string; endDate: string }>({
    mutationFn: ({ startDate, endDate }) => 
      espnScheduleService.syncScheduleToDatabase(startDate, endDate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      console.log(`✅ Synced ${data.updated} matches from ESPN`);
    },
    onError: (error) => {
      console.error('Failed to sync ESPN schedule:', error);
    },
  });
}

