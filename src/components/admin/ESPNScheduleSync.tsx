/**
 * ESPN Schedule Sync Component
 * Allows admins to sync upcoming matches from ESPN API
 */

import { useState } from 'react';
import { RefreshCw, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSyncPlayoffMatches, useSyncR16Matches } from '@/hooks/useESPNScheduleSync';

export function ESPNScheduleSync() {
  const [lastSyncResult, setLastSyncResult] = useState<{
    round: string;
    updated: number;
    success: boolean;
  } | null>(null);

  const syncPlayoffs = useSyncPlayoffMatches();
  const syncR16 = useSyncR16Matches();

  const handleSyncPlayoffs = async () => {
    try {
      const result = await syncPlayoffs.mutateAsync();
      setLastSyncResult({
        round: 'Playoff',
        updated: result.updated,
        success: true,
      });
    } catch (error) {
      setLastSyncResult({
        round: 'Playoff',
        updated: 0,
        success: false,
      });
    }
  };

  const handleSyncR16 = async () => {
    try {
      const result = await syncR16.mutateAsync();
      setLastSyncResult({
        round: 'Round of 16',
        updated: result.updated,
        success: true,
      });
    } catch (error) {
      setLastSyncResult({
        round: 'Round of 16',
        updated: 0,
        success: false,
      });
    }
  };

  const isLoading = syncPlayoffs.isPending || syncR16.isPending;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">ESPN Schedule Sync</h2>
          <p className="text-sm text-gray-600">
            Sync upcoming matches from ESPN to populate TBD matches
          </p>
        </div>
      </div>

      {/* Sync Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handleSyncPlayoffs}
          disabled={isLoading}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className={`h-5 w-5 ${syncPlayoffs.isPending ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="font-medium">Sync Playoff Matches</div>
              <div className="text-xs text-blue-100">Feb 17-25, 2026</div>
            </div>
          </div>
          {syncPlayoffs.isPending && (
            <span className="text-sm">Syncing...</span>
          )}
        </button>

        <button
          onClick={handleSyncR16}
          disabled={isLoading}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className={`h-5 w-5 ${syncR16.isPending ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="font-medium">Sync Round of 16 Matches</div>
              <div className="text-xs text-purple-100">Mar 10-19, 2026</div>
            </div>
          </div>
          {syncR16.isPending && (
            <span className="text-sm">Syncing...</span>
          )}
        </button>
      </div>

      {/* Result Message */}
      {lastSyncResult && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg ${
            lastSyncResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {lastSyncResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`font-medium ${
                lastSyncResult.success ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {lastSyncResult.success ? 'Sync Successful!' : 'Sync Failed'}
            </p>
            <p
              className={`text-sm mt-1 ${
                lastSyncResult.success ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {lastSyncResult.success
                ? `Updated ${lastSyncResult.updated} ${lastSyncResult.round} match${
                    lastSyncResult.updated !== 1 ? 'es' : ''
                  } from ESPN`
                : `Failed to sync ${lastSyncResult.round} matches. Please try again.`}
            </p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900 font-medium mb-2">How it works:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Fetches upcoming matches from ESPN's official API</li>
          <li>• Updates TBD matches with real team names and dates</li>
          <li>• Automatically matches by round and leg number</li>
          <li>• Refreshes bracket view after sync</li>
        </ul>
      </div>
    </div>
  );
}

