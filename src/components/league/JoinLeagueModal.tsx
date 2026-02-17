/**
 * Modal component for joining a league via invite code
 */

import { useState } from 'react';
import { X, Users, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJoinLeagueByInviteCode, useLeagueByInviteCode } from '@/hooks/useLeagues';
import { LEAGUE_SETTINGS } from '@/utils/constants';

interface JoinLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinLeagueModal({ isOpen, onClose }: JoinLeagueModalProps) {
  const { user } = useAuth();
  const joinLeague = useJoinLeagueByInviteCode();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [joinedLeagueName, setJoinedLeagueName] = useState('');

  // Fetch league preview when invite code is valid length
  const { data: leaguePreview } = useLeagueByInviteCode(
    inviteCode.length === LEAGUE_SETTINGS.INVITE_CODE_LENGTH ? inviteCode.toUpperCase() : ''
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (inviteCode.length !== LEAGUE_SETTINGS.INVITE_CODE_LENGTH) {
      setError(`Invite code must be ${LEAGUE_SETTINGS.INVITE_CODE_LENGTH} characters`);
      return;
    }

    if (!user?.id) {
      setError('You must be logged in to join a league');
      return;
    }

    try {
      await joinLeague.mutateAsync({
        inviteCode: inviteCode.toUpperCase(),
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

  const handleClose = () => {
    setInviteCode('');
    setError('');
    setSuccess(false);
    setJoinedLeagueName('');
    onClose();
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, LEAGUE_SETTINGS.INVITE_CODE_LENGTH);
    setInviteCode(value);
    setError('');
  };

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-secondary-900 text-2xl font-bold">Successfully Joined!</h2>
            <p className="text-secondary-600 mt-2">
              You've joined "{joinedLeagueName}". Good luck!
            </p>

            <button
              onClick={handleClose}
              className="bg-primary-600 hover:bg-primary-700 mt-6 w-full rounded-lg px-4 py-2 text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-secondary-900 text-2xl font-bold">Join League</h2>
        <p className="text-secondary-600 mt-2">Enter the invite code to join an existing league</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Invite Code Input */}
          <div>
            <label htmlFor="inviteCode" className="text-secondary-900 block text-sm font-medium">
              Invite Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={handleInviteCodeChange}
              placeholder="ABC123"
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-center font-mono text-2xl tracking-wider uppercase focus:ring-1 focus:outline-none"
              required
              maxLength={LEAGUE_SETTINGS.INVITE_CODE_LENGTH}
            />
            <p className="text-secondary-500 mt-1 text-xs">
              {inviteCode.length}/{LEAGUE_SETTINGS.INVITE_CODE_LENGTH} characters
            </p>
          </div>

          {/* League Preview */}
          {leaguePreview && (
            <div className="bg-primary-50 border-primary-200 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Users className="text-primary-600 mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-secondary-900 font-semibold">{leaguePreview.name}</p>
                  {leaguePreview.description && (
                    <p className="text-secondary-600 mt-1 text-sm">{leaguePreview.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="text-secondary-900 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                joinLeague.isPending || inviteCode.length !== LEAGUE_SETTINGS.INVITE_CODE_LENGTH
              }
              className="bg-primary-600 hover:bg-primary-700 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {joinLeague.isPending && <Loader2 size={18} className="animate-spin" />}
              <span>{joinLeague.isPending ? 'Joining...' : 'Join League'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
