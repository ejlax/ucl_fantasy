/**
 * Real-time match updates using Supabase Realtime (WebSocket)
 * Provides instant updates when match scores change in the database
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/utils/constants';
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
 * - ESPN polling (every 10s during live matches)
 * - Auto-invalidates standings
 */
export function useLiveMatchUpdates(leagueId?: string) {
  const queryClient = useQueryClient();

  // Enable Realtime subscriptions
  useRealtimeMatches();
  useRealtimeStandings(leagueId);

  useEffect(() => {
    // Set up aggressive polling during live matches
    const interval = setInterval(() => {
      // Check if there are live matches
      const liveMatches = queryClient.getQueryData<Match[]>([
        QUERY_KEYS.MATCHES,
      ]);

      const hasLiveMatches = liveMatches?.some(
        (match) => !match.is_completed && match.home_score !== null
      );

      if (hasLiveMatches) {
        console.log('🔄 Polling for live match updates...');
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESPN_MATCHES] });
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [queryClient]);
}

