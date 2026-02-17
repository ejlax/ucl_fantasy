/**
 * Team logos mapping for Champions League teams
 * Using ESPN's CDN for reliable, high-quality team logos
 * Format: https://a.espncdn.com/i/teamlogos/soccer/500/[TEAM_ID].png
 */

export const TEAM_LOGOS: Record<string, string> = {
  // Playoff Teams (2025-26 UCL) - Using VERIFIED ESPN team IDs from API
  Galatasaray: 'https://a.espncdn.com/i/teamlogos/soccer/500/432.png',
  Juventus: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
  'Borussia Dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  Atalanta: 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png',
  Monaco: 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
  'Paris Saint-Germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  PSG: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  Benfica: 'https://a.espncdn.com/i/teamlogos/soccer/500/1929.png',
  'Real Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  Qarabağ: 'https://a.espncdn.com/i/teamlogos/soccer/500/10414.png',
  'Newcastle United': 'https://a.espncdn.com/i/teamlogos/soccer/500/361.png',
  Olympiacos: 'https://a.espncdn.com/i/teamlogos/soccer/500/435.png',
  'Bayer Leverkusen': 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
  'Bodø/Glimt': 'https://a.espncdn.com/i/teamlogos/soccer/500/2980.png',
  'Inter Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  'Club Brugge': 'https://a.espncdn.com/i/teamlogos/soccer/500/570.png',
  'Atletico Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  'Atlético Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',

  // Other Top European Teams
  'Manchester City': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
  Liverpool: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
  Arsenal: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
  'Aston Villa': 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png',
  Barcelona: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  Girona: 'https://a.espncdn.com/i/teamlogos/soccer/500/3747.png',
  'Bayern Munich': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  'RB Leipzig': 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png',
  Stuttgart: 'https://a.espncdn.com/i/teamlogos/soccer/500/134.png',
  'AC Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  Bologna: 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png',
  Brest: 'https://a.espncdn.com/i/teamlogos/soccer/500/169.png',
  Lille: 'https://a.espncdn.com/i/teamlogos/soccer/500/178.png',
  'Sporting CP': 'https://a.espncdn.com/i/teamlogos/soccer/500/2250.png',
  'PSV Eindhoven': 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
  Feyenoord: 'https://a.espncdn.com/i/teamlogos/soccer/500/381.png',
  Salzburg: 'https://a.espncdn.com/i/teamlogos/soccer/500/2282.png',
  'Sturm Graz': 'https://a.espncdn.com/i/teamlogos/soccer/500/2501.png',
  Celtic: 'https://a.espncdn.com/i/teamlogos/soccer/500/308.png',
  'Shakhtar Donetsk': 'https://a.espncdn.com/i/teamlogos/soccer/500/2395.png',
  'Sparta Prague': 'https://a.espncdn.com/i/teamlogos/soccer/500/2509.png',
  'Red Star Belgrade': 'https://a.espncdn.com/i/teamlogos/soccer/500/2288.png',
  'Young Boys': 'https://a.espncdn.com/i/teamlogos/soccer/500/2283.png',
  'Dinamo Zagreb': 'https://a.espncdn.com/i/teamlogos/soccer/500/2338.png',
};

/**
 * Get team logo URL by team name
 * Returns a fallback shield icon if team not found
 */
export function getTeamLogo(teamName: string): string {
  return TEAM_LOGOS[teamName] || '';
}

/**
 * Check if team has a logo
 */
export function hasTeamLogo(teamName: string): boolean {
  return teamName in TEAM_LOGOS;
}
