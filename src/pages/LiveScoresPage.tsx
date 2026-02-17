/**
 * Live Scores Page
 * Watch all UCL matches with real-time score updates
 */

import { useState } from 'react';
import { Radio, Calendar, CheckCircle2, Trophy } from 'lucide-react';
import { LiveMatchScores } from '@/components/live/LiveMatchScores';
import { useLiveMatchUpdates } from '@/hooks/useRealtimeMatches';
import { useESPNLiveMatches } from '@/hooks/useESPNMatches';
import { useMatchesGroupedByRound } from '@/hooks/useMatches';
import { formatRoundName } from '@/utils/formatting';

type FilterType = 'all' | 'live' | 'upcoming' | 'completed';

export function LiveScoresPage() {
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [filter, setFilter] = useState<FilterType>('all');
  
  const { data: matchesGrouped } = useMatchesGroupedByRound();
  const { data: liveMatches } = useESPNLiveMatches();
  
  // Enable real-time updates
  useLiveMatchUpdates();

  const rounds = matchesGrouped ? Object.keys(matchesGrouped) : [];
  const hasLiveMatches = liveMatches && liveMatches.length > 0;

  // Count matches by status
  const allMatches = matchesGrouped ? Object.values(matchesGrouped).flat() : [];
  const liveCount = allMatches.filter(m => !m.is_completed && m.home_score !== null).length;
  const upcomingCount = allMatches.filter(m => !m.is_completed && m.home_score === null).length;
  const completedCount = allMatches.filter(m => m.is_completed).length;

  const filters: { id: FilterType; label: string; icon: any; count: number }[] = [
    { id: 'all', label: 'All Matches', icon: Calendar, count: allMatches.length },
    { id: 'live', label: 'Live', icon: Radio, count: liveCount },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar, count: upcomingCount },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completedCount },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Live Scores</h1>
          </div>
          <p className="text-slate-300">
            Watch all UEFA Champions League matches with real-time updates
          </p>
        </div>

        {/* Live Indicator Banner */}
        {hasLiveMatches && (
          <div className="mb-6 flex items-center gap-3 px-6 py-4 bg-red-500/20 border-2 border-red-500 rounded-xl backdrop-blur-sm">
            <Radio className="h-6 w-6 text-red-400 animate-pulse" />
            <div>
              <p className="text-white font-bold text-lg">
                {liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} in progress
              </p>
              <p className="text-red-200 text-sm">Scores updating in real-time</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.id;
            
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <Icon className={`h-4 w-4 ${f.id === 'live' && isActive ? 'animate-pulse' : ''}`} />
                {f.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Round Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Filter by Round
          </label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" className="bg-slate-800">All Rounds</option>
            {rounds.map((round) => (
              <option key={round} value={round} className="bg-slate-800">
                {formatRoundName(round)}
              </option>
            ))}
          </select>
        </div>

        {/* Matches Display */}
        <div className="space-y-8">
          {selectedRound === 'all' ? (
            // Show all rounds
            rounds.map((round) => (
              <div key={round}>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  {formatRoundName(round)}
                  <span className="text-sm font-normal text-slate-400">
                    ({matchesGrouped?.[round]?.length || 0} matches)
                  </span>
                </h2>
                <LiveMatchScores 
                  round={round} 
                  showOnlyLive={filter === 'live'}
                />
              </div>
            ))
          ) : (
            // Show selected round
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {formatRoundName(selectedRound)}
              </h2>
              <LiveMatchScores 
                round={selectedRound} 
                showOnlyLive={filter === 'live'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

