import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import { withAuthenticator } from './amplify-client.tsx'

const theme = createTheme({
  palette: {
    primary: {
      main: 'var(--color-primary)',
      light: 'var(--color-primary-soft)',
      dark: 'var(--color-primary-strong)',
      contrastText: '#f9f9f9',
    },
    secondary: {
      main: 'var(--color-secondary)',
      light: 'var(--color-secondary-soft)',
      dark: '#6f747b',
      contrastText: '#ffffff',
    },
    background: {
      default: 'var(--color-surface)',
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
      primary: 'var(--color-text)',
      secondary: 'var(--color-text-muted)',
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
          backgroundColor: 'var(--color-primary)',
          boxShadow: 'none',
          borderBottom: '1px solid var(--color-border)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: 'var(--color-primary)',
          '&:hover': {
            backgroundColor: 'var(--color-primary-strong)',
          },
        },
        outlinedPrimary: {
          borderColor: 'var(--color-primary)',
          color: 'var(--color-primary)',
          '&:hover': {
            borderColor: 'var(--color-primary-strong)',
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
