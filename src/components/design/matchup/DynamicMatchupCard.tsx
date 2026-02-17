import type { FC } from 'react';
import { ArrowRight, Zap, Shield } from 'lucide-react';
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
  stage: string;
  predictionsOpen?: boolean;
  mode?: 'dark' | 'light';
}

export const DynamicMatchupCard: FC<MatchupCardProps> = ({
  homeTeam,
  awayTeam,
  matchDate,
  stage,
  mode = 'dark',
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
  }).format(matchDate);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(matchDate);

  const isDark = mode === 'dark';
  const homeLogo = getTeamLogo(homeTeam.name);
  const awayLogo = getTeamLogo(awayTeam.name);

  return (
    <div className={`group relative overflow-hidden rounded-xl shadow-2xl transition-all hover:-translate-y-1 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'
      } border`}>
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        {/* Slanted divider */}
        <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-slate-900 via-slate-900 to-slate-950' : 'from-gray-50 via-gray-100 to-gray-200'
          }`} />
        <div className={`absolute top-0 bottom-0 left-0 w-[55%] skew-x-12 origin-bottom-left transition-transform group-hover:skew-x-[15deg] ${isDark ? 'bg-slate-800/50' : 'bg-white/50'
          }`} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-white/5 bg-black/20' : 'border-black/5 bg-white/40'
          }`}>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${isDark ? 'text-white/70' : 'text-slate-600'
              }`}>
              {stage}
            </span>
          </div>
          <div className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
            {formattedDate} • {formattedTime}
          </div>
        </div>

        {/* Main Event Area */}
        <div className="flex min-h-[160px]">
          {/* Home Team */}
          <div className="flex-1 p-5 flex flex-col items-center justify-center gap-3 transition-transform group-hover:-translate-x-1">
            <div className="relative">
              <div
                className={`h-20 w-20 mb-2 rounded-full flex items-center justify-center p-3 shadow-lg ring-1 ring-white/10 ${isDark ? 'bg-white' : 'bg-white'
                  }`}
              >
                {homeLogo ? (
                  <img src={homeLogo} alt={homeTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-8 h-8 text-slate-400" />
                )}
              </div>
            </div>
            <span className={`text-xl font-black uppercase tracking-tight text-center leading-tight ${isDark ? 'text-white' : 'text-slate-900'
              }`}>
              {homeTeam.name}
            </span>
          </div>

          {/* VS Divider */}
          <div className="relative w-12 flex flex-col items-center justify-center">
            <div className={`absolute inset-y-0 w-px skew-x-12 ${isDark ? 'bg-white/10' : 'bg-black/10'
              }`} />
            <div className={`relative h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'
              }`}>
              <span className={`text-[10px] font-black italic ${isDark ? 'text-white/50' : 'text-slate-400'
                }`}>VS</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 p-5 flex flex-col items-center justify-center gap-3 transition-transform group-hover:translate-x-1">
            <div className="relative">
              <div
                className={`h-20 w-20 mb-2 rounded-full flex items-center justify-center p-3 shadow-lg ring-1 ring-white/10 ${isDark ? 'bg-white' : 'bg-white'
                  }`}
              >
                {awayLogo ? (
                  <img src={awayLogo} alt={awayTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-8 h-8 text-slate-400" />
                )}
              </div>
            </div>
            <span className={`text-xl font-black uppercase tracking-tight text-center leading-tight ${isDark ? 'text-white' : 'text-slate-900'
              }`}>
              {awayTeam.name}
            </span>
          </div>
        </div>

        {/* Prediction Bar */}
        <div className="px-5 pb-5">
          <button className={`group/btn flex items-center justify-center gap-2 w-full py-3 rounded-none skew-x-[-10deg] transition-colors ${isDark ? 'bg-white hover:bg-yellow-400 text-slate-950' : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}>
            <div className="skew-x-[10deg] flex items-center gap-2 font-black uppercase tracking-wider text-sm">
              <Zap className="h-4 w-4 fill-current" />
              Predict Score
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
