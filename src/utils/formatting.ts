/**
 * Formatting utility functions
 */

/**
 * Format a score display (e.g., "2 - 1")
 */
export function formatScore(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) {
    return '- : -';
  }
  return `${homeScore} - ${awayScore}`;
}

/**
 * Format points display
 */
export function formatPoints(points: number): string {
  return `${points} ${points === 1 ? 'pt' : 'pts'}`;
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

/**
 * Format round name for display
 */
export function formatRoundName(round: string): string {
  const roundNames: Record<string, string> = {
    PLAYOFF: 'Knockout Phase Play-offs',
    R16: 'Round of 16',
    QF: 'Quarter Finals',
    SF: 'Semi Finals',
    FINAL: 'Final',
  };
  return roundNames[round] || round;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format team name abbreviation (e.g., "Manchester United" -> "MUN")
 */
export function getTeamAbbreviation(teamName: string): string {
  const words = teamName.split(' ');
  if (words.length === 1) {
    return teamName.slice(0, 3).toUpperCase();
  }
  return words
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

/**
 * Pluralize a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || `${word}s`;
}
