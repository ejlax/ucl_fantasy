import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { JoinLeaguePage } from '@/pages/JoinLeaguePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LeaguesPage } from '@/pages/LeaguesPage';
import { LeagueDetailsPage } from '@/pages/LeagueDetailsPage';
import { LeagueAdminPredictionsPage } from '@/pages/LeagueAdminPredictionsPage';
import { LeaguePredictionsPage } from '@/pages/LeaguePredictionsPage';
import { BracketPage } from '@/pages/BracketPage';
import { PredictionsPage } from '@/pages/PredictionsPage';
import { StandingsPage } from '@/pages/StandingsPage';
import { LiveScoresPage } from '@/pages/LiveScoresPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { TestLivePage } from '@/pages/TestLivePage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AdminRoute } from '@/components/common/AdminRoute';
import { Layout } from '@/components/layout/Layout';
import { MatchupDesignPage } from '@/pages/design/MatchupDesignPage';
import { BracketDesignPage } from '@/pages/design/BracketDesignPage';

export function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/join/:inviteCode" element={<JoinLeaguePage />} />
      <Route path="/design/matchup" element={<MatchupDesignPage />} />
      <Route path="/design/bracket-list" element={<BracketDesignPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leagues"
        element={
          <ProtectedRoute>
            <Layout>
              <LeaguesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leagues/:leagueId"
        element={
          <ProtectedRoute>
            <Layout>
              <LeagueDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leagues/:leagueId/predictions"
        element={
          <ProtectedRoute>
            <Layout>
              <LeaguePredictionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leagues/:leagueId/admin/predictions"
        element={
          <ProtectedRoute>
            <Layout>
              <LeagueAdminPredictionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bracket"
        element={
          <ProtectedRoute>
            <Layout>
              <BracketPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/predictions"
        element={
          <ProtectedRoute>
            <Layout>
              <PredictionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/standings"
        element={
          <ProtectedRoute>
            <Layout>
              <StandingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-scores"
        element={
          <ProtectedRoute>
            <Layout>
              <LiveScoresPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/test-live"
        element={
          <ProtectedRoute>
            <TestLivePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
