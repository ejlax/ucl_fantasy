import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserLeagues } from '@/hooks/useLeagues';
import { LeagueCard } from '@/components/league/LeagueCard';
import { CreateLeagueModal } from '@/components/league/CreateLeagueModal';
import { JoinLeagueModal } from '@/components/league/JoinLeagueModal';
import { useNavigate } from 'react-router-dom';

export function LeaguesPage() {
  const { user } = useAuth();
  const { data: leagues, isLoading, error } = useUserLeagues(user?.id || '');
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  console.log(
    '🔍 LeaguesPage render - showCreateModal:',
    showCreateModal,
    'showJoinModal:',
    showJoinModal
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
            <p className="text-secondary-600">Loading your leagues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">Error loading leagues. Please try again.</p>
        </div>
      </div>
    );
  }

  const hasLeagues = leagues && leagues.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-secondary-900 text-3xl font-bold">My Leagues</h1>
          <p className="text-secondary-600 mt-2">
            {hasLeagues
              ? `You're a member of ${leagues.length} league${leagues.length === 1 ? '' : 's'}`
              : 'Create or join a league to start competing'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="border-primary-600 text-primary-600 hover:bg-primary-50 flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <Users size={18} />
            <span>Join League</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            <Plus size={18} />
            <span>Create League</span>
          </button>
        </div>
      </div>

      {/* Leagues Grid */}
      {hasLeagues ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <LeagueCard
              key={league.id}
              league={league}
              onClick={() => navigate(`/leagues/${league.id}`)}
              isOwner={league.owner_id === user?.id}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-secondary-900 mt-4 text-lg font-semibold">No leagues yet</h3>
          <p className="text-secondary-600 mt-2">
            Get started by creating your own league or joining an existing one with an invite code.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="border-primary-600 text-primary-600 hover:bg-primary-50 flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-colors"
            >
              <Users size={18} />
              <span>Join League</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <Plus size={18} />
              <span>Create League</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateLeagueModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <JoinLeagueModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  );
}
