import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import { withAuthenticator } from './amplify-client.tsx'

// Frosted Aura color scheme
// Primary: #5c7e8f (steel blue)
// Secondary: #a2a2a2 (gray)
// Light: #d4dde2 (light gray-blue)
// Background: #ffffff (white)
const theme = createTheme({
  palette: {
    primary: {
      main: '#5c7e8f',
      light: '#8aacbd',
      dark: '#3d5562',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a2a2a2',
      light: '#d4d4d4',
      dark: '#717171',
      contrastText: '#ffffff',
    },
    background: {
      default: '#d4dde2',
      paper: '#ffffff',
    },
    grey: {
      50: '#f5f7f8',
      100: '#d4dde2',
      200: '#b8c5cc',
      300: '#a2a2a2',
      400: '#8a8a8a',
      500: '#6e6e6e',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#5c7e8f',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#4a6a79',
          },
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
