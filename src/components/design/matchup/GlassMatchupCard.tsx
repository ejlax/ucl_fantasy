import type { FC } from 'react';
import { Trophy, Calendar, Clock, MapPin, Shield } from 'lucide-react';
import { getTeamLogo } from '@/utils/teamLogos';

interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo?: string;
}

interface MatchupCardProps {
  homeTeam: Team;
  awayTeam: Team;
  matchDate: Date;
  venue?: string;
  stage: string;
  predictionsOpen?: boolean;
  mode?: 'dark' | 'light';
}

export const GlassMatchupCard: FC<MatchupCardProps> = ({
  homeTeam,
  awayTeam,
  matchDate,
  venue = 'Signal Iduna Park',
  stage,
  predictionsOpen = true,
  mode = 'dark',
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(matchDate);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(matchDate);

  const isDark = mode === 'dark';

  const homeLogo = getTeamLogo(homeTeam.name);
  const awayLogo = getTeamLogo(awayTeam.name);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-xl backdrop-blur-xl ring-1 transition-all hover:shadow-2xl ${isDark
          ? 'bg-white/10 ring-white/20 hover:ring-white/30 text-white'
          : 'bg-white/60 ring-black/5 hover:ring-black/10 text-slate-800'
        }`}
    >
      {/* Decorative Gradients */}
      <div
        className="absolute -top-12 -left-12 h-32 w-32 rounded-full blur-[60px]"
        style={{ backgroundColor: homeTeam.color, opacity: isDark ? 0.4 : 0.2 }}
      />
      <div
        className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full blur-[60px]"
        style={{ backgroundColor: awayTeam.color, opacity: isDark ? 0.4 : 0.2 }}
      />

      {/* Header */}
      <div className={`relative mb-6 flex items-center justify-between text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 backdrop-blur-md ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
          <Trophy className="h-3 w-3" />
          {stage}
        </span>
        {predictionsOpen && (
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="relative flex items-center justify-between gap-4 mb-8">
        {/* Home Team */}
        <div className="flex flex-col items-center text-center gap-3 flex-1">
          <div className={`relative h-20 w-20 flex items-center justify-center rounded-2xl ring-1 shadow-lg p-3 group transition-transform hover:scale-105 ${isDark
              ? 'bg-gradient-to-br from-white/10 to-transparent ring-white/10'
              : 'bg-white/80 ring-black/5'
            }`}>
            {homeLogo ? (
              <img src={homeLogo} alt={homeTeam.name} className="w-full h-full object-contain filter drop-shadow-md" />
            ) : (
              <Shield className="w-8 h-8 opacity-50" />
            )}
          </div>
          <span className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {homeTeam.name}
          </span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center justify-center">
          <span className={`text-2xl font-black italic ${isDark ? 'text-white/20' : 'text-slate-900/10'}`}>VS</span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center text-center gap-3 flex-1">
          <div className={`relative h-20 w-20 flex items-center justify-center rounded-2xl ring-1 shadow-lg p-3 group transition-transform hover:scale-105 ${isDark
              ? 'bg-gradient-to-br from-white/10 to-transparent ring-white/10'
              : 'bg-white/80 ring-black/5'
            }`}>
            {awayLogo ? (
              <img src={awayLogo} alt={awayTeam.name} className="w-full h-full object-contain filter drop-shadow-md" />
            ) : (
              <Shield className="w-8 h-8 opacity-50" />
            )}
          </div>
          <span className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className={`relative flex items-center justify-between border-t pt-4 text-sm ${isDark ? 'border-white/10 text-white/60' : 'border-black/5 text-slate-500'}`}>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{formattedTime}</span>
        </div>
      </div>

      <div className={`relative mt-2 flex items-center justify-center gap-1.5 text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
        <MapPin className="h-3 w-3" />
        {venue}
      </div>

      {/* CTA */}
      <button className="relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-indigo-500/25 active:scale-[0.98]">
        <span className="relative z-10">Make Prediction</span>
        <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform hover:translate-y-0" />
      </button>
    </div>
  );
};
