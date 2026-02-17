/**
 * Test Live Page
 * Simulates live match updates for testing real-time functionality
 */

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Trophy } from 'lucide-react';
import { LiveMatchScores } from '@/components/live/LiveMatchScores';
import { LiveLeaderboard } from '@/components/live/LiveLeaderboard';
import { useLiveMatchUpdates } from '@/hooks/useRealtimeMatches';
import { useAuth } from '@/hooks/useAuth';
import { useUserLeagues } from '@/hooks/useLeagues';
import { useMatches } from '@/hooks/useMatches';
import { matchService } from '@/services/matchService';

export function TestLivePage() {
  const { user } = useAuth();
  const { data: leagues } = useUserLeagues(user?.id || '');
  const { data: matches } = useMatches();
  const leagueId = leagues?.[0]?.id;

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(3000); // 3 seconds
  const [log, setLog] = useState<string[]>([]);

  // Enable real-time updates
  useLiveMatchUpdates(leagueId);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const simulateGoal = async () => {
    if (!matches || matches.length === 0) {
      addLog('❌ No matches available');
      return;
    }

    // Find a match that's not completed
    const activeMatches = matches.filter((m) => !m.is_completed);
    if (activeMatches.length === 0) {
      addLog('❌ No active matches to update');
      return;
    }

    // Pick a random match
    const match = activeMatches[Math.floor(Math.random() * activeMatches.length)];

    // Randomly update home or away score
    const updateHome = Math.random() > 0.5;
    const currentHomeScore = match.home_score || 0;
    const currentAwayScore = match.away_score || 0;

    const newHomeScore = updateHome ? currentHomeScore + 1 : currentHomeScore;
    const newAwayScore = !updateHome ? currentAwayScore + 1 : currentAwayScore;

    try {
      await matchService.updateMatchScore(match.id, newHomeScore, newAwayScore, false);

      const scorer = updateHome ? match.home_team : match.away_team;
      addLog(`⚽ GOAL! ${scorer} scores! ${match.home_team} ${newHomeScore}-${newAwayScore} ${match.away_team}`);
    } catch (error) {
      addLog(`❌ Error updating match: ${error}`);
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    addLog('▶️ Started live simulation');
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    addLog('⏸️ Stopped live simulation');
  };

  const resetScores = async () => {
    if (!matches) return;

    try {
      for (const match of matches) {
        await matchService.updateMatchScore(match.id, 0, 0, false);
      }
      addLog('🔄 Reset all match scores to 0-0');
    } catch (error) {
      addLog(`❌ Error resetting scores: ${error}`);
    }
  };

  // Auto-simulate goals
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      simulateGoal();
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Zap className="h-10 w-10 text-yellow-400" />
              Live Testing Environment
            </h1>
            <p className="text-slate-400 mt-2">
              Simulate live match updates to test real-time functionality
            </p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-blue-600" />
            Simulation Controls
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={simulateGoal}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Simulate Goal
            </button>

            {!isSimulating ? (
              <button
                onClick={startSimulation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Auto-Simulation
              </button>
            ) : (
              <button
                onClick={stopSimulation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Stop Simulation
              </button>
            )}

            <button
              onClick={resetScores}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Scores
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Simulation Speed:
            </label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="1000"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm text-gray-600">
              {simulationSpeed / 1000}s per goal
            </span>
          </div>

          {/* Activity Log */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity Log:</h3>
            <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
              {log.length === 0 ? (
                <p className="text-gray-500">No activity yet...</p>
              ) : (
                log.map((entry, i) => (
                  <div key={i} className="text-green-400 mb-1">
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Components */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Live Scores</h2>
            <LiveMatchScores round="PLAYOFF" />
          </div>

          {leagueId && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Live Leaderboard</h2>
              <LiveLeaderboard leagueId={leagueId} showLiveIndicator={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

