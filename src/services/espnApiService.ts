/**
 * ESPN API Service
 * Fetches live Champions League match data from ESPN's public API
 */

const ESPN_UCL_API = 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard';

// ESPN Team ID to our team name mapping
const ESPN_TEAM_ID_MAP: Record<string, string> = {
  '160': 'Paris Saint-Germain',
  '361': 'Newcastle United',
  '111': 'Juventus',
  '174': 'AS Monaco',
  '435': 'Olympiacos',
  '432': 'Galatasaray',
  '124': 'Borussia Dortmund',
  '105': 'Atalanta',
  '1929': 'Benfica',
  '86': 'Real Madrid',
  '10414': 'Qarabağ',
  '131': 'Bayer Leverkusen',
  '110': 'Inter Milan',
  '570': 'Club Brugge',
  '1068': 'Atletico Madrid',
  '382': 'Manchester City',
  '364': 'Liverpool',
  '359': 'Arsenal',
  '362': 'Aston Villa',
  '83': 'Barcelona',
  '132': 'Bayern Munich',
  '103': 'AC Milan',
  '2250': 'Sporting CP',
  '148': 'PSV Eindhoven',
  '381': 'Feyenoord',
  '2282': 'Salzburg',
  '308': 'Celtic',
  '2395': 'Shakhtar Donetsk',
  '93': 'Athletic Club',
};

export interface ESPNTeam {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  logo: string;
  color: string;
  score?: string;
  winner?: boolean;
}

export interface ESPNMatchStatus {
  completed: boolean;
  inProgress: boolean;
  scheduled: boolean;
  clock?: number;
  displayClock?: string;
  period?: number;
}

export interface ESPNMatch {
  id: string;
  date: string;
  name: string;
  shortName: string;
  homeTeam: ESPNTeam;
  awayTeam: ESPNTeam;
  status: ESPNMatchStatus;
  venue?: {
    name: string;
    city: string;
    country: string;
  };
  attendance?: number;
  round?: string;
}

export interface ESPNScoreboardResponse {
  leagues: Array<{
    season: {
      year: number;
      type: {
        name: string;
        abbreviation: string;
      };
    };
  }>;
  events: Array<{
    id: string;
    date: string;
    name: string;
    shortName: string;
    season: {
      year: number;
      type: number;
      slug: string;
    };
    competitions: Array<{
      id: string;
      date: string;
      attendance?: number;
      status: {
        clock?: number;
        displayClock?: string;
        period?: number;
        type: {
          id: string;
          name: string;
          state: string;
          completed: boolean;
        };
      };
      venue?: {
        fullName: string;
        address: {
          city: string;
          country: string;
        };
      };
      competitors: Array<{
        id: string;
        type: string;
        order: number;
        homeAway: 'home' | 'away';
        winner?: boolean;
        score?: string;
        team: {
          id: string;
          name: string;
          displayName: string;
          abbreviation: string;
          logo: string;
          color: string;
        };
      }>;
    }>;
  }>;
}

