import { useState } from 'react';
import { useSyncMatches } from '@/hooks/useESPNMatches';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SyncMatchesButtonProps {
  leagueIds: string[];
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Sync Matches Button
 * Manually triggers a sync of match data from ESPN API
 */
export function SyncMatchesButton({
  leagueIds,
  variant = 'secondary',
  size = 'md',
}: SyncMatchesButtonProps) {
  const syncMatches = useSyncMatches();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSync = async () => {
    try {
      const result = await syncMatches.mutateAsync(leagueIds);
      setShowSuccess(true);
      
      // Show success message for 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);

      console.log('Sync result:', result);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncMatches.isPending || leagueIds.length === 0}
      className={`
        flex items-center gap-2 rounded-lg font-semibold shadow-lg transition-all
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {syncMatches.isPending ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : showSuccess ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>Synced!</span>
        </>
      ) : syncMatches.isError ? (
        <>
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>Sync Failed</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Sync Scores</span>
        </>
      )}
    </button>
  );
}

