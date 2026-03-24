import { useState, useRef, useCallback } from 'react'
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  AppBar,
  Toolbar,
  Divider,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import ImageIcon from '@mui/icons-material/Image'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import LinkIcon from '@mui/icons-material/Link'
import CloseIcon from '@mui/icons-material/Close'

// Icons for the icon picker
import NewspaperIcon from '@mui/icons-material/Newspaper'
import CreateIcon from '@mui/icons-material/Create'
import DescriptionIcon from '@mui/icons-material/Description'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CampaignIcon from '@mui/icons-material/Campaign'
import WorkIcon from '@mui/icons-material/Work'
import HomeIcon from '@mui/icons-material/Home'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PetsIcon from '@mui/icons-material/Pets'
import SchoolIcon from '@mui/icons-material/School'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import BusinessIcon from '@mui/icons-material/Business'
import HandshakeIcon from '@mui/icons-material/Handshake'
import StarIcon from '@mui/icons-material/Star'
import DiamondIcon from '@mui/icons-material/Diamond'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects'
import PublicIcon from '@mui/icons-material/Public'
import type { SvgIconComponent } from '@mui/icons-material'

import { uploadData, getUrl } from 'aws-amplify/storage'
import { COLOR_SCHEMES } from './colorSchemes'
import { useThemeContext, type SplashContent } from './ThemeContext'

const APPBAR_HEIGHT = 64

// Map icon names to components
const ICON_MAP: Record<string, SvgIconComponent> = {
  Newspaper: NewspaperIcon,
  Create: CreateIcon,
  Description: DescriptionIcon,
  Image: ImageIcon,
  Storefront: StorefrontIcon,
  Campaign: CampaignIcon,
  Work: WorkIcon,
  Home: HomeIcon,
  DirectionsCar: DirectionsCarIcon,
  Pets: PetsIcon,
  School: SchoolIcon,
  LocalOffer: LocalOfferIcon,
  ShoppingCart: ShoppingCartIcon,
  Business: BusinessIcon,
  Handshake: HandshakeIcon,
  Star: StarIcon,
  Diamond: DiamondIcon,
  RocketLaunch: RocketLaunchIcon,
  AutoAwesome: AutoAwesomeIcon,
  EmojiObjects: EmojiObjectsIcon,
  Public: PublicIcon,
}

export function getIconComponent(name: string): SvgIconComponent {
  return ICON_MAP[name] || NewspaperIcon
}

interface SiteSetupProps {
  onBack: () => void
}

