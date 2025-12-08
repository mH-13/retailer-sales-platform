import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import theme from './theme/theme'
import { useAuthStore } from './store/authStore'
import './index.css'
import App from './App.tsx'

/**
 * Application Entry Point
 *
 * Wraps the app with:
 * - ThemeProvider: Applies Material-UI theme to all components
 * - CssBaseline: Resets browser default styles for consistency
 * - QueryClientProvider: Enables TanStack Query for API calls
 */

// Create QueryClient for TanStack Query
// This manages all API call states (loading, error, caching)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when user comes back to tab
    },
  },
});

/**
 * AppWrapper component
 * Initializes auth from localStorage on mount
 */
function AppWrapper() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppWrapper />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
