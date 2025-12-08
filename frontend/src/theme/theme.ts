import { createTheme } from '@mui/material/styles';

/**
 * Custom Material-UI Theme
 *
 * Professional color scheme matching the backend branding:
 * - Primary: Blue (trust, professionalism, business)
 * - Secondary: Slate/Gray (neutral, modern)
 * - Success, Error, Warning: Semantic colors
 *
 * Theme provides:
 * - Consistent colors across all components
 * - Typography settings (font, sizes)
 * - Spacing system (8px grid)
 * - Component customizations
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',      // Blue 600
      light: '#60a5fa',     // Blue 400
      dark: '#1d4ed8',      // Blue 700
      contrastText: '#fff',
    },
    secondary: {
      main: '#64748b',      // Slate 500
      light: '#94a3b8',     // Slate 400
      dark: '#475569',      // Slate 600
      contrastText: '#fff',
    },
    success: {
      main: '#10b981',      // Emerald 500
      light: '#34d399',     // Emerald 400
      dark: '#059669',      // Emerald 600
    },
    error: {
      main: '#ef4444',      // Red 500
      light: '#f87171',     // Red 400
      dark: '#dc2626',      // Red 600
    },
    warning: {
      main: '#f59e0b',      // Amber 500
      light: '#fbbf24',     // Amber 400
      dark: '#d97706',      // Amber 600
    },
    info: {
      main: '#3b82f6',      // Blue 500
      light: '#60a5fa',     // Blue 400
      dark: '#2563eb',      // Blue 600
    },
    background: {
      default: '#f8fafc',   // Slate 50 - soft background
      paper: '#ffffff',     // White for cards, dialogs
    },
    text: {
      primary: '#1e293b',   // Slate 800 - main text
      secondary: '#64748b', // Slate 500 - secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Don't uppercase buttons (looks more modern)
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners (modern but not too round)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

export default theme;
