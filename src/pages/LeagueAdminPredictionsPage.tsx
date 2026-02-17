/**
 * League Admin Predictions Page
 * Allows league owners/commissioners to add or edit predictions for members
 * even after matches have started
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Users, Calendar, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLeagueWithMembers } from '@/hooks/useLeagues';
import { useMatchesGroupedByRound } from '@/hooks/useMatches';
import { useSavePredictionAdminOverride } from '@/hooks/usePredictions';
import { useUserPredictions } from '@/hooks/usePredictions';
import { formatDate, arePredictionsLocked } from '@/utils/dateUtils';
import type { Match } from '@/types/database';

export function LeagueAdminPredictionsPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: league, isLoading: leagueLoading } = useLeagueWithMembers(leagueId || '');
  const { data: matchesGrouped, isLoading: matchesLoading } = useMatchesGroupedByRound();
  const savePrediction = useSavePredictionAdminOverride();

  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch predictions for selected member
  const { data: memberPredictions } = useUserPredictions(
    leagueId || '',
    selectedMember || ''
  );

  // Check if current user is league owner
  const isOwner = league?.owner_id === user?.id;

  // Get all matches
  const allMatches: Match[] = matchesGrouped
    ? Object.values(matchesGrouped).flat()
    : [];

  // Get selected match details
  const selectedMatchData = allMatches.find(m => m.id === selectedMatch);

  // Get existing prediction for selected match
  const existingPrediction = memberPredictions?.find(p => p.match_id === selectedMatch);

  if (leagueLoading || matchesLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!league || !isOwner) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            {!league ? 'League not found.' : 'Only league owners can access this page.'}
          </p>
          <Link to={`/leagues/${leagueId}`} className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            ← Back to League
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedMember || !selectedMatch || !leagueId) {
      setError('Please select a member and match');
      return;
    }

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setError('Please enter valid scores (0 or greater)');
      return;
    }

    try {
      await savePrediction.mutateAsync({
        leagueId,
        userId: selectedMember,
        matchId: selectedMatch,
        predictedHomeScore: home,
        predictedAwayScore: away,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save prediction');
    }
  };

  // Auto-fill scores when existing prediction is found
  const handleMatchChange = (matchId: string) => {
    setSelectedMatch(matchId);
    const prediction = memberPredictions?.find(p => p.match_id === matchId);
    if (prediction) {
      setHomeScore(prediction.predicted_home_score.toString());
      setAwayScore(prediction.predicted_away_score.toString());
    } else {
      setHomeScore('');
      setAwayScore('');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/leagues/${leagueId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to League</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin: Manage Predictions</h1>
            <p className="text-gray-600 mt-1">Add or edit predictions for league members</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Admin Override Enabled</p>
            <p>As league owner, you can add or modify predictions even after matches have started. Use this responsibly!</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Member */}
          <div>
            <label htmlFor="member" className="label flex items-center gap-2">
              <Users size={16} />
              Select Member
            </label>
            <select
              id="member"
              value={selectedMember}
              onChange={(e) => {
                setSelectedMember(e.target.value);
                setSelectedMatch('');
                setHomeScore('');
                setAwayScore('');
              }}
              className="input"
              required
            >
              <option value="">Choose a member...</option>
              {league.members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user.display_name} ({member.user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Select Match */}
          {selectedMember && (
            <div>
              <label htmlFor="match" className="label flex items-center gap-2">
                <Calendar size={16} />
                Select Match
              </label>
              <select
                id="match"
                value={selectedMatch}
                onChange={(e) => handleMatchChange(e.target.value)}
                className="input"
                required
              >
                <option value="">Choose a match...</option>
                {Object.entries(matchesGrouped || {}).map(([round, matches]) => (
                  <optgroup key={round} label={round}>
                    {matches.map((match) => {
                      const isLocked = arePredictionsLocked(match.match_date);
                      const isCompleted = match.is_completed;
                      return (
                        <option key={match.id} value={match.id}>
                          {match.home_team} vs {match.away_team} - {formatDate(match.match_date)}
                          {isCompleted && ' (Completed)'}
                          {isLocked && !isCompleted && ' (Locked)'}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Match Info */}
          {selectedMatchData && (
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Match Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Teams:</span> {selectedMatchData.home_team} vs {selectedMatchData.away_team}</p>
                <p><span className="font-medium">Date:</span> {formatDate(selectedMatchData.match_date)}</p>
                <p><span className="font-medium">Round:</span> {selectedMatchData.round} - Leg {selectedMatchData.leg}</p>
                {selectedMatchData.is_completed && (
                  <p className="text-green-600 font-medium">
                    ✓ Completed: {selectedMatchData.home_score} - {selectedMatchData.away_score}
                  </p>
                )}
                {arePredictionsLocked(selectedMatchData.match_date) && !selectedMatchData.is_completed && (
                  <p className="text-orange-600 font-medium">
                    🔒 Predictions locked (match started)
                  </p>
                )}
                {existingPrediction && (
                  <p className="text-blue-600 font-medium">
                    Current prediction: {existingPrediction.predicted_home_score} - {existingPrediction.predicted_away_score}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Score Inputs */}
          {selectedMatch && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="homeScore" className="label">
                  {selectedMatchData?.home_team || 'Home'} Score
                </label>
                <input
                  id="homeScore"
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="input text-center text-2xl font-bold"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="awayScore" className="label">
                  {selectedMatchData?.away_team || 'Away'} Score
                </label>
                <input
                  id="awayScore"
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="input text-center text-2xl font-bold"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2 text-sm text-green-800">
              <CheckCircle size={16} />
              <span>Prediction saved successfully!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedMember || !selectedMatch || savePrediction.isPending}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {savePrediction.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Prediction</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

