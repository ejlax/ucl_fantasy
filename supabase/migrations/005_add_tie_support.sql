-- Add support for two-leg ties with aggregate scoring
-- This migration adds fields to track which leg of a tie each match is

-- Add new columns to matches table
ALTER TABLE matches
ADD COLUMN leg INTEGER DEFAULT 1 CHECK (leg IN (1, 2)),
ADD COLUMN tie_id TEXT;

-- Update existing matches to set leg numbers based on match dates
-- For each pair of matches with same teams, set leg 1 and leg 2

-- Playoff matches (16 matches = 8 ties)
UPDATE matches
SET 
  tie_id = CASE
    WHEN home_team = 'Galatasaray' AND away_team = 'Juventus' THEN 'PLAYOFF-TIE-1'
    WHEN home_team = 'Juventus' AND away_team = 'Galatasaray' THEN 'PLAYOFF-TIE-1'
    WHEN home_team = 'Borussia Dortmund' AND away_team = 'Atalanta' THEN 'PLAYOFF-TIE-2'
    WHEN home_team = 'Atalanta' AND away_team = 'Borussia Dortmund' THEN 'PLAYOFF-TIE-2'
    WHEN home_team = 'Monaco' AND away_team = 'Paris Saint-Germain' THEN 'PLAYOFF-TIE-3'
    WHEN home_team = 'Paris Saint-Germain' AND away_team = 'Monaco' THEN 'PLAYOFF-TIE-3'
    WHEN home_team = 'Benfica' AND away_team = 'Real Madrid' THEN 'PLAYOFF-TIE-4'
    WHEN home_team = 'Real Madrid' AND away_team = 'Benfica' THEN 'PLAYOFF-TIE-4'
    WHEN home_team = 'Qarabağ' AND away_team = 'Newcastle United' THEN 'PLAYOFF-TIE-5'
    WHEN home_team = 'Newcastle United' AND away_team = 'Qarabağ' THEN 'PLAYOFF-TIE-5'
    WHEN home_team = 'Olympiacos' AND away_team = 'Bayer Leverkusen' THEN 'PLAYOFF-TIE-6'
    WHEN home_team = 'Bayer Leverkusen' AND away_team = 'Olympiacos' THEN 'PLAYOFF-TIE-6'
    WHEN home_team = 'Bodø/Glimt' AND away_team = 'Inter Milan' THEN 'PLAYOFF-TIE-7'
    WHEN home_team = 'Inter Milan' AND away_team = 'Bodø/Glimt' THEN 'PLAYOFF-TIE-7'
    WHEN home_team = 'Club Brugge' AND away_team = 'Atlético Madrid' THEN 'PLAYOFF-TIE-8'
    WHEN home_team = 'Atlético Madrid' AND away_team = 'Club Brugge' THEN 'PLAYOFF-TIE-8'
  END,
  leg = CASE
    WHEN match_date < '2026-02-20' THEN 1
    ELSE 2
  END
WHERE round = 'PLAYOFF';

-- Round of 16 matches (16 matches = 8 ties)
UPDATE matches
SET
  tie_id = CASE
    WHEN (home_team LIKE '%R16-1%' OR away_team LIKE '%R16-1%') THEN 'R16-TIE-1'
    WHEN (home_team LIKE '%R16-2%' OR away_team LIKE '%R16-2%') THEN 'R16-TIE-2'
    WHEN (home_team LIKE '%R16-3%' OR away_team LIKE '%R16-3%') THEN 'R16-TIE-3'
    WHEN (home_team LIKE '%R16-4%' OR away_team LIKE '%R16-4%') THEN 'R16-TIE-4'
    WHEN (home_team LIKE '%R16-5%' OR away_team LIKE '%R16-5%') THEN 'R16-TIE-5'
    WHEN (home_team LIKE '%R16-6%' OR away_team LIKE '%R16-6%') THEN 'R16-TIE-6'
    WHEN (home_team LIKE '%R16-7%' OR away_team LIKE '%R16-7%') THEN 'R16-TIE-7'
    WHEN (home_team LIKE '%R16-8%' OR away_team LIKE '%R16-8%') THEN 'R16-TIE-8'
  END,
  leg = CASE
    WHEN match_date < '2026-03-15' THEN 1
    ELSE 2
  END
WHERE round = 'R16';

-- Quarter Finals matches (8 matches = 4 ties)
UPDATE matches
SET
  tie_id = CASE
    WHEN (home_team LIKE '%QF-1%' OR away_team LIKE '%QF-1%') THEN 'QF-TIE-1'
    WHEN (home_team LIKE '%QF-2%' OR away_team LIKE '%QF-2%') THEN 'QF-TIE-2'
    WHEN (home_team LIKE '%QF-3%' OR away_team LIKE '%QF-3%') THEN 'QF-TIE-3'
    WHEN (home_team LIKE '%QF-4%' OR away_team LIKE '%QF-4%') THEN 'QF-TIE-4'
  END,
  leg = CASE
    WHEN match_date < '2026-04-10' THEN 1
    ELSE 2
  END
WHERE round = 'QF';

-- Semi Finals matches (4 matches = 2 ties)
UPDATE matches
SET
  tie_id = CASE
    WHEN (home_team LIKE '%SF-1%' OR away_team LIKE '%SF-1%') THEN 'SF-TIE-1'
    WHEN (home_team LIKE '%SF-2%' OR away_team LIKE '%SF-2%') THEN 'SF-TIE-2'
  END,
  leg = CASE
    WHEN match_date < '2026-05-01' THEN 1
    ELSE 2
  END
WHERE round = 'SF';

-- Final is a single match (no tie_id needed, leg = 1)
UPDATE matches
SET 
  tie_id = 'FINAL-SINGLE',
  leg = 1
WHERE round = 'FINAL';

-- Add index for faster tie lookups
CREATE INDEX idx_matches_tie_id ON matches(tie_id);

-- Add comment
COMMENT ON COLUMN matches.leg IS 'Which leg of the tie (1 or 2). Finals are always leg 1.';
COMMENT ON COLUMN matches.tie_id IS 'Groups two-leg matches together for aggregate scoring';

