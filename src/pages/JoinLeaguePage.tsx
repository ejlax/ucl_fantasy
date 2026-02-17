/**
 * Join League Page
 * Shareable page for joining a league via invite code
 * URL format: /join/:inviteCode
 * 
 * Flow:
 * 1. If user is authenticated -> show league preview and join button
 * 2. If user is not authenticated -> redirect to signup with return URL
 * 3. After signup/login -> automatically return and join league
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Loader2, CheckCircle, Trophy, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJoinLeagueByInviteCode, useLeagueByInviteCode } from '@/hooks/useLeagues';
import { LEAGUE_SETTINGS } from '@/utils/constants';

export function JoinLeaguePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const joinLeague = useJoinLeagueByInviteCode();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [joinedLeagueName, setJoinedLeagueName] = useState('');

  // Normalize invite code
  const normalizedCode = inviteCode?.toUpperCase() || '';

  // Fetch league preview
  const { data: leaguePreview, isLoading: leagueLoading, error: leagueError } = useLeagueByInviteCode(
    normalizedCode.length === LEAGUE_SETTINGS.INVITE_CODE_LENGTH ? normalizedCode : ''
  );

  // Auto-join if user just signed up/logged in (has 'autoJoin' param)
  const shouldAutoJoin = searchParams.get('autoJoin') === 'true';

  useEffect(() => {
    if (shouldAutoJoin && user && leaguePreview && !success && !joinLeague.isPending) {
      handleJoinLeague();
    }
  }, [shouldAutoJoin, user, leaguePreview, success]);

  const handleJoinLeague = async () => {
    if (!user?.id) {
      // Redirect to signup with return URL
      navigate(`/signup?returnTo=/join/${normalizedCode}&autoJoin=true`);
      return;
    }

    setError('');

    try {
      await joinLeague.mutateAsync({
        inviteCode: normalizedCode,
        userId: user.id,
      });

      setJoinedLeagueName(leaguePreview?.name || 'the league');
      setSuccess(true);
    } catch (err: any) {
      if (err.message.includes('not found')) {
        setError('Invalid invite code. Please check and try again.');
      } else if (err.message.includes('duplicate') || err.message.includes('already')) {
        setError('You are already a member of this league.');
      } else {
        setError(err.message || 'Failed to join league');
      }
    }
  };

  // Loading state
  if (authLoading || leagueLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading league information...</p>
        </div>
      </div>
    );
  }

  // Invalid invite code
  if (!normalizedCode || normalizedCode.length !== LEAGUE_SETTINGS.INVITE_CODE_LENGTH || leagueError || !leaguePreview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite Link</h1>
          <p className="text-gray-600 mb-6">
            This league invite link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/leagues')}
            className="btn btn-primary w-full"
          >
            Go to My Leagues
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {joinedLeagueName}!</h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined the league. Start making predictions and compete with your friends!
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/predictions')}
              className="btn btn-primary flex-1"
            >
              Make Predictions
            </button>
            <button
              onClick={() => navigate('/leagues')}
              className="btn btn-secondary flex-1"
            >
              View Leagues
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main join league view
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* League Preview Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You've been invited!
            </h1>
            <p className="text-gray-600">
              Join <span className="font-semibold text-gray-900">{leaguePreview.name}</span> and compete with your friends
            </p>
          </div>

          {/* League Info */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">League Name</span>
              <span className="font-semibold text-gray-900">{leaguePreview.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Invite Code</span>
              <span className="font-mono font-semibold text-blue-600">{normalizedCode}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Join Button */}
          {user ? (
            <button
              onClick={handleJoinLeague}
              disabled={joinLeague.isPending}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {joinLeague.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  <span>Join League</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/signup?returnTo=/join/${normalizedCode}&autoJoin=true`)}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Sign Up to Join</span>
              </button>
              <button
                onClick={() => navigate(`/login?returnTo=/join/${normalizedCode}&autoJoin=true`)}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-5 w-5" />
                <span>Already have an account? Log In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

