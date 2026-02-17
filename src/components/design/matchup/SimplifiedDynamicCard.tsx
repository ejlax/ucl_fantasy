import type { FC } from 'react';
import { getTeamLogo } from '@/utils/teamLogos';
import { Shield } from 'lucide-react';

interface SimplifiedDynamicCardProps {
    homeTeam: {
        name: string;
        score?: number | null;
        isWinner?: boolean;
        color?: string;
    };
    awayTeam: {
        name: string;
        score?: number | null;
        isWinner?: boolean;
        color?: string;
    };
    leg1Date: string;
    leg2Date: string;
    leg1Score?: string;
    leg2Score?: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export const SimplifiedDynamicCard: FC<SimplifiedDynamicCardProps> = ({
    homeTeam,
    awayTeam,
    leg1Date,
    leg2Date,
    leg1Score = '0-0',
    leg2Score = '0-0',
    status,
}) => {
    const homeLogo = getTeamLogo(homeTeam.name);
    const awayLogo = getTeamLogo(awayTeam.name);

    return (
        <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
            {/* Simple Dynamic Background - Light Mode Default as requested by 'simplified' often implying cleaner */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />
                <div className="absolute top-0 bottom-0 left-0 w-[40%] skew-x-12 origin-bottom-left bg-slate-50/50 transition-transform group-hover:skew-x-[15deg]" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="border-b border-gray-100 bg-white/50 px-4 py-2 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {status === 'COMPLETED' ? 'Final Score' : `Leg 1: ${leg1Date} • Leg 2: ${leg2Date}`}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-center gap-4">
                    {/* Home Row */}
                    <div className={`flex items-center justify-between ${homeTeam.isWinner ? 'opacity-100' : 'opacity-70'} transition-opacity`}>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 p-1">
                                {homeLogo ? (
                                    <img src={homeLogo} alt={homeTeam.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Shield className="w-4 h-4 text-slate-300" />
                                )}
                            </div>
                            <span className={`font-bold text-sm ${homeTeam.isWinner ? 'text-slate-900' : 'text-slate-600'}`}>
                                {homeTeam.name}
                            </span>
                        </div>
                        <span className={`text-xl font-black ${homeTeam.isWinner ? 'text-slate-900' : 'text-slate-400'}`}>
                            {homeTeam.score}
                        </span>
                    </div>

                    {/* Away Row */}
                    <div className={`flex items-center justify-between ${awayTeam.isWinner ? 'opacity-100' : 'opacity-70'} transition-opacity`}>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 p-1">
                                {awayLogo ? (
                                    <img src={awayLogo} alt={awayTeam.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Shield className="w-4 h-4 text-slate-300" />
                                )}
                            </div>
                            <span className={`font-bold text-sm ${awayTeam.isWinner ? 'text-slate-900' : 'text-slate-600'}`}>
                                {awayTeam.name}
                            </span>
                        </div>
                        <span className={`text-xl font-black ${awayTeam.isWinner ? 'text-slate-900' : 'text-slate-400'}`}>
                            {awayTeam.score}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-4 py-2 text-xs flex justify-between border-t border-gray-100 text-slate-500 font-medium">
                    <span>Leg 1: {leg1Score}</span>
                    <span>Leg 2: {leg2Score}</span>
                </div>
            </div>
        </div>
    );
};
