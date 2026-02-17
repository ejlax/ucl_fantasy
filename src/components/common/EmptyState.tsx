import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Empty state component for when there's no data to display
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className}`}
    >
      {Icon && (
        <div className="bg-secondary-100 mb-4 rounded-full p-3">
          <Icon className="text-secondary-400 h-12 w-12" />
        </div>
      )}
      <h3 className="text-secondary-900 mb-2 text-xl font-semibold">{title}</h3>
      {description && <p className="text-secondary-600 mb-6 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
