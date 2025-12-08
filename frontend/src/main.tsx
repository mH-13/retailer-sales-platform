import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme/theme'
import './index.css'
import App from './App.tsx'

/**
 * Application Entry Point
 *
 * Wraps the app with:
 * - ThemeProvider: Applies Material-UI theme to all components
 * - CssBaseline: Resets browser default styles for consistency
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
