import type { FC } from 'react';
import { ChevronRight, BarChart2, Shield } from 'lucide-react';
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
  venue?: string;
}

export const MinimalMatchupCard: FC<MatchupCardProps> = ({
  homeTeam,
  awayTeam,
  matchDate,
  stage,
  venue = 'Signal Iduna Park',
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(matchDate);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(matchDate);

  const homeLogo = getTeamLogo(homeTeam.name);
  const awayLogo = getTeamLogo(awayTeam.name);

  return (
    <div className="group relative rounded-[20px] bg-white border border-gray-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-all duration-300">

      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">{stage}</h3>
          <p className="text-sm text-gray-500 font-medium">{formattedDate}, {formattedTime} • {venue}</p>
        </div>
        <button className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Matchup */}
      <div className="flex flex-col gap-4">
        {/* Home Row */}
        <div className="flex items-center justify-between group/team p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 p-1.5">
              {homeLogo ? (
                <img src={homeLogo} alt={homeTeam.name} className="w-full h-full object-contain" />
              ) : (
                <Shield className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <span className="text-base font-semibold text-gray-900">{homeTeam.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 opacity-0 group-hover/team:opacity-100 transition-opacity">Home</span>
            <div className="h-2 w-2 rounded-full bg-gray-200" style={{ backgroundColor: homeTeam.color }} />
          </div>
        </div>

        {/* Away Row */}
        <div className="flex items-center justify-between group/team p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 p-1.5">
              {awayLogo ? (
                <img src={awayLogo} alt={awayTeam.name} className="w-full h-full object-contain" />
              ) : (
                <Shield className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <span className="text-base font-semibold text-gray-900">{awayTeam.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 opacity-0 group-hover/team:opacity-100 transition-opacity">Away</span>
            <div className="h-2 w-2 rounded-full bg-gray-200" style={{ backgroundColor: awayTeam.color }} />
          </div>
        </div>
      </div>

      {/* Footer/Stats */}
      <div className="mt-8 pt-6 border-t border-dashed border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <BarChart2 className="h-3.5 w-3.5" />
          <span>42% predict Home Win</span>
        </div>
        <span className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline">Match Details</span>
      </div>
    </div>
  );
};
