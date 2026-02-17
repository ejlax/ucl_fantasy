/**
 * Modal component for creating a new league
 */

import { useState } from 'react';
import { X, Trophy, Loader2, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateLeague } from '@/hooks/useLeagues';
import { LEAGUE_SETTINGS, BONUS_POINTS } from '@/utils/constants';
import type { LeagueSettings } from '@/types/database';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLeagueModal({ isOpen, onClose }: CreateLeagueModalProps) {
  const { user } = useAuth();
  const createLeague = useCreateLeague();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [createdLeague, setCreatedLeague] = useState<{ name: string; invite_code: string } | null>(
    null
  );

  // Bonus settings
  const [enableTieWinnerBonus, setEnableTieWinnerBonus] = useState(false);
  const [enableRoundWinnerBonus, setEnableRoundWinnerBonus] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (name.length < LEAGUE_SETTINGS.MIN_NAME_LENGTH) {
      setError(`League name must be at least ${LEAGUE_SETTINGS.MIN_NAME_LENGTH} characters`);
      return;
    }

    if (name.length > LEAGUE_SETTINGS.MAX_NAME_LENGTH) {
      setError(`League name must be less than ${LEAGUE_SETTINGS.MAX_NAME_LENGTH} characters`);
      return;
    }

    if (!user?.id) {
      setError('You must be logged in to create a league');
      return;
    }

    try {
      // Build settings object
      const settings: LeagueSettings = {};

      if (enableTieWinnerBonus) {
        settings.enable_tie_winner_bonus = true;
        settings.tie_winner_bonus_points = BONUS_POINTS.TIE_WINNER;
      }

      if (enableRoundWinnerBonus) {
        settings.enable_round_winner_bonus = true;
        settings.round_winner_bonus_points = {
          r16: BONUS_POINTS.ROUND_WINNER_R16,
          qf: BONUS_POINTS.ROUND_WINNER_QF,
          sf: BONUS_POINTS.ROUND_WINNER_SF,
        };
      }

      const league = await createLeague.mutateAsync({
        name,
        description: description || null,
        ownerId: user.id,
        settings: Object.keys(settings).length > 0 ? settings : undefined,
      });

      setCreatedLeague({ name: league.name, invite_code: league.invite_code });
    } catch (err: any) {
      setError(err.message || 'Failed to create league');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    setCreatedLeague(null);
    setEnableTieWinnerBonus(false);
    setEnableRoundWinnerBonus(false);
    onClose();
  };

  // Success state
  if (createdLeague) {
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
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-secondary-900 text-2xl font-bold">League Created!</h2>
            <p className="text-secondary-600 mt-2">
              Your league "{createdLeague.name}" has been created successfully.
            </p>

            <div className="bg-primary-50 border-primary-200 mt-6 rounded-lg border p-4">
              <p className="text-secondary-900 text-sm font-medium">Invite Code</p>
              <p className="text-primary-600 mt-1 font-mono text-2xl font-bold">
                {createdLeague.invite_code}
              </p>
              <p className="text-secondary-600 mt-2 text-xs">
                Share this code with friends to invite them to your league
              </p>
            </div>

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

        <h2 className="text-secondary-900 text-2xl font-bold">Create League</h2>
        <p className="text-secondary-600 mt-2">
          Start your own fantasy league and compete with friends
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* League Name */}
          <div>
            <label htmlFor="name" className="text-secondary-900 block text-sm font-medium">
              League Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Champions League Experts"
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-secondary-900 block text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell members what this league is about..."
              rows={3}
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:outline-none"
            />
          </div>

          {/* Bonus Points Settings */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Award className="text-primary-600 h-5 w-5" />
              <h3 className="text-secondary-900 text-sm font-semibold">Bonus Points (Optional)</h3>
            </div>

            {/* Tie Winner Bonus */}
            <label className="mb-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={enableTieWinnerBonus}
                onChange={(e) => setEnableTieWinnerBonus(e.target.checked)}
                className="text-primary-600 focus:ring-primary-500 mt-0.5 h-4 w-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <div className="text-secondary-900 text-sm font-medium">
                  Tie Winner Bonus (+{BONUS_POINTS.TIE_WINNER} pts)
                </div>
                <div className="text-secondary-600 text-xs">
                  Award bonus points for correctly predicting which team advances from two-leg ties
                </div>
              </div>
            </label>

            {/* Round Winner Bonus */}
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={enableRoundWinnerBonus}
                onChange={(e) => setEnableRoundWinnerBonus(e.target.checked)}
                className="text-primary-600 focus:ring-primary-500 mt-0.5 h-4 w-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <div className="text-secondary-900 text-sm font-medium">Round Winner Bonus</div>
                <div className="text-secondary-600 text-xs">
                  Award bonus points for getting all winners in a round correct (R16: +
                  {BONUS_POINTS.ROUND_WINNER_R16}, QF: +{BONUS_POINTS.ROUND_WINNER_QF}, SF: +
                  {BONUS_POINTS.ROUND_WINNER_SF})
                </div>
              </div>
            </label>
          </div>

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
              disabled={createLeague.isPending}
              className="bg-primary-600 hover:bg-primary-700 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createLeague.isPending && <Loader2 size={18} className="animate-spin" />}
              <span>{createLeague.isPending ? 'Creating...' : 'Create League'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
