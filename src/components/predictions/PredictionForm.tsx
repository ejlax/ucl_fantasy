import { useState, useEffect, useRef } from 'react';
import { Match } from '@/types/database';
import { Input, Alert } from '@/components/common';
import { arePredictionsLocked, formatMatchDate } from '@/utils/dateUtils';
import { getTeamLogo, hasTeamLogo } from '@/utils/teamLogos';
import { Lock, Check, Shield, Trophy, Calendar, Clock, MapPin } from 'lucide-react';

interface PredictionFormProps {
  match: Match;
  existingPrediction?: {
    predicted_home_score: number;
    predicted_away_score: number;
  };
  onSubmit: (homeScore: number, awayScore: number) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Form component for entering match predictions
 */
export function PredictionForm({
  match,
  existingPrediction,
  onSubmit,
  isSubmitting = false,
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(
    existingPrediction?.predicted_home_score?.toString() ?? '0'
  );
  const [awayScore, setAwayScore] = useState(
    existingPrediction?.predicted_away_score?.toString() ?? '0'
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false); // Track if a save is in progress
  const onSubmitRef = useRef(onSubmit); // Store onSubmit in a ref to avoid dependency issues

  const isLocked = arePredictionsLocked(match.match_date);
  const isCompleted = match.is_completed;

  // Update the ref when onSubmit changes
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Auto-save when scores change (with debounce)
  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't auto-save if locked or completed
    if (isLocked || isCompleted) return;

    // Don't auto-save if already saving (prevents duplicate key error)
    if (isSavingRef.current) return;

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    // Validate scores
    if (isNaN(home) || isNaN(away)) return;
    if (home < 0 || away < 0) return;
    if (home > 20 || away > 20) return;

    // Check if scores have actually changed
    const hasChanged =
      home !== existingPrediction?.predicted_home_score ||
      away !== existingPrediction?.predicted_away_score;

    if (!hasChanged) return;

    // Debounce: wait 1 second after user stops typing
    saveTimeoutRef.current = setTimeout(async () => {
      // Double-check we're not already saving
      if (isSavingRef.current) return;

      setError('');
      setIsSaving(true);
      isSavingRef.current = true;
      setJustSaved(false);

      try {
        await onSubmitRef.current(home, away);
        setJustSaved(true);
        // Hide "saved" indicator after 2 seconds
        setTimeout(() => setJustSaved(false), 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to save prediction');
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [homeScore, awayScore, existingPrediction, isLocked, isCompleted]);

  if (isCompleted) {
    return <Alert variant="info">This match has been completed. Predictions are closed.</Alert>;
  }

  if (isLocked) {
    return (
      <Alert variant="warning">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>Predictions are locked for this match</span>
        </div>
      </Alert>
    );
  }

  const homeLogoUrl = getTeamLogo(match.home_team);
  const awayLogoUrl = getTeamLogo(match.away_team);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl bg-slate-600/20 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-slate-400/30">
      {/* Header */}
      <div className="relative mb-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 rounded-full bg-slate-600/40 px-3 py-1.5 text-white backdrop-blur-md ring-1 ring-white/20">
          <Trophy className="h-3.5 w-3.5" />
          Playoff
        </span>
        {!isLocked && !isCompleted && (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            OPEN
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}

      {/* Teams - Grid Layout for Equal Sizing */}
      <div className="relative mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white p-3 shadow-lg">
            {homeLogoUrl ? (
              <img
                src={homeLogoUrl}
                alt={match.home_team}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <Shield className={`h-12 w-12 text-slate-400 ${homeLogoUrl ? 'hidden' : ''}`} />
          </div>
          <span className="text-sm font-semibold text-white">{match.home_team}</span>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center px-4">
          <span className="text-xl font-medium italic text-white/30">VS</span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white p-3 shadow-lg">
            {awayLogoUrl ? (
              <img
                src={awayLogoUrl}
                alt={match.away_team}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <Shield className={`h-12 w-12 text-slate-400 ${awayLogoUrl ? 'hidden' : ''}`} />
          </div>
          <span className="text-sm font-semibold text-white">{match.away_team}</span>
        </div>
      </div>

      {/* Score Inputs */}
      <div className="relative mb-6 flex items-center justify-center gap-4">
        <input
          type="number"
          min="0"
          max="20"
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value || '0')}
          disabled={isSaving}
          className="h-16 w-16 rounded-2xl bg-slate-600/50 text-center text-3xl font-bold text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition-all placeholder:text-white/40 hover:bg-slate-600/60 focus:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="0"
        />
        <span className="text-2xl font-bold text-white/50">-</span>
        <input
          type="number"
          min="0"
          max="20"
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value || '0')}
          disabled={isSaving}
          className="h-16 w-16 rounded-2xl bg-slate-600/50 text-center text-3xl font-bold text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition-all placeholder:text-white/40 hover:bg-slate-600/60 focus:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="0"
        />
      </div>

      {/* Footer */}
      <div className="relative space-y-3 border-t border-white/20 pt-4 text-xs">
        <div className="flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatMatchDate(match.match_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(match.match_date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {match.leg === 1 ? 'First Leg' : 'Second Leg'}
          </span>
        </div>

        {!isCompleted && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="h-3.5 w-3.5" />
              Locks 60 min before kickoff
            </span>
            {isSaving && (
              <span className="flex items-center gap-1.5 text-blue-400">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                Saving...
              </span>
            )}
            {!isSaving && justSaved && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
