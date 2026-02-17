import { useESPNLiveMatches } from '@/hooks/useESPNMatches';
import { Radio, Clock } from 'lucide-react';

/**
 * Live Match Banner
 * Displays live match scores at the top of the page
 */
export function LiveMatchBanner() {
  const { data: liveMatches, isLoading } = useESPNLiveMatches();

  if (isLoading || !liveMatches || liveMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/50 via-red-900/30 to-red-950/50 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-red-500/20 bg-red-950/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
          </div>
          <Radio className="h-4 w-4 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-300">
            Live Matches
          </span>
        </div>
        <div className="text-xs text-red-400/70">
          Updates every 30 seconds
        </div>
      </div>

      <div className="divide-y divide-red-500/10 p-4">
        {liveMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            {/* Home Team */}
            <div className="flex flex-1 items-center justify-end gap-3">
              <span className="text-sm font-semibold text-white">
                {match.homeTeam.displayName}
              </span>
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="h-8 w-8 object-contain"
              />
            </div>

            {/* Score */}
            <div className="mx-6 flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white">
                  {match.homeTeam.score || '0'}
                </span>
                <span className="text-lg font-bold text-red-400">-</span>
                <span className="text-2xl font-black text-white">
                  {match.awayTeam.score || '0'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-300">
                <Clock className="h-3 w-3" />
                <span className="font-mono font-semibold">
                  {match.status.displayClock}
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-1 items-center gap-3">
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="h-8 w-8 object-contain"
              />
              <span className="text-sm font-semibold text-white">
                {match.awayTeam.displayName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

