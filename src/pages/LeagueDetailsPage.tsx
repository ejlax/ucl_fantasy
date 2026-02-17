/**
 * League details page showing members, settings, and management options
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Trophy,
  Settings,
  Copy,
  UserMinus,
  Trash2,
  CheckCircle,
  Award,
  Shield,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLeagueWithMembers, useLeaveLeague, useDeleteLeague } from '@/hooks/useLeagues';
import { formatDate } from '@/utils/dateUtils';
import type { LeagueSettings } from '@/types/database';

export function LeagueDetailsPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: league, isLoading, error } = useLeagueWithMembers(leagueId || '');
  const leaveLeague = useLeaveLeague();
  const deleteLeague = useDeleteLeague();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
            <p className="text-secondary-600">Loading league details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">League not found or you don't have access.</p>
          <Link to="/leagues" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            ← Back to Leagues
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = league.owner_id === user?.id;
  const currentUserMember = league.members.find((m) => m.user_id === user?.id);

  const handleCopyInviteCode = async () => {
    await navigator.clipboard.writeText(league.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyJoinLink = async () => {
    const joinLink = `${window.location.origin}/join/${league.invite_code}`;
    await navigator.clipboard.writeText(joinLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeaveLeague = async () => {
    if (!user?.id || !leagueId) return;

    if (isOwner) {
      alert('As the owner, you must delete the league or transfer ownership before leaving.');
      return;
    }

    if (confirm('Are you sure you want to leave this league?')) {
      try {
        await leaveLeague.mutateAsync({ leagueId, userId: user.id });
        navigate('/leagues');
      } catch (err) {
        alert('Failed to leave league. Please try again.');
      }
    }
  };

  const handleDeleteLeague = async () => {
    if (!leagueId) return;

    try {
      await deleteLeague.mutateAsync(leagueId);
      navigate('/leagues');
    } catch (err) {
      alert('Failed to delete league. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/leagues"
          className="text-secondary-600 hover:text-secondary-900 mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          <span>Back to Leagues</span>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-secondary-900 text-3xl font-bold">{league.name}</h1>
              {isOwner && (
                <span className="bg-primary-100 text-primary-700 rounded-full px-3 py-1 text-xs font-semibold">
                  Owner
                </span>
              )}
            </div>
            {league.description && <p className="text-secondary-600 mt-2">{league.description}</p>}
            <p className="text-secondary-500 mt-1 text-sm">
              Created {formatDate(league.created_at, 'PPP')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              to={`/leagues/${leagueId}/predictions`}
              className="flex items-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
            >
              <Eye size={18} />
              <span>View Predictions</span>
            </Link>
            {!isOwner && (
              <button
                onClick={handleLeaveLeague}
                disabled={leaveLeague.isPending}
                className="flex items-center gap-2 rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <UserMinus size={18} />
                <span>Leave League</span>
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={18} />
                <span>Delete League</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invite Code Card */}
      <div className="bg-primary-50 border-primary-200 mb-8 rounded-lg border p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-secondary-900 text-sm font-semibold">Invite Code</h3>
              <p className="text-primary-600 mt-1 font-mono text-2xl font-bold">
                {league.invite_code}
              </p>
              <p className="text-secondary-600 mt-1 text-xs">
                Share this code with friends to invite them
              </p>
            </div>
            <button
              onClick={handleCopyInviteCode}
              className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
            >
              {copiedCode ? <CheckCircle size={18} /> : <Copy size={18} />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Join Link */}
          <div className="border-t border-primary-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-secondary-900 text-sm font-semibold">Share Link</h3>
                <p className="text-secondary-600 mt-1 text-sm font-mono truncate">
                  {window.location.origin}/join/{league.invite_code}
                </p>
                <p className="text-secondary-600 mt-1 text-xs">
                  Direct link for easy sharing - new users can sign up and join automatically
                </p>
              </div>
              <button
                onClick={handleCopyJoinLink}
                className="bg-secondary-600 hover:bg-secondary-700 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors flex-shrink-0"
              >
                {copiedLink ? <CheckCircle size={18} /> : <Copy size={18} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tools (Owner Only) */}
      {isOwner && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold">Admin Tools</h3>
              <p className="text-gray-600 text-sm">Manage league settings and member predictions</p>
            </div>
          </div>
          <Link
            to={`/leagues/${leagueId}/admin/predictions`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Shield size={18} />
            <span>Manage Member Predictions</span>
          </Link>
        </div>
      )}

      {/* League Settings */}
      {league.settings && Object.keys(league.settings).length > 0 && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Settings className="text-secondary-600 h-5 w-5" />
              <h2 className="text-secondary-900 text-lg font-semibold">League Settings</h2>
            </div>
          </div>
          <div className="px-6 py-4">
            <LeagueSettingsDisplay settings={league.settings as LeagueSettings} />
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="text-secondary-600 h-5 w-5" />
            <h2 className="text-secondary-900 text-lg font-semibold">
              Members ({league.member_count})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {league.members.map((member) => (
            <div key={member.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 text-primary-700 flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                    {member.user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-secondary-900 font-medium">
                      {member.user.display_name}
                      {member.user_id === league.owner_id && (
                        <span className="text-primary-600 ml-2 text-xs">(Owner)</span>
                      )}
                    </p>
                    <p className="text-secondary-500 text-sm">
                      Joined {formatDate(member.joined_at, 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-secondary-900 text-xl font-bold">Delete League?</h2>
            <p className="text-secondary-600 mt-2">
              Are you sure you want to delete "{league.name}"? This action cannot be undone and will
              remove all members and data associated with this league.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-secondary-900 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLeague}
                disabled={deleteLeague.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLeague.isPending ? 'Deleting...' : 'Delete League'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Component to display league settings
 */
function LeagueSettingsDisplay({ settings }: { settings: LeagueSettings }) {
  const hasBonusSettings = settings.enable_tie_winner_bonus || settings.enable_round_winner_bonus;

  if (!hasBonusSettings) {
    return (
      <p className="text-secondary-600 text-sm">
        Standard scoring: 3 points for exact score, 1 point for correct result
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Standard Scoring */}
      <div>
        <h3 className="text-secondary-900 mb-2 text-sm font-semibold">Standard Scoring</h3>
        <ul className="text-secondary-600 space-y-1 text-sm">
          <li>
            • Exact score: <span className="font-medium">3 points</span>
          </li>
          <li>
            • Correct result: <span className="font-medium">1 point</span>
          </li>
          <li>
            • Wrong result: <span className="font-medium">0 points</span>
          </li>
        </ul>
      </div>

      {/* Bonus Points */}
      {hasBonusSettings && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Award className="text-primary-600 h-4 w-4" />
            <h3 className="text-secondary-900 text-sm font-semibold">Bonus Points</h3>
          </div>
          <ul className="text-secondary-600 space-y-1 text-sm">
            {settings.enable_tie_winner_bonus && (
              <li>
                • Tie Winner Bonus:{' '}
                <span className="font-medium text-green-600">
                  +{settings.tie_winner_bonus_points || 2} points
                </span>{' '}
                for correctly predicting which team advances from two-leg ties
              </li>
            )}
            {settings.enable_round_winner_bonus && (
              <li>
                • Round Winner Bonus:{' '}
                <span className="font-medium text-green-600">
                  R16: +{settings.round_winner_bonus_points?.r16 || 5}, QF: +
                  {settings.round_winner_bonus_points?.qf || 10}, SF: +
                  {settings.round_winner_bonus_points?.sf || 15} points
                </span>{' '}
                for getting all winners in a round correct
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
