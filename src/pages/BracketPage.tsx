import { useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { TournamentBracket } from '@/components/bracket/TournamentBracket';
import { BracketTreeView } from '@/components/bracket/BracketTreeView';
import { Loading, Alert } from '@/components/common';
import { LayoutGrid, GitBranch } from 'lucide-react';

type ViewMode = 'list' | 'tree';

export function BracketPage() {
  const { data: matches, isLoading, error } = useMatches();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="error">Failed to load matches. Please try again later.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-secondary-900 text-2xl font-bold sm:text-3xl">Tournament Bracket</h1>
          <p className="text-secondary-600 mt-1 text-sm sm:mt-2 sm:text-base">
            View the Champions League knockout bracket
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm sm:gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 rounded-md px-3 py-2 transition-colors sm:gap-2 sm:px-4 ${
              viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="hidden text-sm font-medium sm:inline sm:text-base">List View</span>
            <span className="text-sm font-medium sm:hidden">List</span>
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1 rounded-md px-3 py-2 transition-colors sm:gap-2 sm:px-4 ${
              viewMode === 'tree' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <GitBranch size={18} />
            <span className="hidden text-sm font-medium sm:inline sm:text-base">Tree View</span>
            <span className="text-sm font-medium sm:hidden">Tree</span>
          </button>
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'list' ? (
        <TournamentBracket matches={matches || []} />
      ) : (
        <BracketTreeView matches={matches || []} />
      )}
    </div>
  );
}
