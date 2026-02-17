import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper with header and content area
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-secondary-50 min-h-screen">
      <Header />
      <main>{children}</main>
    </div>
  );
}
