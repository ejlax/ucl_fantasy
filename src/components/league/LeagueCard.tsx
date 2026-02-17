import { LeagueWithOwner } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/common';
import { Users, Trophy, User } from 'lucide-react';

interface LeagueCardProps {
  league: LeagueWithOwner;
  onClick?: () => void;
  isOwner?: boolean;
}

/**
 * League card component for displaying league information
 */
export function LeagueCard({ league, onClick, isOwner }: LeagueCardProps) {
  return (
    <Card hover onClick={onClick} padding="md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{league.name}</CardTitle>
          {isOwner && (
            <Badge variant="primary" size="sm">
              Owner
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {league.description && (
          <p className="text-secondary-600 mb-4 line-clamp-2">{league.description}</p>
        )}

        <div className="text-secondary-600 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Created by {league.owner?.display_name || 'Unknown'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{league.member_count || 0} members</span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="bg-secondary-100 rounded px-2 py-1 font-mono text-xs">
              {league.invite_code}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
