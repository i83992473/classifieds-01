import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { generateClient } from 'aws-amplify/api'
import { getUrl } from 'aws-amplify/storage'
import { getSchemeById, type ColorScheme } from './colorSchemes'

// Default splash content matching the current hardcoded values
export const DEFAULT_SPLASH_CONTENT = {
  siteName: 'Classified Ad Builder',
  heroIcon: 'Newspaper',
  heroImageKey: '',
  heroTitle: 'Welcome to Classified Ad Builder',
  heroSubtitle: 'Create professional classified advertisements for your local newspaper with ease',
  ctaText: 'Create Your First Ad',
  cards: [
    {
      icon: 'Create',
      imageKey: '',
      title: 'Easy Creation',
      text: 'Build your ad with our intuitive drag-and-drop editor. Add text, images, and format your content exactly as you want it.',
    },
    {
      icon: 'Image',
      imageKey: '',
      title: 'Rich Media',
      text: 'Upload images to make your ad stand out. Support for multiple images with automatic sizing and positioning.',
    },
    {
      icon: 'Description',
      imageKey: '',
      title: 'Professional Output',
      text: 'Export your ad as a PDF ready for print. Preview exactly how it will look in the newspaper.',
    },
  ],
}

export type SplashContent = typeof DEFAULT_SPLASH_CONTENT

export interface SiteSettings {
  id?: string
  colorScheme: string
  splashContent: SplashContent
  editMode?: boolean
}

