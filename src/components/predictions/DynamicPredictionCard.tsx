import { useState, useEffect, useRef } from 'react';
import { Match } from '@/types/database';
import { Alert } from '@/components/common';
import { arePredictionsLocked, formatMatchDate } from '@/utils/dateUtils';
import { getTeamLogo } from '@/utils/teamLogos';
import { Lock, Check, Shield, Calendar, Clock, MapPin, Zap } from 'lucide-react';

interface DynamicPredictionCardProps {
  match: Match;
  existingPrediction?: {
    predicted_home_score: number;
    predicted_away_score: number;
  };
  onSubmit: (homeScore: number, awayScore: number) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Dynamic Prediction Card - Broadcast/Action style with team logos
 */
export function DynamicPredictionCard({
  match,
  existingPrediction,
  onSubmit,
  isSubmitting = false,
}: DynamicPredictionCardProps) {
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
  const isSavingRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);

  const isLocked = arePredictionsLocked(match.match_date);
  const isCompleted = match.is_completed;
  const hasActualScores = match.home_score !== null && match.away_score !== null;

  // Update the ref when onSubmit changes
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Sync state with existingPrediction when it changes (e.g., after data loads)
  useEffect(() => {
    if (existingPrediction) {
      setHomeScore(existingPrediction.predicted_home_score?.toString() ?? '0');
      setAwayScore(existingPrediction.predicted_away_score?.toString() ?? '0');
    }
  }, [existingPrediction]);

  // Auto-save when scores change (with debounce)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (isLocked || isCompleted) return;
    if (isSavingRef.current) return;

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away)) return;
    if (home < 0 || away < 0) return;
    if (home > 20 || away > 20) return;

    const hasChanged =
      home !== existingPrediction?.predicted_home_score ||
      away !== existingPrediction?.predicted_away_score;

    if (!hasChanged) return;

    saveTimeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;

      setError('');
      setIsSaving(true);
      isSavingRef.current = true;
      setJustSaved(false);

      try {
        await onSubmitRef.current(home, away);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to save prediction');
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [homeScore, awayScore, existingPrediction, isLocked, isCompleted]);

  const homeLogoUrl = getTeamLogo(match.home_team);
  const awayLogoUrl = getTeamLogo(match.away_team);

  const formattedDate = new Date(match.match_date).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(match.match_date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="group relative h-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-2xl transition-all hover:-translate-y-1">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" />
        <div className="absolute top-0 bottom-0 left-0 w-[55%] origin-bottom-left skew-x-12 bg-white/50 transition-transform group-hover:skew-x-[15deg]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 bg-white/40 px-5 py-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-[10px] font-black tracking-[0.2em] text-green-600 uppercase">
                  Completed
                </span>
              </>
            ) : isLocked ? (
              <>
                <Lock className="h-3 w-3 text-amber-600" />
                <span className="text-[10px] font-black tracking-[0.2em] text-amber-600 uppercase">
                  In Progress
                </span>
              </>
            ) : (
              <>
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">
                  {match.round}
                </span>
              </>
            )}
          </div>
          <div className="text-[10px] font-bold text-slate-500">
            {formattedDate} • {formattedTime}
          </div>
        </div>

        {error && (
          <div className="m-4">
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </div>
        )}

        {/* Main Event Area */}
        <div className="flex min-h-[180px]">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5 transition-transform group-hover:-translate-x-1">
            <div className="relative">
              <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-white p-3 shadow-lg ring-1 ring-gray-200">
                {homeLogoUrl ? (
                  <img
                    src={homeLogoUrl}
                    alt={match.home_team}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Shield className={`h-10 w-10 text-slate-400 ${homeLogoUrl ? 'hidden' : ''}`} />
              </div>
            </div>
            <span className="text-center text-sm font-black tracking-tight text-slate-900 uppercase leading-tight">
              {match.home_team}
            </span>
          </div>

          {/* VS Divider */}
          <div className="relative flex w-12 flex-col items-center justify-center">
            <div className="absolute inset-y-0 w-px skew-x-12 bg-black/10" />
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
              <span className="text-[10px] font-black text-slate-400 italic">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5 transition-transform group-hover:translate-x-1">
            <div className="relative">
              <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-white p-3 shadow-lg ring-1 ring-gray-200">
                {awayLogoUrl ? (
                  <img
                    src={awayLogoUrl}
                    alt={match.away_team}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Shield className={`h-10 w-10 text-slate-400 ${awayLogoUrl ? 'hidden' : ''}`} />
              </div>
            </div>
            <span className="text-center text-sm font-black tracking-tight text-slate-900 uppercase leading-tight">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Score Prediction Section */}
        <div className="space-y-4 px-5 pb-5">
          {/* Actual Scores (when match has started/completed) */}
          {(isLocked || isCompleted) && hasActualScores && (
            <div className="space-y-2">
              <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Actual Score
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-900 text-2xl font-black text-white shadow-lg ring-1 ring-slate-700">
                  {match.home_score}
                </div>
                <span className="text-xl font-bold text-slate-400">-</span>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-900 text-2xl font-black text-white shadow-lg ring-1 ring-slate-700">
                  {match.away_score}
                </div>
              </div>
            </div>
          )}

          {/* Prediction Scores */}
          {(isLocked || isCompleted) && existingPrediction ? (
            <div className="space-y-2">
              <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Your Prediction
              </div>
              <div className="flex items-center justify-center gap-4 opacity-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-xl font-black text-slate-500 shadow-sm ring-1 ring-slate-300">
                  {existingPrediction.predicted_home_score}
                </div>
                <span className="text-lg font-bold text-slate-400">-</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-xl font-black text-slate-500 shadow-sm ring-1 ring-slate-300">
                  {existingPrediction.predicted_away_score}
                </div>
              </div>
            </div>
          ) : !isLocked && !isCompleted ? (
            <div className="space-y-2">
              <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Your Prediction
              </div>
              <div className="flex items-center justify-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value || '0')}
                  disabled={isSaving}
                  className="h-14 w-14 rounded-lg bg-white text-center text-2xl font-black text-slate-900 shadow-lg ring-1 ring-gray-200 backdrop-blur-md transition-all placeholder:text-slate-400 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="0"
                />
                <span className="text-xl font-bold text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value || '0')}
                  disabled={isSaving}
                  className="h-14 w-14 rounded-lg bg-white text-center text-2xl font-black text-slate-900 shadow-lg ring-1 ring-gray-200 backdrop-blur-md transition-all placeholder:text-slate-400 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="0"
                />
              </div>
            </div>
          ) : null}

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>{match.leg === 1 ? 'First Leg' : 'Second Leg'}</span>
            </div>
            {isSaving && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                Saving...
              </span>
            )}
            {!isSaving && justSaved && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


