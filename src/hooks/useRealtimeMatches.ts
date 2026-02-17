/**
 * Real-time match updates using Supabase Realtime (WebSocket)
 * Provides instant updates when match scores change in the database
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
import { matchSyncService } from '@/services/matchSyncService';
import { espnApiService } from '@/services/espnApiService';
import type { Match } from '@/types/database';

/**
 * Subscribe to real-time match updates
 * Automatically updates React Query cache when matches change
 */
export function useRealtimeMatches() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔴 Setting up Realtime subscription for matches...');

    // Create a channel for match updates
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          console.log('⚡ Match updated via Realtime:', payload.new);

          const updatedMatch = payload.new as Match;

          // Invalidate all match-related queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });

          // Optionally update the cache directly for instant UI update
          queryClient.setQueriesData<Match[]>(
            { queryKey: [QUERY_KEYS.MATCHES] },
            (oldData) => {
              if (!oldData) return oldData;
              return oldData.map((match) =>
                match.id === updatedMatch.id ? updatedMatch : match
              );
            }
          );

          console.log('✅ Match cache updated for:', updatedMatch.home_team, 'vs', updatedMatch.away_team);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔴 Cleaning up Realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

/**
 * Subscribe to real-time standings updates
 * Automatically updates when predictions or match scores change
 */
export function useRealtimeStandings(leagueId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leagueId) return;

    console.log('🔴 Setting up Realtime subscription for standings...');

    // Listen to prediction updates (affects standings)
    const predictionsChannel = supabase
      .channel(`predictions-${leagueId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'predictions',
          filter: `league_id=eq.${leagueId}`,
        },
        (payload) => {
          console.log('⚡ Prediction updated via Realtime:', payload);

          // Invalidate standings to trigger recalculation
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.STANDINGS, leagueId]
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Predictions Realtime status:', status);
      });

    // Cleanup
    return () => {
      console.log('🔴 Cleaning up Realtime subscription for standings...');
      supabase.removeChannel(predictionsChannel);
    };
  }, [leagueId, queryClient]);
}

/**
 * Combined hook for live match experience
 * - Realtime WebSocket updates (instant)
 * - ESPN polling and sync (every 10s during live matches)
 * - Auto-invalidates standings
 */
export function useLiveMatchUpdates(leagueId?: string) {
  const queryClient = useQueryClient();
  const [allLeagueIds, setAllLeagueIds] = useState<string[]>([]);

  // Enable Realtime subscriptions
  useRealtimeMatches();
  useRealtimeStandings(leagueId);

  // Fetch all league IDs once for points calculation
  useEffect(() => {
    async function fetchLeagueIds() {
      try {
        const { data: leagues } = await supabase
          .from('leagues')
          .select('id');

        if (leagues) {
          setAllLeagueIds(leagues.map(l => l.id));
        }
      } catch (error) {
        console.error('Error fetching league IDs:', error);
      }
    }

    fetchLeagueIds();
  }, []);

  useEffect(() => {
    let isSyncing = false;

    // Set up aggressive polling and syncing during live/completed matches
    const interval = setInterval(async () => {
      if (isSyncing) return; // Prevent concurrent syncs

      isSyncing = true;

      try {
        // Check ESPN for live and completed matches
        const espnLiveMatches = await espnApiService.getLiveMatches();
        const espnCompletedMatches = await espnApiService.getCompletedMatches();

        let totalUpdated = 0;

        // Sync live matches
        if (espnLiveMatches.length > 0) {
          console.log(`🔴 Found ${espnLiveMatches.length} live matches on ESPN, syncing scores...`);
          const liveUpdatedIds = await matchSyncService.syncLiveMatches();
          totalUpdated += liveUpdatedIds.length;
        }

        // Sync completed matches (mark as completed and calculate points)
        if (espnCompletedMatches.length > 0) {
          console.log(`✅ Found ${espnCompletedMatches.length} completed matches on ESPN, marking as complete...`);
          const completedUpdatedIds = await matchSyncService.syncCompletedMatches();

          if (completedUpdatedIds.length > 0) {
            console.log(`🎯 ${completedUpdatedIds.length} matches marked as completed, calculating points...`);

            // Calculate points for ALL leagues
            if (allLeagueIds.length > 0) {
              await matchSyncService.calculatePointsForCompletedMatches(allLeagueIds);
              console.log(`📊 Points calculated for ${allLeagueIds.length} league(s)`);

              // Invalidate standings to show updated points
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STANDINGS] });
              queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PREDICTIONS] });
            }

            totalUpdated += completedUpdatedIds.length;
          }
        }

        // Invalidate queries if anything was updated
        if (totalUpdated > 0) {
          console.log(`✅ Total ${totalUpdated} matches synced from ESPN`);
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESPN_MATCHES] });
        }
      } catch (error) {
        console.error('❌ Error syncing matches:', error);
      } finally {
        isSyncing = false;
      }
    }, 10000); // Sync every 10 seconds

    return () => clearInterval(interval);
  }, [queryClient, allLeagueIds]);
}

