import { GlassMatchupCard } from '@/components/design/matchup/GlassMatchupCard';
import { DynamicMatchupCard } from '@/components/design/matchup/DynamicMatchupCard';
import { MinimalMatchupCard } from '@/components/design/matchup/MinimalMatchupCard';

export function MatchupDesignPage() {
  const homeTeam = {
    id: 'bvb',
    name: 'Borussia Dortmund',
    shortName: 'BVB',
    color: '#FDE100', // Dortmund Yellow
  };

  const awayTeam = {
    id: 'ata',
    name: 'Atalanta BC',
    shortName: 'ATA',
    color: '#1f2f57', // Atalanta Blue/Black
  };

  const matchDate = new Date('2026-02-17T14:00:00');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Matchup Card Concepts</h1>
          <p className="mt-2 text-slate-500">
            Exploring different visual directions for the match presentation
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Concept 1: Glass */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Concept 1: Modern / Glass
              </h2>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                Immersive
              </span>
            </div>

            {/* Dark Mode */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Dark Mode</p>
              <div className="rounded-3xl bg-slate-900 p-8 shadow-inner">
                <GlassMatchupCard
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  matchDate={matchDate}
                  stage="Round of 16"
                  mode="dark"
                />
              </div>
            </div>

            {/* Light Mode */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Light Mode</p>
              <div className="rounded-3xl bg-slate-50 p-8 shadow-inner border border-slate-200">
                <GlassMatchupCard
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  matchDate={matchDate}
                  stage="Round of 16"
                  mode="light"
                />
              </div>
            </div>

            <p className="text-sm text-slate-500 p-2">
              Uses backdrop filters, gradients, and transparency. Best for dark mode or creating a "premium app" feel.
            </p>
          </div>

          {/* Concept 2: Dynamic */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Concept 2: Broadcast / Action
              </h2>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                High Energy
              </span>
            </div>

            {/* Dark Mode */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Dark Mode</p>
              <div className="rounded-3xl bg-slate-100 p-8">
                <DynamicMatchupCard
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  matchDate={matchDate}
                  stage="Round of 16"
                  mode="dark"
                />
              </div>
            </div>

            {/* Light Mode */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Light Mode</p>
              <div className="rounded-3xl bg-slate-100 p-8">
                <DynamicMatchupCard
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  matchDate={matchDate}
                  stage="Round of 16"
                  mode="light"
                />
              </div>
            </div>

            <p className="text-sm text-slate-500 p-2">
              Bold typography, angled lines, and high contrast. Mimics TV sports graphics. Great for building hype.
            </p>
          </div>

          {/* Concept 3: Minimal */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Concept 3: Editorial / Clean
              </h2>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Functional
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Universal</p>
              <div className="rounded-3xl bg-white p-8 border border-slate-200">
                <MinimalMatchupCard
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  matchDate={matchDate}
                  stage="Round of 16"
                />
              </div>
            </div>

            <p className="text-sm text-slate-500 p-2">
              Focus on readability and hierarchy. Clean lines, whitespace, and subtle interactions. "Apple-like" aesthetic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
