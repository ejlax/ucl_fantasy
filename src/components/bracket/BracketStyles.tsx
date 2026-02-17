import styled from 'styled-components';

/**
 * Styled components for tournament bracket
 * Based on UEFA Champions League bracket design
 */

export const BracketContainer = styled.div`
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 2rem;
  border-radius: 1rem;
  overflow-x: auto;
  min-height: 600px;
`;

export const RoundHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #2563eb;
`;

export const RoundTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

export const RoundDate = styled.p`
  font-size: 0.75rem;
  color: #64748b;
`;

export const MatchWrapper = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

export const MatchHeader = styled.div`
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
`;

export const TeamRow = styled.div<{ $isWinner?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  background: ${(props) => (props.$isWinner ? '#f0f9ff' : 'white')};

  &:last-child {
    border-bottom: none;
  }
`;

export const TeamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

export const TeamLogo = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  flex-shrink: 0;
`;

export const TeamName = styled.span<{ $isWinner?: boolean }>`
  font-size: 0.875rem;
  font-weight: ${(props) => (props.$isWinner ? '600' : '500')};
  color: ${(props) => (props.$isWinner ? '#0f172a' : '#334155')};
`;

export const Score = styled.span<{ $isWinner?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => (props.$isWinner ? '#2563eb' : '#64748b')};
  min-width: 2rem;
  text-align: center;
`;

export const TBDText = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
  font-style: italic;
`;

export const FinalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const TrophyImage = styled.div`
  width: 120px;
  height: 120px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
`;

export const ConnectorLine = styled.div`
  position: absolute;
  background: #cbd5e1;
  z-index: 0;
`;
