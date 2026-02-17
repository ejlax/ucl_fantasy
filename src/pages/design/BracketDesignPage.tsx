import { SimplifiedDynamicCard } from '@/components/design/matchup/SimplifiedDynamicCard';
import { ListTree, Network } from 'lucide-react';

export function BracketDesignPage() {
    const matches = [
        {
            homeTeam: { name: 'Galatasaray', score: 1, isWinner: false },
            awayTeam: { name: 'Juventus', score: 4, isWinner: true },
            leg1Score: '0-2',
            leg2Score: '2-1',
        },
        {
            homeTeam: { name: 'Monaco', score: 2, isWinner: false },
            awayTeam: { name: 'Paris Saint-Germain', score: 7, isWinner: true },
            leg1Score: '0-3',
            leg2Score: '4-2',
        },
        {
            homeTeam: { name: 'Benfica', score: 1, isWinner: false },
            awayTeam: { name: 'Real Madrid', score: 5, isWinner: true },
            leg1Score: '1-3',
            leg2Score: '2-0',
        },
        {
            homeTeam: { name: 'Borussia Dortmund', score: 5, isWinner: true },
            awayTeam: { name: 'Atalanta', score: 3, isWinner: false },
            leg1Score: '3-1',
            leg2Score: '2-2',
        },
        {
            homeTeam: { name: 'Qarabağ', score: 2, isWinner: false },
            awayTeam: { name: 'Newcastle United', score: 5, isWinner: true },
            leg1Score: '0-2',
            leg2Score: '3-2',
        },
        {
            homeTeam: { name: 'Olympiacos', score: 1, isWinner: false },
            awayTeam: { name: 'Bayer Leverkusen', score: 8, isWinner: true },
            leg1Score: '1-4',
            leg2Score: '4-0',
        },
        {
            homeTeam: { name: 'Bodø/Glimt', score: 2, isWinner: false },
            awayTeam: { name: 'Inter Milan', score: 5, isWinner: true },
            leg1Score: '1-2',
            leg2Score: '3-1',
        },
        {
            homeTeam: { name: 'Club Brugge', score: 3, isWinner: false },
            awayTeam: { name: 'Atletico Madrid', score: 6, isWinner: true },
            leg1Score: '2-3',
            leg2Score: '3-1',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Tournament Bracket</h1>
                        <p className="text-slate-500">View the Champions League knockout bracket</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                            <ListTree className="h-4 w-4" />
                            List View
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                            <Network className="h-4 w-4" />
                            Tree View
                        </button>
                    </div>
                </header>

                <div className="mb-8 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                    <div className="mb-6 text-center">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Knockout Phase Play-offs</h2>
                        <p className="text-xs text-slate-400 font-medium">Feb 17, 2026 & Feb 25, 2026</p>
                        <div className="mt-4 h-0.5 w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {matches.map((match, idx) => (
                            <SimplifiedDynamicCard
                                key={idx}
                                homeTeam={match.homeTeam}
                                awayTeam={match.awayTeam}
                                leg1Date="Feb 17"
                                leg2Date="Feb 25"
                                leg1Score={match.leg1Score}
                                leg2Score={match.leg2Score}
                                status="COMPLETED"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