interface ThemeContextValue {
  colorScheme: ColorScheme
  siteSettings: SiteSettings
  setSiteSettings: (settings: SiteSettings) => void
  applyColorScheme: (schemeId: string) => void
  saveSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>
  loadingSiteSettings: boolean
  siteSettingsId: string | null
  imageUrls: Record<string, string>
  resolveImageUrl: (key: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within SiteThemeProvider')
  return ctx
}

const client = generateClient()

const listSiteSettingsQuery = /* GraphQL */ `
  query ListSiteSettings($filter: ModelSiteSettingsFilterInput, $limit: Int) {
    listSiteSettings(filter: $filter, limit: $limit) {
      items {
        id
        settingKey
        colorScheme
        splashContent
        createdAt
        updatedAt
        owner
      }
    }
  }
`

const createSiteSettingsMutation = /* GraphQL */ `
  mutation CreateSiteSettings($input: CreateSiteSettingsInput!) {
    createSiteSettings(input: $input) {
      id
      settingKey
      colorScheme
      splashContent
    }
  }
`

const updateSiteSettingsMutation = /* GraphQL */ `
  mutation UpdateSiteSettings($input: UpdateSiteSettingsInput!) {
    updateSiteSettings(input: $input) {
      id
      settingKey
      colorScheme
      splashContent
    }
  }
`

function applyCssVariables(scheme: ColorScheme) {
  const root = document.documentElement
  root.style.setProperty('--color-primary', scheme.primary)
  root.style.setProperty('--color-primary-strong', scheme.primaryStrong)
  root.style.setProperty('--color-primary-soft', scheme.primarySoft)
  root.style.setProperty('--color-secondary', scheme.secondary)
  root.style.setProperty('--color-secondary-soft', scheme.secondarySoft)
  root.style.setProperty('--color-surface', scheme.surface)
  root.style.setProperty('--color-surface-strong', scheme.surfaceStrong)
  root.style.setProperty('--color-surface-muted', scheme.surfaceMuted)
  root.style.setProperty('--color-text', scheme.text)
  root.style.setProperty('--color-text-muted', scheme.textMuted)
  root.style.setProperty('--color-border', scheme.border)
}

function createMuiTheme(scheme: ColorScheme) {
  return createTheme({
    palette: {
      primary: {
        main: scheme.primary,
        light: scheme.primarySoft,
        dark: scheme.primaryStrong,
        contrastText: '#f9f9f9',
      },
      secondary: {
        main: scheme.secondary,
        light: scheme.secondarySoft,
        dark: scheme.primarySoft,
        contrastText: '#ffffff',
      },
      background: {
        default: scheme.surface,
        paper: '#ffffff',
      },
      grey: {
        50: scheme.surface,
        100: scheme.surfaceStrong,
        200: scheme.surfaceMuted,
        300: scheme.border,
        400: scheme.secondary,
        500: scheme.primarySoft,
      },
      text: {
        primary: scheme.text,
        secondary: scheme.textMuted,
      },
    },
    typography: {
      fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 600, letterSpacing: '-0.01em' },
      h2: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: scheme.primary,
            boxShadow: 'none',
            borderBottom: `1px solid ${scheme.border}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: scheme.primary,
            '&:hover': { backgroundColor: scheme.primaryStrong },
          },
          outlinedPrimary: {
            borderColor: scheme.primary,
            color: scheme.primary,
            '&:hover': {
              borderColor: scheme.primaryStrong,
              backgroundColor: `${scheme.primary}14`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  })
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [schemeId, setSchemeId] = useState('greyscale')
  const [siteSettingsId, setSiteSettingsId] = useState<string | null>(null)
  const [splashContent, setSplashContent] = useState<SplashContent>(DEFAULT_SPLASH_CONTENT)
  const [loading, setLoading] = useState(true)

  const scheme = useMemo(() => getSchemeById(schemeId), [schemeId])
  const muiTheme = useMemo(() => createMuiTheme(scheme), [scheme])

  const siteSettings: SiteSettings = useMemo(() => ({
    id: siteSettingsId || undefined,
    colorScheme: schemeId,
    splashContent,
  }), [siteSettingsId, schemeId, splashContent])

  // Load site settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const result = await client.graphql({
          query: listSiteSettingsQuery,
          variables: { filter: { settingKey: { eq: 'global' } }, limit: 1 },
          authMode: 'userPool',
        }) as { data: { listSiteSettings: { items: Array<{ id: string; colorScheme?: string; splashContent?: string }> } } }

        const items = result.data.listSiteSettings.items
        if (items.length > 0) {
          const record = items[0]
          setSiteSettingsId(record.id)
          if (record.colorScheme) {
            setSchemeId(record.colorScheme)
            applyCssVariables(getSchemeById(record.colorScheme))
          }
          if (record.splashContent) {
            try {
              const parsed = JSON.parse(record.splashContent)
              setSplashContent({ ...DEFAULT_SPLASH_CONTENT, ...parsed })
            } catch { /* use defaults */ }
          }
        }
      } catch (error) {
        console.error('Error loading site settings:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Apply CSS variables whenever scheme changes
  useEffect(() => {
    applyCssVariables(scheme)
  }, [scheme])

  const applyColorScheme = (newSchemeId: string) => {
    setSchemeId(newSchemeId)
  }

  const setSiteSettingsHandler = (settings: SiteSettings) => {
    if (settings.colorScheme) setSchemeId(settings.colorScheme)
    if (settings.splashContent) setSplashContent(settings.splashContent)
    if (settings.id) setSiteSettingsId(settings.id)
  }

  const saveSiteSettings = async (updates: Partial<SiteSettings>) => {
    const newScheme = updates.colorScheme || schemeId
    const newSplash = updates.splashContent || splashContent

    try {
      if (siteSettingsId) {
        // Update existing
        const result = await client.graphql({
          query: updateSiteSettingsMutation,
          variables: {
            input: {
              id: siteSettingsId,
              colorScheme: newScheme,
              splashContent: JSON.stringify(newSplash),
            },
          },
          authMode: 'userPool',
        }) as { data: { updateSiteSettings: { id: string } } }
        setSiteSettingsId(result.data.updateSiteSettings.id)
      } else {
        // Create new
        const result = await client.graphql({
          query: createSiteSettingsMutation,
          variables: {
            input: {
              settingKey: 'global',
              colorScheme: newScheme,
              splashContent: JSON.stringify(newSplash),
            },
          },
          authMode: 'userPool',
        }) as { data: { createSiteSettings: { id: string } } }
        setSiteSettingsId(result.data.createSiteSettings.id)
      }

      if (updates.colorScheme) setSchemeId(updates.colorScheme)
      if (updates.splashContent) setSplashContent(updates.splashContent)
    } catch (error) {
      console.error('Error saving site settings:', error)
      throw error
    }
  }

  // Image URL resolution for S3 keys
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  const resolveImageUrl = useCallback((key: string) => {
    if (!key || imageUrls[key]) return
    getUrl({ path: key }).then(result => {
      setImageUrls(prev => ({ ...prev, [key]: result.url.toString() }))
    }).catch(e => console.error('Error resolving image URL:', e))
  }, [imageUrls])

  // Resolve image URLs from splash content on load
  useEffect(() => {
    if (splashContent.heroImageKey) resolveImageUrl(splashContent.heroImageKey)
    splashContent.cards.forEach(card => {
      if (card.imageKey) resolveImageUrl(card.imageKey)
    })
  }, [splashContent]) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: ThemeContextValue = useMemo(() => ({
    colorScheme: scheme,
    siteSettings,
    setSiteSettings: setSiteSettingsHandler,
    applyColorScheme,
    saveSiteSettings,
    loadingSiteSettings: loading,
    siteSettingsId,
    imageUrls,
    resolveImageUrl,
  }), [scheme, siteSettings, loading, siteSettingsId, imageUrls, resolveImageUrl])

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
