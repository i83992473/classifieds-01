import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { withAuthenticator } from './amplify-client.tsx'
import { SiteThemeProvider } from './ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {withAuthenticator(
      <SiteThemeProvider>
        <App />
      </SiteThemeProvider>
    )}
  </StrictMode>,
)
