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
    <div className="mb-6 overflow-hidden rounded-xl border-2 border-red-600 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-xl">
      <div className="flex items-center gap-3 border-b border-red-700 bg-red-700 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </div>
          <Radio className="h-4 w-4 text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Live Matches
          </span>
        </div>
        <div className="text-xs text-white/90">
          Updates every 30 seconds
        </div>
      </div>

      <div className="divide-y divide-red-700/50 bg-gradient-to-br from-red-600 via-red-500 to-red-600 p-4">
        {liveMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            {/* Home Team */}
            <div className="flex flex-1 items-center justify-end gap-3">
              <span className="text-sm font-bold text-white drop-shadow-md">
                {match.homeTeam.displayName}
              </span>
              <div className="h-10 w-10 rounded-full bg-white p-1.5 shadow-lg">
                <img
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {/* Score */}
            <div className="mx-6 flex flex-col items-center gap-1">
              <div className="flex items-center gap-4 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2">
                <span className="text-3xl font-black text-white drop-shadow-lg">
                  {match.homeTeam.score || '0'}
                </span>
                <span className="text-xl font-bold text-white/80">-</span>
                <span className="text-3xl font-black text-white drop-shadow-lg">
                  {match.awayTeam.score || '0'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs text-red-700 font-bold shadow-md">
                <Clock className="h-3 w-3" />
                <span className="font-mono">
                  {match.status.displayClock}
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-1 items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white p-1.5 shadow-lg">
                <img
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-bold text-white drop-shadow-md">
                {match.awayTeam.displayName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

