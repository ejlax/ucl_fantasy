import { ReactNode } from 'react';
import { formatRoundName } from '@/utils/formatting';

interface RoundSectionProps {
  round: string;
  children: ReactNode;
  className?: string;
}

/**
 * Section component for grouping matches by round
 */
export function RoundSection({ round, children, className = '' }: RoundSectionProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-secondary-900 border-primary-500 mb-4 border-b-2 pb-2 text-2xl font-bold">
        {formatRoundName(round)}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}
