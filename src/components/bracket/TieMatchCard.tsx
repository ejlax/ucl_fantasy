/**
 * Custom match card component for displaying two-leg ties in the bracket
 */

import { Trophy } from 'lucide-react';
import type { Tie } from '@/utils/tieUtils';
import { getAggregateScoreText, getLegScoreText } from '@/utils/tieUtils';
import { MatchWrapper, MatchHeader, TeamRow, TeamName, Score } from './BracketStyles';

interface TieMatchCardProps {
  tie: Tie;
  onClick?: () => void;
}

/**
 * Displays a two-leg tie with aggregate scoring
 */
export function TieMatchCard({ tie, onClick }: TieMatchCardProps) {
  const isFinal = tie.round === 'FINAL';
  const aggregateScore = getAggregateScoreText(tie);
  const leg1Score = getLegScoreText(tie.leg1Match);
  const leg2Score = getLegScoreText(tie.leg2Match);

  return (
    <MatchWrapper onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <MatchHeader>
        {isFinal ? (
          <>
            <Trophy size={14} style={{ marginRight: '4px', display: 'inline' }} />
            Final -{' '}
            {new Date(tie.firstLegDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </>
        ) : (
          <>
            Leg 1:{' '}
            {new Date(tie.firstLegDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
            {tie.secondLegDate && (
              <>
                {' • Leg 2: '}
                {new Date(tie.secondLegDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </>
            )}
          </>
        )}
      </MatchHeader>

      {/* Team 1 */}
      <TeamRow $isWinner={tie.winner === tie.team1}>
        <TeamName $isWinner={tie.winner === tie.team1}>{tie.team1}</TeamName>
        <Score $isWinner={tie.winner === tie.team1}>
          {tie.isCompleted ? tie.team1AggregateScore : '-'}
        </Score>
      </TeamRow>

      {/* Team 2 */}
      <TeamRow $isWinner={tie.winner === tie.team2}>
        <TeamName $isWinner={tie.winner === tie.team2}>{tie.team2}</TeamName>
        <Score $isWinner={tie.winner === tie.team2}>
          {tie.isCompleted ? tie.team2AggregateScore : '-'}
        </Score>
      </TeamRow>

      {/* Aggregate score display */}
      {!isFinal && (
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '12px',
            color: '#6b7280',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Leg 1: {leg1Score}</span>
          {tie.leg2Match && <span>Leg 2: {leg2Score}</span>}
        </div>
      )}

      {/* Away goals indicator if applicable */}
      {tie.isCompleted && tie.team1AggregateScore === tie.team2AggregateScore && tie.winner && (
        <div
          style={{
            padding: '4px 12px',
            backgroundColor: '#fef3c7',
            fontSize: '11px',
            color: '#92400e',
            textAlign: 'center',
          }}
        >
          Won on away goals
        </div>
      )}
    </MatchWrapper>
  );
}
