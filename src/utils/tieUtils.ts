/**
 * Utility functions for handling two-leg ties with aggregate scoring
 */

import type { Match } from '@/types/database';

/**
 * Represents a two-leg tie between two teams
 */
export interface Tie {
  id: string;
  round: string;
  team1: string;
  team2: string;
  leg1Match: Match | null;
  leg2Match: Match | null;
  team1AggregateScore: number | null;
  team2AggregateScore: number | null;
  team1AwayGoals: number;
  team2AwayGoals: number;
  winner: string | null;
  isCompleted: boolean;
  firstLegDate: string;
  secondLegDate: string | null;
}

/**
 * Groups matches by tie_id to create Tie objects
 * If matches don't have tie_id, groups them by round and team names
 */
export function groupMatchesIntoTies(matches: Match[]): Tie[] {
  // Group matches by tie_id (or create temporary tie_id if missing)
  const tieMap = new Map<string, Match[]>();

  matches.forEach((match) => {
    let tieId = match.tie_id;

    // If no tie_id, create a temporary one based on team names
    if (!tieId) {
      // For matches without tie_id, try to group by team names
      const sortedTeams = [match.home_team, match.away_team].sort().join('|');
      tieId = `${match.round}-${sortedTeams}`;
    }

    if (!tieMap.has(tieId)) {
      tieMap.set(tieId, []);
    }
    tieMap.get(tieId)!.push(match);
  });

  // Convert to Tie objects
  const ties: Tie[] = [];

  tieMap.forEach((tieMatches, tieId) => {
    // Sort by date (earlier match is leg 1)
    tieMatches.sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

    // Try to find by leg number first, otherwise use date order
    let leg1 = tieMatches.find((m) => m.leg === 1);
    let leg2 = tieMatches.find((m) => m.leg === 2);

    // If no leg numbers, use date order
    if (!leg1 && tieMatches.length > 0) {
      leg1 = tieMatches[0];
      leg2 = tieMatches[1] || null;
    }

    if (!leg1) return; // Skip if no first leg

    // Determine team names (consistent across both legs)
    const team1 = leg1.home_team;
    const team2 = leg1.away_team;

    // Calculate aggregate scores
    let team1Aggregate: number | null = null;
    let team2Aggregate: number | null = null;
    let team1AwayGoals = 0;
    let team2AwayGoals = 0;

    if (leg1.is_completed && leg2?.is_completed) {
      // Leg 1: team1 (home) vs team2 (away)
      const leg1Team1Score = leg1.home_score ?? 0;
      const leg1Team2Score = leg1.away_score ?? 0;

      // Leg 2: team2 (home) vs team1 (away) - teams swap
      const leg2Team1Score = leg2.away_score ?? 0;
      const leg2Team2Score = leg2.home_score ?? 0;

      team1Aggregate = leg1Team1Score + leg2Team1Score;
      team2Aggregate = leg1Team2Score + leg2Team2Score;

      // Away goals (for tie-breaker)
      team1AwayGoals = leg2Team1Score; // team1 away in leg 2
      team2AwayGoals = leg1Team2Score; // team2 away in leg 1
    }

    // Determine winner
    let winner: string | null = null;
    const isCompleted = leg1.is_completed && leg2?.is_completed;

    if (isCompleted && team1Aggregate !== null && team2Aggregate !== null) {
      if (team1Aggregate > team2Aggregate) {
        winner = team1;
      } else if (team2Aggregate > team1Aggregate) {
        winner = team2;
      } else {
        // Aggregate tied - use away goals rule
        if (team1AwayGoals > team2AwayGoals) {
          winner = team1;
        } else if (team2AwayGoals > team1AwayGoals) {
          winner = team2;
        }
        // If still tied, would go to extra time/penalties (not handled here)
      }
    }

    ties.push({
      id: tieId,
      round: leg1.round,
      team1,
      team2,
      leg1Match: leg1,
      leg2Match: leg2,
      team1AggregateScore: team1Aggregate,
      team2AggregateScore: team2Aggregate,
      team1AwayGoals,
      team2AwayGoals,
      winner,
      isCompleted,
      firstLegDate: leg1.match_date,
      secondLegDate: leg2?.match_date || null,
    });
  });

  return ties;
}

/**
 * Checks if a round uses two-leg format
 */
export function isTwoLegRound(round: string): boolean {
  return ['PLAYOFF', 'R16', 'QF', 'SF'].includes(round);
}

/**
 * Gets the display text for aggregate score
 */
export function getAggregateScoreText(tie: Tie): string {
  if (tie.team1AggregateScore === null || tie.team2AggregateScore === null) {
    return 'vs';
  }
  return `${tie.team1AggregateScore} - ${tie.team2AggregateScore}`;
}

/**
 * Gets the display text for a single leg score
 */
export function getLegScoreText(match: Match | null): string {
  if (!match || match.home_score === null || match.away_score === null) {
    return '-';
  }
  return `${match.home_score}-${match.away_score}`;
}
