import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import { withAuthenticator } from './amplify-client.tsx'

const getCssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const themeTokens = {
  primary: getCssVar('--color-primary', '#4b4f55'),
  primaryStrong: getCssVar('--color-primary-strong', '#3b3f44'),
  primarySoft: getCssVar('--color-primary-soft', '#6a6f76'),
  secondary: getCssVar('--color-secondary', '#8b9097'),
  secondarySoft: getCssVar('--color-secondary-soft', '#b6bbc1'),
  surface: getCssVar('--color-surface', '#f5f6f7'),
  surfaceStrong: getCssVar('--color-surface-strong', '#e2e4e7'),
  surfaceMuted: getCssVar('--color-surface-muted', '#d3d6da'),
  text: getCssVar('--color-text', '#1d1f22'),
  textMuted: getCssVar('--color-text-muted', '#5d6269'),
  border: getCssVar('--color-border', '#c3c7cc'),
}

const theme = createTheme({
  palette: {
    primary: {
      main: themeTokens.primary,
      light: themeTokens.primarySoft,
      dark: themeTokens.primaryStrong,
      contrastText: '#f9f9f9',
    },
    secondary: {
      main: themeTokens.secondary,
      light: themeTokens.secondarySoft,
      dark: '#6f747b',
      contrastText: '#ffffff',
    },
    background: {
      default: themeTokens.surface,
      paper: '#ffffff',
    },
    grey: {
      50: '#f5f6f7',
      100: '#e2e4e7',
      200: '#d3d6da',
      300: '#c3c7cc',
      400: '#8b9097',
      500: '#6a6f76',
    },
    text: {
      primary: themeTokens.text,
      secondary: themeTokens.textMuted,
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: themeTokens.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${themeTokens.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: themeTokens.primary,
          '&:hover': {
            backgroundColor: themeTokens.primaryStrong,
          },
        },
        outlinedPrimary: {
          borderColor: themeTokens.primary,
          color: themeTokens.primary,
          '&:hover': {
            borderColor: themeTokens.primaryStrong,
            backgroundColor: 'rgba(75, 79, 85, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {withAuthenticator(<App />)}
    </ThemeProvider>
  </StrictMode>,
)