function renderRichText(html: string) {
  if (!html.includes('<')) return html
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export default function SiteSetup({ onBack }: SiteSetupProps) {
  const { siteSettings, applyColorScheme, saveSiteSettings } = useThemeContext()
  const [splash, setSplash] = useState<SplashContent>(siteSettings.splashContent)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })
  const [selectedScheme, setSelectedScheme] = useState(siteSettings.colorScheme)

  // Text editor dialog state
  const [textEditorOpen, setTextEditorOpen] = useState(false)
  const [textEditorField, setTextEditorField] = useState<string>('')
  const [textEditorCardIndex, setTextEditorCardIndex] = useState<number | null>(null)
  const [textEditorValue, setTextEditorValue] = useState('')
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  // Icon picker dialog state
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [iconPickerCardIndex, setIconPickerCardIndex] = useState<number | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image URL cache
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  const loadImageUrl = useCallback(async (key: string) => {
    if (!key || imageUrls[key]) return
    try {
      const result = await getUrl({ path: key })
      setImageUrls(prev => ({ ...prev, [key]: result.url.toString() }))
    } catch (e) {
      console.error('Error loading image URL:', e)
    }
  }, [imageUrls])

  // Load any existing image URLs
  useState(() => {
    if (splash.heroImageKey) loadImageUrl(splash.heroImageKey)
    splash.cards.forEach(card => {
      if (card.imageKey) loadImageUrl(card.imageKey)
    })
  })

  const handleSchemeSelect = async (schemeId: string) => {
    setSelectedScheme(schemeId)
    applyColorScheme(schemeId)
    setSaving(true)
    try {
      await saveSiteSettings({ colorScheme: schemeId })
      setSnackbar({ open: true, message: 'Color scheme saved', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to save color scheme', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Text editing
  const openTextEditor = (field: string, cardIndex: number | null = null) => {
    let currentValue = ''
    if (cardIndex !== null) {
      const card = splash.cards[cardIndex]
      currentValue = field === 'title' ? card.title : card.text
    } else {
      currentValue = (splash as Record<string, unknown>)[field] as string || ''
    }
    setTextEditorField(field)
    setTextEditorCardIndex(cardIndex)
    setTextEditorValue(currentValue)
    setTextEditorOpen(true)
  }

  const saveTextEditor = async () => {
    const newSplash = { ...splash }
    if (textEditorCardIndex !== null) {
      const cards = [...newSplash.cards]
      cards[textEditorCardIndex] = { ...cards[textEditorCardIndex], [textEditorField]: textEditorValue }
      newSplash.cards = cards
    } else {
      ;(newSplash as Record<string, unknown>)[textEditorField] = textEditorValue
    }
    setSplash(newSplash)
    setTextEditorOpen(false)
    setSaving(true)
    try {
      await saveSiteSettings({ splashContent: newSplash })
      setSnackbar({ open: true, message: 'Text saved', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to save text', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const insertFormatting = (tag: string) => {
    const textarea = textInputRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textEditorValue.substring(start, end)
    if (selected) {
      const formatted = `<${tag}>${selected}</${tag}>`
      const newValue = textEditorValue.substring(0, start) + formatted + textEditorValue.substring(end)
      setTextEditorValue(newValue)
    }
  }

  const insertLink = () => {
    if (!linkUrl || !linkText) return
    const textarea = textInputRef.current
    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
    if (textarea) {
      const start = textarea.selectionStart
      const newValue = textEditorValue.substring(0, start) + linkHtml + textEditorValue.substring(start)
      setTextEditorValue(newValue)
    } else {
      setTextEditorValue(textEditorValue + linkHtml)
    }
    setLinkDialogOpen(false)
    setLinkUrl('')
    setLinkText('')
  }

  // Icon picking
  const openIconPicker = (_field: string, cardIndex: number | null = null) => {
    setIconPickerCardIndex(cardIndex)
    setIconPickerOpen(true)
  }

  const selectIcon = async (iconName: string) => {
    const newSplash = { ...splash }
    if (iconPickerCardIndex !== null) {
      const cards = [...newSplash.cards]
      cards[iconPickerCardIndex] = { ...cards[iconPickerCardIndex], icon: iconName, imageKey: '' }
      newSplash.cards = cards
    } else {
      newSplash.heroIcon = iconName
      newSplash.heroImageKey = ''
    }
    setSplash(newSplash)
    setIconPickerOpen(false)
    setSaving(true)
    try {
      await saveSiteSettings({ splashContent: newSplash })
      setSnackbar({ open: true, message: 'Icon saved', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to save icon', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      // Resize the image for display
      const resized = await resizeImage(file, 400, 400)
      const key = `public/site-setup/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      await uploadData({
        path: key,
        data: resized,
        options: { contentType: resized.type },
      }).result

      // Update splash content
      const newSplash = { ...splash }
      if (iconPickerCardIndex !== null) {
        const cards = [...newSplash.cards]
        cards[iconPickerCardIndex] = { ...cards[iconPickerCardIndex], icon: '', imageKey: key }
        newSplash.cards = cards
      } else {
        newSplash.heroIcon = ''
        newSplash.heroImageKey = key
      }
      setSplash(newSplash)

      // Load the URL for display
      const urlResult = await getUrl({ path: key })
      setImageUrls(prev => ({ ...prev, [key]: urlResult.url.toString() }))

      setIconPickerOpen(false)
      await saveSiteSettings({ splashContent: newSplash })
      setSnackbar({ open: true, message: 'Image uploaded and saved', severity: 'success' })
    } catch (err) {
      console.error('Error uploading image:', err)
      setSnackbar({ open: true, message: 'Failed to upload image', severity: 'error' })
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: 'background.default', overflow: 'auto' }}>
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Tooltip title="Back">
            <IconButton color="inherit" onClick={onBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Site Setup
          </Typography>
          {saving && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mr: 2 }}>Saving...</Typography>}
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: `${APPBAR_HEIGHT + 24}px`, px: 4, pb: 4, maxWidth: 1200, mx: 'auto' }}>
        {/* Section 1: Color Scheme */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Color Scheme
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a color scheme for the entire site. This will change backgrounds, buttons, icons, and text colors. Status badges and action buttons (approve, delete, etc.) are not affected.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 6 }}>
          {COLOR_SCHEMES.map((scheme) => (
            <Paper
              key={scheme.id}
              elevation={selectedScheme === scheme.id ? 8 : 1}
              onClick={() => handleSchemeSelect(scheme.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: selectedScheme === scheme.id ? `3px solid ${scheme.primary}` : '3px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { elevation: 4, transform: 'translateY(-2px)' },
                position: 'relative',
              }}
            >
              {selectedScheme === scheme.id && (
                <CheckCircleIcon sx={{ position: 'absolute', top: 8, right: 8, color: scheme.primary, fontSize: 20 }} />
              )}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: scheme.text }}>
                {scheme.name}
              </Typography>
              {/* Color preview swatches */}
              <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: scheme.primary }} />
                <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: scheme.primarySoft }} />
                <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: scheme.secondary }} />
                <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: scheme.secondarySoft }} />
              </Stack>
              {/* Mini preview bar */}
              <Box sx={{ bgcolor: scheme.primary, borderRadius: 0.5, p: 0.5, mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#f9f9f9', fontSize: '0.6rem' }}>App Bar</Typography>
              </Box>
              <Box sx={{ bgcolor: scheme.surface, borderRadius: 0.5, p: 0.5, border: `1px solid ${scheme.border}` }}>
                <Typography variant="caption" sx={{ color: scheme.text, fontSize: '0.6rem' }}>Content</Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Section 2: Splash Page Editor */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Splash Page Editor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toggle edit mode to customize the text, icons, and images on the home/splash page.
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={editMode} onChange={(_, checked) => setEditMode(checked)} />}
            label={editMode ? 'Editing' : 'Preview'}
            labelPlacement="start"
          />
        </Stack>

        {/* Splash Page Preview */}
        <Paper elevation={3} sx={{ overflow: 'hidden', border: editMode ? '2px dashed' : 'none', borderColor: 'primary.main' }}>
          {/* Mini App Bar preview */}
          <Box sx={{ bgcolor: 'primary.main', px: 3, py: 1.5, display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ color: '#f9f9f9', fontWeight: 600, flexGrow: 1 }}>
              {renderRichText(splash.siteName)}
            </Typography>
            {editMode && (
              <Tooltip title="Edit site name">
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }} onClick={() => openTextEditor('siteName')}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', py: 6, px: 4, bgcolor: 'grey.100' }}>
            {/* Hero Icon/Image */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              {splash.heroImageKey && imageUrls[splash.heroImageKey] ? (
                <Box
                  component="img"
                  src={imageUrls[splash.heroImageKey]}
                  alt="Hero"
                  sx={{ width: 80, height: 80, objectFit: 'contain' }}
                />
              ) : (
                (() => {
                  const IconComp = getIconComponent(splash.heroIcon)
                  return <IconComp sx={{ fontSize: 80, color: 'primary.main' }} />
                })()
              )}
              {editMode && (
                <Tooltip title="Change icon or upload image">
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute', top: -8, right: -8,
                      bgcolor: 'primary.main', color: '#fff',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 28, height: 28,
                    }}
                    onClick={() => openIconPicker('heroIcon')}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Hero Title */}
            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                {renderRichText(splash.heroTitle)}
              </Typography>
              {editMode && (
                <Tooltip title="Edit title">
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute', top: 0, right: -40,
                      bgcolor: 'primary.main', color: '#fff',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 28, height: 28,
                    }}
                    onClick={() => openTextEditor('heroTitle')}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Hero Subtitle */}
            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                {renderRichText(splash.heroSubtitle)}
              </Typography>
              {editMode && (
                <Tooltip title="Edit subtitle">
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute', top: 0, right: -40,
                      bgcolor: 'primary.main', color: '#fff',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 28, height: 28,
                    }}
                    onClick={() => openTextEditor('heroSubtitle')}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Feature Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, p: 4, bgcolor: 'grey.100' }}>
            {splash.cards.map((card, idx) => (
              <Paper key={idx} elevation={2} sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
                {/* Card Icon/Image */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  {card.imageKey && imageUrls[card.imageKey] ? (
                    <Box
                      component="img"
                      src={imageUrls[card.imageKey]}
                      alt={card.title}
                      sx={{ width: 48, height: 48, objectFit: 'contain' }}
                    />
                  ) : (
                    (() => {
                      const IconComp = getIconComponent(card.icon)
                      return <IconComp sx={{ fontSize: 48, color: 'primary.main' }} />
                    })()
                  )}
                  {editMode && (
                    <Tooltip title="Change icon or upload image">
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute', top: -8, right: -8,
                          bgcolor: 'primary.main', color: '#fff',
                          '&:hover': { bgcolor: 'primary.dark' },
                          width: 24, height: 24,
                        }}
                        onClick={() => openIconPicker('icon', idx)}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Card Title */}
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {renderRichText(card.title)}
                  </Typography>
                  {editMode && (
                    <Tooltip title="Edit card title">
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute', top: -4, right: -4,
                          bgcolor: 'primary.main', color: '#fff',
                          '&:hover': { bgcolor: 'primary.dark' },
                          width: 24, height: 24,
                        }}
                        onClick={() => openTextEditor('title', idx)}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Card Text */}
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="body2" color="text.secondary">
                    {renderRichText(card.text)}
                  </Typography>
                  {editMode && (
                    <Tooltip title="Edit card text">
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute', top: -4, right: -4,
                          bgcolor: 'primary.main', color: '#fff',
                          '&:hover': { bgcolor: 'primary.dark' },
                          width: 24, height: 24,
                        }}
                        onClick={() => openTextEditor('text', idx)}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>

          {/* CTA Button */}
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.100', position: 'relative' }}>
            <Button variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
              {renderRichText(splash.ctaText)}
            </Button>
            {editMode && (
              <Tooltip title="Edit button text">
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    ml: 1,
                    bgcolor: 'primary.main', color: '#fff',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 28, height: 28,
                  }}
                  onClick={() => openTextEditor('ctaText')}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Text Editor Dialog */}
      <Dialog open={textEditorOpen} onClose={() => setTextEditorOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Text
          <IconButton onClick={() => setTextEditorOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Formatting toolbar */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Bold (select text first)">
                <IconButton size="small" onClick={() => insertFormatting('b')}>
                  <FormatBoldIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Italic (select text first)">
                <IconButton size="small" onClick={() => insertFormatting('i')}>
                  <FormatItalicIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Underline (select text first)">
                <IconButton size="small" onClick={() => insertFormatting('u')}>
                  <FormatUnderlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem />
              <Tooltip title="Insert hyperlink">
                <IconButton size="small" onClick={() => setLinkDialogOpen(true)}>
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <TextField
              inputRef={textInputRef}
              multiline
              minRows={3}
              maxRows={8}
              fullWidth
              value={textEditorValue}
              onChange={(e) => setTextEditorValue(e.target.value)}
              placeholder="Enter text..."
              helperText="Select text and click B/I/U to format. Use the link button to add hyperlinks."
            />
            {/* Preview */}
            {textEditorValue.includes('<') && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Preview:</Typography>
                <Typography variant="body2">{renderRichText(textEditorValue)}</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTextEditorOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveTextEditor}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Insert Hyperlink</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Link Text"
              fullWidth
              size="small"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Click here"
            />
            <TextField
              label="URL"
              fullWidth
              size="small"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={insertLink} disabled={!linkUrl || !linkText}>Insert</Button>
        </DialogActions>
      </Dialog>

      {/* Icon Picker Dialog */}
      <Dialog open={iconPickerOpen} onClose={() => setIconPickerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Choose Icon or Upload Image
          <IconButton onClick={() => setIconPickerOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Icons</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 3 }}>
            {Object.entries(ICON_MAP).map(([name, IconComp]) => {
              const currentIcon = iconPickerCardIndex !== null
                ? splash.cards[iconPickerCardIndex].icon
                : splash.heroIcon
              return (
                <Tooltip key={name} title={name}>
                  <Paper
                    elevation={currentIcon === name ? 4 : 0}
                    onClick={() => selectIcon(name)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: currentIcon === name ? '2px solid' : '1px solid',
                      borderColor: currentIcon === name ? 'primary.main' : 'grey.200',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <IconComp sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Paper>
                </Tooltip>
              )
            })}
          </Box>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Or Upload an Image</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload an image to use instead of an icon. It will be resized to fit the space while maintaining its aspect ratio.
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Uploading...' : 'Upload Image'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// Resize image utility
function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    img.onload = () => {
      let { width, height } = img
      // Scale down maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/webp',
        0.85
      )
    }
    img.onerror = reject
    reader.readAsDataURL(file)
  })
}
