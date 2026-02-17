import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Menu, X, User, LogOut, Settings, Shield, Radio } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export function Header() {
  const { user, signOut, isAuthenticated } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="border-secondary-200 border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="text-primary-600 h-8 w-8" />
            <span className="text-secondary-900 text-xl font-bold">UCL Fantasy</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden items-center gap-6 md:flex">
              <Link to="/live-scores" className="text-secondary-700 hover:text-primary-600 flex items-center gap-1.5">
                <Radio className="h-4 w-4" />
                Live Scores
              </Link>
              <Link to="/leagues" className="text-secondary-700 hover:text-primary-600">
                My Leagues
              </Link>
              <Link to="/bracket" className="text-secondary-700 hover:text-primary-600">
                Bracket
              </Link>
              <Link to="/predictions" className="text-secondary-700 hover:text-primary-600">
                Predictions
              </Link>
              <Link to="/standings" className="text-secondary-700 hover:text-primary-600">
                Standings
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="hover:bg-secondary-100 flex items-center gap-2 rounded-lg px-3 py-2"
                >
                  <div className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-white">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-secondary-900 hidden text-sm font-medium sm:block">
                    {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                    <div className="border-secondary-200 absolute right-0 z-20 mt-2 w-48 rounded-lg border bg-white shadow-lg">
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="text-secondary-700 hover:bg-secondary-100 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="text-secondary-700 hover:bg-secondary-100 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="text-secondary-700 hover:bg-secondary-100 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="border-secondary-200 my-2" />
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-outline">
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
                {mobileMenuOpen ? (
                  <X className="text-secondary-700 h-6 w-6" />
                ) : (
                  <Menu className="text-secondary-700 h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && mobileMenuOpen && (
          <nav className="border-secondary-200 border-t py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link
                to="/live-scores"
                className="text-secondary-700 hover:bg-secondary-100 rounded-lg px-3 py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Radio className="h-4 w-4" />
                Live Scores
              </Link>
              <Link
                to="/leagues"
                className="text-secondary-700 hover:bg-secondary-100 rounded-lg px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Leagues
              </Link>
              <Link
                to="/bracket"
                className="text-secondary-700 hover:bg-secondary-100 rounded-lg px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bracket
              </Link>
              <Link
                to="/predictions"
                className="text-secondary-700 hover:bg-secondary-100 rounded-lg px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Predictions
              </Link>
              <Link
                to="/standings"
                className="text-secondary-700 hover:bg-secondary-100 rounded-lg px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Standings
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
