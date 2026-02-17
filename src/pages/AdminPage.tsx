/**
 * Admin Page
 * Test ESPN API integration and manage match data
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserLeagues } from '@/hooks/useLeagues';
import { useESPNCurrentMatches, useESPNLiveMatches, useESPNCompletedMatches } from '@/hooks/useESPNMatches';
import { SyncMatchesButton } from '@/components/matches';
import { Settings, Radio, CheckCircle2, Calendar, RefreshCw, Database, Edit2, Save, X } from 'lucide-react';
import { useMatchesGroupedByRound } from '@/hooks/useMatches';
import { matchService } from '@/services/matchService';
import { predictionService } from '@/services/predictionService';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/utils/constants';
import type { Match } from '@/types/database';
import { ESPNScheduleSync } from '@/components/admin/ESPNScheduleSync';

export function AdminPage() {
  const { user } = useAuth();
  const { data: leagues } = useUserLeagues(user?.id || '');
  const queryClient = useQueryClient();
  const { data: currentMatches, isLoading: currentLoading, refetch: refetchCurrent } = useESPNCurrentMatches();
  const { data: liveMatches, isLoading: liveLoading, refetch: refetchLive } = useESPNLiveMatches();
  const { data: completedMatches, isLoading: completedLoading, refetch: refetchCompleted } = useESPNCompletedMatches();
  const { data: dbMatchesGrouped, isLoading: dbLoading } = useMatchesGroupedByRound();

  const [activeTab, setActiveTab] = useState<'current' | 'live' | 'completed' | 'database'>('database');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<{ home: string; away: string }>({ home: '0', away: '0' });

  const leagueIds = leagues?.map((l) => l.id) || [];

  // Flatten database matches for count
  const dbMatches = dbMatchesGrouped
    ? Object.values(dbMatchesGrouped).flat()
    : [];

  // Debug: Log database matches
  console.log('📊 Database matches loaded:', {
    count: dbMatches.length,
    rounds: dbMatchesGrouped ? Object.keys(dbMatchesGrouped) : [],
    firstMatch: dbMatches[0] ? {
      id: dbMatches[0].id,
      home_team: dbMatches[0].home_team,
      away_team: dbMatches[0].away_team,
    } : null,
  });

  const tabs = [
    { id: 'database' as const, label: 'Database Matches', icon: Database, count: dbMatches.length },
    { id: 'current' as const, label: 'ESPN All', icon: Calendar, count: currentMatches?.length || 0 },
    { id: 'live' as const, label: 'ESPN Live', icon: Radio, count: liveMatches?.length || 0 },
    { id: 'completed' as const, label: 'ESPN Completed', icon: CheckCircle2, count: completedMatches?.length || 0 },
  ];

  const handleEditMatch = (match: Match) => {
    console.log('🔍 Editing match:', {
      id: match.id,
      home_team: match.home_team,
      away_team: match.away_team,
      round: match.round,
      leg: match.leg,
    });
    setEditingMatch(match.id);
    setEditScores({
      home: match.home_score?.toString() || '0',
      away: match.away_score?.toString() || '0',
    });
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
    setEditScores({ home: '0', away: '0' });
  };

  const handleRecalculateAllPoints = async () => {
    if (!confirm('Recalculate points for ALL completed matches in ALL leagues?\n\nThis will update points_earned for all predictions.')) {
      return;
    }

    try {
      console.log('🔄 Recalculating all points...');

      // Get all completed matches
      const completedMatches = dbMatches.filter(m => m.is_completed);
      console.log(`Found ${completedMatches.length} completed matches`);

      let totalUpdated = 0;

      for (const match of completedMatches) {
        if (match.home_score === null || match.away_score === null) {
          console.warn(`⚠️ Skipping match ${match.home_team} vs ${match.away_team} - no scores`);
          continue;
        }

        for (const leagueId of leagueIds) {
          try {
            await predictionService.calculateMatchPredictionPoints(
              leagueId,
              match.id,
              match.home_score,
              match.away_score
            );
            totalUpdated++;
            console.log(`✅ Recalculated: ${match.home_team} vs ${match.away_team} for league ${leagueId}`);
          } catch (err) {
            console.warn(`⚠️ Error for match ${match.id} in league ${leagueId}:`, err);
          }
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PREDICTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STANDINGS] });

      alert(`✅ Recalculation complete!\n\nProcessed ${completedMatches.length} matches across ${leagueIds.length} league(s).\n\nCheck the standings page to see updated points.`);
    } catch (error: any) {
      console.error('Error recalculating points:', error);
      alert(`❌ Failed to recalculate points\n\nError: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSaveScore = async (matchId: string) => {
    try {
      console.log('💾 Saving score for match ID:', matchId);
      const homeScore = parseInt(editScores.home) || 0;
      const awayScore = parseInt(editScores.away) || 0;
      console.log('💾 Scores:', { homeScore, awayScore });

      // Update match score
      const updatedMatch = await matchService.updateMatchScore(matchId, homeScore, awayScore, true);

      console.log('✅ Match updated:', updatedMatch);

      // Calculate points for all leagues
      if (leagueIds.length > 0) {
        for (const leagueId of leagueIds) {
          try {
            await predictionService.calculateMatchPredictionPoints(
              leagueId,
              matchId,
              homeScore,
              awayScore
            );
            console.log(`✅ Points calculated for league ${leagueId}`);
          } catch (err) {
            console.warn(`⚠️ Could not calculate points for league ${leagueId}:`, err);
          }
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PREDICTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STANDINGS] });

      setEditingMatch(null);
      alert(`✅ Score updated!\n${updatedMatch.home_team} ${homeScore} - ${awayScore} ${updatedMatch.away_team}\n\nPoints calculated for ${leagueIds.length} league(s).`);
    } catch (error: any) {
      console.error('Error updating score:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`❌ Failed to update score\n\nError: ${errorMessage}\n\nMake sure the match exists in your database.`);
    }
  };

  const getActiveMatches = () => {
    switch (activeTab) {
      case 'database':
        return dbMatches;
      case 'live':
        return liveMatches || [];
      case 'completed':
        return completedMatches || [];
      default:
        return currentMatches || [];
    }
  };

  const getActiveLoading = () => {
    switch (activeTab) {
      case 'database':
        return dbLoading;
      case 'live':
        return liveLoading;
      case 'completed':
        return completedLoading;
      default:
        return currentLoading;
    }
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case 'database':
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
        break;
      case 'live':
        refetchLive();
        break;
      case 'completed':
        refetchCompleted();
        break;
      default:
        refetchCurrent();
        break;
    }
  };

  const matches = getActiveMatches();
  const isLoading = getActiveLoading();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
              <p className="mt-1 text-slate-400">ESPN API Integration & Match Management</p>
            </div>
          </div>

          {/* Sync Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
            <button
              onClick={handleRecalculateAllPoints}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4" />
              Recalculate All Points
            </button>
            <SyncMatchesButton leagueIds={leagueIds} variant="primary" size="md" />
          </div>
        </div>

        {/* Database Status Alert */}
        {dbMatches.length === 0 && (
          <div className="mb-6 rounded-xl border border-yellow-700/50 bg-yellow-950/30 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                <Database className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-300">No Matches in Database</h3>
                <p className="mt-2 text-sm text-yellow-200/80">
                  Your database doesn't have any matches yet. You need to run the database migrations to seed the UCL matches.
                </p>
                <div className="mt-4 rounded-lg bg-slate-900/50 p-4">
                  <p className="mb-2 text-xs font-semibold text-slate-300">Run these SQL migrations in Supabase SQL Editor:</p>
                  <ol className="list-decimal space-y-1 pl-5 text-xs text-slate-400">
                    <li><code className="text-blue-400">001_initial_schema.sql</code> - Creates tables</li>
                    <li><code className="text-blue-400">004_seed_ucl_matches.sql</code> - Seeds matches</li>
                    <li><code className="text-blue-400">005_add_tie_support.sql</code> - Adds leg/tie support</li>
                  </ol>
                  <p className="mt-3 text-xs text-slate-500">
                    Find these files in: <code className="text-blue-400">supabase/migrations/</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Database Matches</p>
                <p className="mt-2 text-3xl font-bold text-white">{dbMatches.length}</p>
              </div>
              <Database className="h-10 w-10 text-blue-400" />
            </div>
          </div>

          <div className="rounded-xl border border-red-700/50 bg-red-950/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-300">Live Matches</p>
                <p className="mt-2 text-3xl font-bold text-white">{liveMatches?.length || 0}</p>
              </div>
              <Radio className="h-10 w-10 text-red-400" />
            </div>
          </div>

          <div className="rounded-xl border border-green-700/50 bg-green-950/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Completed</p>
                <p className="mt-2 text-3xl font-bold text-white">{completedMatches?.length || 0}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </div>
        </div>

        {/* ESPN Schedule Sync */}
        <div className="mb-8">
          <ESPNScheduleSync />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Match List */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          {/* Header */}
          <div className="border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {activeTab === 'database' && 'Database Matches (Editable)'}
                {activeTab === 'live' && 'ESPN Live Matches'}
                {activeTab === 'completed' && 'ESPN Completed Matches'}
                {activeTab === 'current' && 'ESPN All Current Matches'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Database className="h-4 w-4" />
                {activeTab === 'database' ? 'Supabase Database' : 'ESPN API Data'}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-400" />
                  <p className="text-slate-400">Loading matches...</p>
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-slate-600" />
                <h3 className="mt-4 text-lg font-semibold text-slate-300">No matches found</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {activeTab === 'database' && 'No matches in database'}
                  {activeTab === 'live' && 'No live matches at the moment'}
                  {activeTab === 'completed' && 'No completed matches found'}
                  {activeTab === 'current' && 'No matches available'}
                </p>
              </div>
            ) : activeTab === 'database' ? (
              // Database matches with edit functionality
              <div className="space-y-3">
                {(matches as Match[]).map((match) => {
                  const isEditing = editingMatch === match.id;
                  return (
                    <div
                      key={match.id}
                      className="group rounded-lg border border-slate-700 bg-slate-900/50 p-4 transition-all hover:border-slate-600 hover:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                            {match.home_team.substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{match.home_team}</p>
                            <p className="text-xs text-slate-500">
                              {match.round} • Leg {match.leg}
                            </p>
                          </div>
                        </div>

                        {/* Score - Editable */}
                        <div className="mx-6 flex items-center gap-3">
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                value={editScores.home}
                                onChange={(e) => setEditScores({ ...editScores, home: e.target.value })}
                                className="w-16 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-center text-xl font-black text-white focus:border-blue-500 focus:outline-none"
                              />
                              <span className="text-lg font-bold text-slate-500">-</span>
                              <input
                                type="number"
                                min="0"
                                value={editScores.away}
                                onChange={(e) => setEditScores({ ...editScores, away: e.target.value })}
                                className="w-16 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-center text-xl font-black text-white focus:border-blue-500 focus:outline-none"
                              />
                            </>
                          ) : (
                            <>
                              <span className="text-2xl font-black text-white">
                                {match.home_score ?? 0}
                              </span>
                              <span className="text-lg font-bold text-slate-500">-</span>
                              <span className="text-2xl font-black text-white">
                                {match.away_score ?? 0}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-1 items-center justify-end gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-white">{match.away_team}</p>
                            <p className="text-xs text-slate-500">
                              {match.is_completed ? '✅ Completed' : '⏳ Upcoming'}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                            {match.away_team.substring(0, 3).toUpperCase()}
                          </div>
                        </div>

                        {/* Edit/Save Buttons */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveScore(match.id)}
                                className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700"
                              >
                                <Save className="h-4 w-4" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-600"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditMatch(match)}
                              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Score
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="mt-3 flex items-center gap-4 border-t border-slate-700/50 pt-3 text-xs text-slate-500">
                        <div>
                          <span className="font-semibold">ID:</span> {match.id.substring(0, 8)}...
                        </div>
                        <div>
                          <span className="font-semibold">Date:</span>{' '}
                          {new Date(match.match_date).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span>{' '}
                          {match.is_completed ? 'Completed' : 'Upcoming'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // ESPN matches (read-only)
              <div className="space-y-3">
                {matches.map((match: any) => (
                  <div
                    key={match.id}
                    className="group rounded-lg border border-slate-700 bg-slate-900/50 p-4 transition-all hover:border-slate-600 hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      {/* Home Team */}
                      <div className="flex flex-1 items-center gap-3">
                        <img
                          src={match.homeTeam.logo}
                          alt={match.homeTeam.name}
                          className="h-10 w-10 object-contain"
                        />
                        <div>
                          <p className="font-semibold text-white">{match.homeTeam.displayName}</p>
                          <p className="text-xs text-slate-500">{match.homeTeam.abbreviation}</p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="mx-6 text-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-white">
                            {match.homeTeam.score || '0'}
                          </span>
                          <span className="text-lg font-bold text-slate-500">-</span>
                          <span className="text-2xl font-black text-white">
                            {match.awayTeam.score || '0'}
                          </span>
                        </div>
                        {match.status.inProgress && (
                          <div className="mt-1 flex items-center justify-center gap-1.5">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                            <span className="text-xs font-semibold text-red-400">
                              {match.status.displayClock}
                            </span>
                          </div>
                        )}
                        {match.status.completed && (
                          <span className="mt-1 inline-block text-xs font-semibold text-green-400">
                            Full Time
                          </span>
                        )}
                        {match.status.scheduled && (
                          <span className="mt-1 inline-block text-xs font-semibold text-slate-400">
                            Scheduled
                          </span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-1 items-center justify-end gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-white">{match.awayTeam.displayName}</p>
                          <p className="text-xs text-slate-500">{match.awayTeam.abbreviation}</p>
                        </div>
                        <img
                          src={match.awayTeam.logo}
                          alt={match.awayTeam.name}
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="mt-3 flex items-center gap-4 border-t border-slate-700/50 pt-3 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold">ID:</span> {match.id}
                      </div>
                      {match.venue && (
                        <div>
                          <span className="font-semibold">Venue:</span> {match.venue.name}
                        </div>
                      )}
                      {match.attendance && (
                        <div>
                          <span className="font-semibold">Attendance:</span>{' '}
                          {match.attendance.toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Date:</span> {new Date(match.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


