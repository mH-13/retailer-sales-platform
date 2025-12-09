import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RetailersPage from './pages/RetailersPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import ImportCSVPage from './pages/ImportCSVPage';
import BulkAssignmentPage from './pages/BulkAssignmentPage';
import SalesRepsPage from './pages/SalesRepsPage';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * App Component - Main Router
 *
 * Defines all application routes:
 * - /login - Public login page
 * - /dashboard - Protected dashboard (requires auth)
 * - /retailers - Protected retailers list (requires auth)
 * - /admin - Protected admin reference data page (requires auth + ADMIN role)
 * - /import-csv - Protected CSV import page (requires auth + ADMIN role)
 * - /bulk-assignment - Protected bulk assignment page (requires auth + ADMIN role)
 * - /settings - Protected settings page (requires auth)
 * - / - Redirects to dashboard if logged in, otherwise to login
 */
function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Show loading spinner while initializing auth from localStorage
  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/retailers"
          element={
            <ProtectedRoute>
              <RetailersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/import-csv"
          element={
            <ProtectedRoute>
              <ImportCSVPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bulk-assignment"
          element={
            <ProtectedRoute>
              <BulkAssignmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/salesreps"
          element={
            <ProtectedRoute>
              <SalesRepsPage />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 - Not Found (redirects to root) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