export const espnApiService = {
  /**
   * Fetch current Champions League scoreboard
   */
  async fetchScoreboard(): Promise<ESPNScoreboardResponse> {
    const response = await fetch(ESPN_UCL_API);
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Parse ESPN response into simplified match format
   */
  parseMatches(data: ESPNScoreboardResponse): ESPNMatch[] {
    const matches: ESPNMatch[] = [];

    for (const event of data.events) {
      const competition = event.competitions[0];
      if (!competition) continue;

      const homeCompetitor = competition.competitors.find((c) => c.homeAway === 'home');
      const awayCompetitor = competition.competitors.find((c) => c.homeAway === 'away');

      if (!homeCompetitor || !awayCompetitor) continue;

      matches.push({
        id: event.id,
        date: event.date,
        name: event.name,
        shortName: event.shortName,
        homeTeam: {
          id: homeCompetitor.team.id,
          name: homeCompetitor.team.name,
          displayName: homeCompetitor.team.displayName,
          abbreviation: homeCompetitor.team.abbreviation,
          logo: homeCompetitor.team.logo,
          color: homeCompetitor.team.color,
          score: homeCompetitor.score,
          winner: homeCompetitor.winner,
        },
        awayTeam: {
          id: awayCompetitor.team.id,
          name: awayCompetitor.team.name,
          displayName: awayCompetitor.team.displayName,
          abbreviation: awayCompetitor.team.abbreviation,
          logo: awayCompetitor.team.logo,
          color: awayCompetitor.team.color,
          score: awayCompetitor.score,
          winner: awayCompetitor.winner,
        },
        status: {
          completed: competition.status.type.completed,
          inProgress: competition.status.type.state === 'in',
          scheduled: competition.status.type.state === 'pre',
          clock: competition.status.clock,
          displayClock: competition.status.displayClock,
          period: competition.status.period,
        },
        venue: competition.venue
          ? {
            name: competition.venue.fullName,
            city: competition.venue.address.city,
            country: competition.venue.address.country,
          }
          : undefined,
        attendance: competition.attendance,
        round: event.season.slug,
      });
    }

    return matches;
  },

  /**
   * Get all current matches
   */
  async getCurrentMatches(): Promise<ESPNMatch[]> {
    const data = await this.fetchScoreboard();
    return this.parseMatches(data);
  },

  /**
   * Get live matches only
   */
  async getLiveMatches(): Promise<ESPNMatch[]> {
    const matches = await this.getCurrentMatches();
    return matches.filter((m) => m.status.inProgress);
  },

  /**
   * Get completed matches
   */
  async getCompletedMatches(): Promise<ESPNMatch[]> {
    const matches = await this.getCurrentMatches();
    return matches.filter((m) => m.status.completed);
  },

  /**
   * Get upcoming matches
   */
  async getUpcomingMatches(): Promise<ESPNMatch[]> {
    const matches = await this.getCurrentMatches();
    return matches.filter((m) => m.status.scheduled);
  },

  /**
   * Map ESPN team name to our database team name
   */
  mapTeamName(espnTeamName: string): string {
    // Direct mapping for known variations
    const nameMap: Record<string, string> = {
      'Paris Saint-Germain': 'Paris Saint-Germain',
      PSG: 'Paris Saint-Germain',
      'Newcastle United': 'Newcastle United',
      Newcastle: 'Newcastle United',
      Juventus: 'Juventus',
      'AS Monaco': 'Monaco',
      Monaco: 'Monaco',
      Olympiacos: 'Olympiacos',
      Galatasaray: 'Galatasaray',
      'Borussia Dortmund': 'Borussia Dortmund',
      Dortmund: 'Borussia Dortmund',
      Atalanta: 'Atalanta',
      Benfica: 'Benfica',
      'Real Madrid': 'Real Madrid',
      Madrid: 'Real Madrid',
      'Qarabağ': 'Qarabağ',
      'Bayer Leverkusen': 'Bayer Leverkusen',
      Leverkusen: 'Bayer Leverkusen',
      'Inter Milan': 'Inter Milan',
      Inter: 'Inter Milan',
      'Club Brugge': 'Club Brugge',
      Brugge: 'Club Brugge',
      'Atletico Madrid': 'Atletico Madrid',
      'Atlético Madrid': 'Atletico Madrid',
      Atletico: 'Atletico Madrid',
      'Manchester City': 'Manchester City',
      Liverpool: 'Liverpool',
      Arsenal: 'Arsenal',
      'Aston Villa': 'Aston Villa',
      Barcelona: 'Barcelona',
      'Bayern Munich': 'Bayern Munich',
      Bayern: 'Bayern Munich',
      'AC Milan': 'AC Milan',
      Milan: 'AC Milan',
      'Sporting CP': 'Sporting CP',
      Sporting: 'Sporting CP',
      'PSV Eindhoven': 'PSV Eindhoven',
      PSV: 'PSV Eindhoven',
      Feyenoord: 'Feyenoord',
      Salzburg: 'Salzburg',
      Celtic: 'Celtic',
      'Shakhtar Donetsk': 'Shakhtar Donetsk',
      Shakhtar: 'Shakhtar Donetsk',
      'Athletic Club': 'Athletic Club',
      Athletic: 'Athletic Club',
    };

    return nameMap[espnTeamName] || espnTeamName;
  },
};


