interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading spinner component
 */
export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  const containerClasses = fullScreen
    ? 'flex min-h-screen items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
        <p className="text-secondary-600">{message}</p>
      </div>
    </div>
  );
}
