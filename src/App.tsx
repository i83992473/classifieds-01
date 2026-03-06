import { useState, useRef, useEffect } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { generateClient } from 'aws-amplify/api'
import { uploadData, getUrl, remove } from 'aws-amplify/storage'
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'
import { useTheme } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import SaveIcon from '@mui/icons-material/Save'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ContactsIcon from '@mui/icons-material/Contacts'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import MailIcon from '@mui/icons-material/Mail'
import NewspaperIcon from '@mui/icons-material/Newspaper'
import CreateIcon from '@mui/icons-material/Create'
import DescriptionIcon from '@mui/icons-material/Description'
import ImageIcon from '@mui/icons-material/Image'
import GetStartedIcon from '@mui/icons-material/ArrowForward'
import DownloadIcon from '@mui/icons-material/Download'
import Badge from '@mui/material/Badge'
import Chip from '@mui/material/Chip'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import AdminDashboard from './AdminDashboard'
import MessagesDialog from './MessagesDialog'
import PaymentDialog from './PaymentDialog'
import './App.css'

// Import GraphQL operations
import { createAd, updateAd, deleteAd, updateUser, createMessage } from './graphql/mutations'
import { listAds, getAd, listUsers, listProducts, getUser, listPlacements, listProductPlacements, listSections, listSubSections, listProductSections, listSectionSubSections } from './graphql/queries'

const getUserRecordQuery = /* GraphQL */ `
  query GetUserRecord($id: ID!) {
    getUser(id: $id) {
      id
      email
      isAdmin
      isBlocked
    }
  }
`

const createUserRecordMutation = /* GraphQL */ `
  mutation CreateUserRecord($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      isAdmin
      isBlocked
      createdAt
      updatedAt
    }
  }
`

const listActiveDiscountsQuery = /* GraphQL */ `
  query ListActiveDiscounts {
    listDiscounts(filter: { isActive: { eq: true } }) {
      items {
        id
        name
        description
        code
        discountType
        value
        isActive
        startDate
        endDate
        conditions
      }
    }
  }
`

// Text formatting options
type TextAlignment = 'left' | 'center' | 'right';
type TextSize = 'small' | 'medium' | 'large';
type TextFont = 'serif' | 'sans-serif';
type TextHighlight = 'none' | 'black' | 'gray';

// Ad border options
type BorderStyle = 'none' | 'thin' | 'thick' | 'dashed';
type CornerStyle = 'flat' | 'rounded';
type AdPadding = 'none' | 'medium' | 'large';

// Size to pixels mapping
const TEXT_SIZE_MAP: Record<TextSize, number> = {
  small: 12,
  medium: 16,
  large: 24,
};

// Font family mapping
const FONT_MAP: Record<TextFont, string> = {
  'serif': '"Times New Roman", Georgia, serif',
  'sans-serif': 'Arial, Helvetica, sans-serif',
};

// Text highlight mapping
const HIGHLIGHT_STYLE_MAP: Record<TextHighlight, { backgroundColor: string; color: string }> = {
  'none': { backgroundColor: 'transparent', color: '#1a1a1a' },
  'black': { backgroundColor: '#000000', color: '#ffffff' },
  'gray': { backgroundColor: '#e0e0e0', color: '#1a1a1a' },
};

// Border style mapping
const BORDER_STYLE_MAP: Record<BorderStyle, string> = {
  'none': 'none',
  'thin': '1px solid #000',
  'thick': '3px solid #000',
  'dashed': '2px dashed #000',
};

// Corner radius mapping
const CORNER_STYLE_MAP: Record<CornerStyle, number> = {
  'flat': 0,
  'rounded': 8,
};

// Padding mapping (in pixels)
const PADDING_MAP: Record<AdPadding, number> = {
  'none': 0,
  'medium': 2,
  'large': 5,
};

// Types for content blocks
interface TextBlock {
  id: string;
  type: 'text';
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: TextAlignment;
  size: TextSize;
  font: TextFont;
  highlight: TextHighlight;
}
interface ImageBlock {
  id: string;
  type: 'image';
  src: string;       // Display URL (signed URL from S3)
  s3Key?: string;    // S3 key for storage reference
}
type Block = TextBlock | ImageBlock;

// Ad type from database
interface Ad {
  id: string;
  title: string;
  content?: string;
  blocks?: string; // JSON string
  widthInches?: number;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'NOT_APPROVED' | 'ARCHIVED' | 'PUBLISHED';
  approved?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  productName?: string;
  totalPrice?: number;
  imageKeys?: string[];
  pdfKey?: string;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
  placementIds?: string[];
  sectionIds?: string[];
  subSectionIds?: string[];
  appliedDiscounts?: string; // JSON snapshot
}

interface Placement {
  id: string;
  name: string;
  description?: string;
  defaultAddonFee: number;
  isArchived: boolean;
}

// Resolved placement — merged Placement + ProductPlacement, effective fee computed
interface ResolvedPlacement {
  id: string;        // Placement.id — stored in Ad.placementIds
  name: string;
  description?: string;
  effectiveFee: number; // addonFeeOverride ?? defaultAddonFee
}

// Resolved section — merged Section + ProductSection, effective fee computed
interface ResolvedSection {
  id: string;           // Section.id — stored in Ad.sectionIds
  productSectionId: string;
  name: string;
  effectiveFee: number; // addonFeeOverride ?? defaultAddonFee
  sortOrder: number;
}

// Resolved sub-section — merged SubSection + SectionSubSection, effective fee computed
interface ResolvedSubSection {
  id: string;           // SubSection.id — stored in Ad.subSectionIds
  sectionSubSectionId: string;
  sectionId: string;
  name: string;
  effectiveFee: number;
  sortOrder: number;
}

interface Discount {
  id: string
  name: string
  description?: string
  code?: string
  discountType: 'FLAT' | 'PERCENTAGE'
  value: number
  isActive: boolean
  startDate?: string
  endDate?: string
  conditions?: string // JSON: { productIds, placementIds, sectionIds, minPlacements }
}

interface AppliedDiscount extends Discount {
  isAutomatic: boolean
}

const SIDEBAR_WIDTH = 320;
const APPBAR_HEIGHT = 64;

// Custom circular plus icon component
const CircularPlusIcon = ({ color = 'primary' }: { color?: 'primary' | 'inherit' }) => {
  const theme = useTheme()
  const circleColor = color === 'primary' ? theme.palette.primary.main : 'currentColor'
  const plusColor = color === 'primary' ? theme.palette.primary.contrastText : '#ffffff'
  
  return (
    <Box
      component="svg"
      sx={{
        width: 20,
        height: 20,
        display: 'inline-block',
      }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" fill={circleColor} />
      <path
        d="M12 8v8M8 12h8"
        stroke={plusColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Box>
  )
}

function App() {
  // Create GraphQL client inside component to ensure Amplify is configured
  const client = generateClient();
  const { user, signOut, authStatus } = useAuthenticator()
  const [adWidthInches, setAdWidthInches] = useState(3)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH)
  const [sidebarTab, setSidebarTab] = useState(0) // 0 = My Ad, 1 = Content, 2 = Pricing
  const [isResizing, setIsResizing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [placements, setPlacements] = useState<ResolvedPlacement[]>([])
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])
  const [sections, setSections] = useState<ResolvedSection[]>([])
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [subSections, setSubSections] = useState<ResolvedSubSection[]>([])
  const [selectedSubSections, setSelectedSubSections] = useState<string[]>([])

  // Discount state
  const [allDiscounts, setAllDiscounts] = useState<Discount[]>([])
  const [appliedDiscounts, setAppliedDiscounts] = useState<AppliedDiscount[]>([])
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')

  // Admin and messaging state
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [showMessagesDialog, setShowMessagesDialog] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [showLandingPage, setShowLandingPage] = useState(true)
  
  // Products loaded from database
  const [products, setProducts] = useState<Array<{ id: string; name: string; widthInches: number; basePrice: number; isArchived?: boolean }>>([])
  
  const PRICING_DATA = {
    pricePerWord: 0.50,
    pricePerLine: 2.00,
    pricePerImage: 15.00,
    pricePerDecoration: 3.00, // per text block with bold/italic/underline
    pricePerHighlight: 5.00, // per text block with highlight
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const adPreviewRef = useRef<HTMLDivElement>(null)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const textBlockInputRef = useRef<HTMLTextAreaElement>(null)
  
  // Ad border/style settings (defaults: none, flat, medium)
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('none')
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>('flat')
  const [adPadding, setAdPadding] = useState<AdPadding>('medium')
  
  // Current ad state
  const [currentAdId, setCurrentAdId] = useState<string | null>(null)
  const [adTitle, setAdTitle] = useState(() => {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Daily Tribune-${dateStr}`
  })
  const [adApproved, setAdApproved] = useState(false)
  const [adStatus, setAdStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'NOT_APPROVED' | 'ARCHIVED' | 'PUBLISHED'>('DRAFT')
  // True when the ad cannot be edited or deleted by the user
  const isAdLocked = adStatus === 'APPROVED' || adStatus === 'PENDING_APPROVAL' || adStatus === 'PUBLISHED' || adStatus === 'ARCHIVED'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Date fields
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    date.setHours(0, 0, 0, 0)
    return date.toISOString().split('T')[0]
  })
  
  // Helper to get today's date string
  const getTodayDateString = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().split('T')[0]
  }
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Saved ads list
  const [savedAds, setSavedAds] = useState<Ad[]>([])
  
  // Menu states
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [adsDialogOpen, setAdsDialogOpen] = useState(false)
  const [selectedAdIds, setSelectedAdIds] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)
  
  // Snackbar for notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  })
  
  // Contact info dialog
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [savedCard, setSavedCard] = useState<{
    last4: string
    brand: string
    expMonth: string
    expYear: string
  } | undefined>(undefined)

  // Load saved ads list when user is fully authenticated and route appropriately
  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      initializeUserSession()
    }
  }, [authStatus, user])
  
  // Initialize user session and route based on role/ads
  const initializeUserSession = async () => {
    if (!user?.userId) return
    
    const email = user?.signInDetails?.loginId
    const userId = user.userId
    
    // Ensure User record exists in database
    await ensureUserRecord(userId, email || '')

    // Load saved card after user record is ensured
    await loadSavedCard()

    // Load active discounts for use in ad creation
    await loadDiscounts()
    
    // Check admin status: must be in both Cognito Admin group AND have isAdmin=true in database
    // Try multiple ways to get Cognito groups from the token
    let cognitoGroups: string[] = []
    try {
      // Method 1: From fetchAuthSession (most reliable)
      const { fetchAuthSession } = await import('aws-amplify/auth')
      const session = await fetchAuthSession()
      const idTokenPayload = session.tokens?.idToken?.payload
      if (idTokenPayload) {
        const groups = idTokenPayload['cognito:groups']
        cognitoGroups = Array.isArray(groups) ? (groups as string[]) : []
      }
      
      // Method 2: From user object idToken payload
      if (cognitoGroups.length === 0) {
        const userTokenPayload = (user as any)?.signInUserSession?.idToken?.payload
        if (userTokenPayload) {
          cognitoGroups = userTokenPayload['cognito:groups'] || []
        }
      }
      
      // Method 3: From accessToken payload
      if (cognitoGroups.length === 0) {
        const accessTokenPayload = (user as any)?.signInUserSession?.accessToken?.payload
        if (accessTokenPayload) {
          cognitoGroups = accessTokenPayload['cognito:groups'] || []
        }
      }
    } catch (error) {
      console.error('Error getting Cognito groups:', error)
    }
    
    // Check for admin group (case-insensitive to handle 'Admin' or 'admin')
    const isInAdminGroup = cognitoGroups.some(group => 
      group.toLowerCase() === 'admin'
    )
    
    console.log('Cognito groups found:', cognitoGroups)
    console.log('Is in admin group:', isInAdminGroup)
    
    // Get user's isAdmin status from database
    let dbIsAdmin = false
    try {
      const getUserQuery = /* GraphQL */ `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            id
            isAdmin
          }
        }
      `
      const result = await client.graphql({
        query: getUserQuery,
        variables: { id: userId },
        authMode: 'userPool'
      }) as { data: { getUser: { id: string; isAdmin: boolean | null } | null } }
      
      if (result.data?.getUser) {
        dbIsAdmin = result.data.getUser.isAdmin === true
      }
    } catch (error) {
      console.error('Error checking user admin status:', error)
    }
    
    console.log('Database isAdmin status:', dbIsAdmin)
    
    // Sync database to match Cognito group membership (Cognito is source of truth)
    // If user is in Cognito Admin group, ensure DB has isAdmin=true
    // If user is NOT in Cognito Admin group, ensure DB has isAdmin=false
    if (isInAdminGroup !== dbIsAdmin) {
      console.log(`Admin status mismatch detected. Cognito: ${isInAdminGroup}, DB: ${dbIsAdmin}. Syncing DB to match Cognito...`)
      try {
        const updateResult = await client.graphql({
          query: updateUser,
          variables: {
            input: {
              id: userId,
              isAdmin: isInAdminGroup // Sync DB to match Cognito (Cognito is source of truth)
            }
          },
          authMode: 'userPool'
        })
        console.log('Update result:', updateResult)
        // Update local variable to reflect the sync
        dbIsAdmin = isInAdminGroup
        console.log(`Successfully synced database isAdmin to ${isInAdminGroup} to match Cognito group membership`)
      } catch (error) {
        console.error('Error syncing admin status:', error)
        // If sync fails, still try to use Cognito group status
        // but log the error for debugging
      }
    }
    
    // Final admin status: user is admin if they're in the Cognito Admin group
    // (after sync, dbIsAdmin should match isInAdminGroup)
    const finalAdminStatus = isInAdminGroup
    
    console.log('Final admin status:', finalAdminStatus)
    setIsAdmin(finalAdminStatus)
    
    // Load ads list for later use
    // For admins, filter by owner since Admin group can read all ads.
    // For non-admins, allow.owner() auto-filters to their own ads.
    try {
      const variables: { filter?: { owner: { eq: string } }; limit: number } = { limit: 1000 }
      if (finalAdminStatus) {
        variables.filter = { owner: { eq: userId } }
      }
      const result = await client.graphql({
        query: listAds,
        authMode: 'userPool',
        variables
      }) as { data: { listAds: { items: Ad[] } } }
      const ads = result.data.listAds.items || []
      setSavedAds(ads)
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('NoSignedUser')) {
        console.log('User not fully authenticated yet, will retry...')
        return
      }
      console.error('Error loading ads:', error)
    }
    
    // Load products for ad creation
    await loadProducts()
    
    // Show landing page for all users (including admins)
    setShowLandingPage(true)
  }
  
  // Load products from database (excluding archived products)
  const loadProducts = async () => {
    try {
      const result = await client.graphql({
        query: listProducts,
        authMode: 'userPool'
      }) as { data: { listProducts: { items: Array<{ id: string; name: string; widthInches: number; basePrice: number; isArchived?: boolean }> } } }
      
      const allProducts = result.data.listProducts.items || []
      // Filter out archived products
      const activeProducts = allProducts.filter(p => !p.isArchived)
      setProducts(activeProducts)
      
      // Auto-select first product if creating new ad and no product selected
      if (!currentAdId && !selectedProduct && activeProducts.length > 0) {
        setSelectedProduct(activeProducts[0].id)
        setAdWidthInches(activeProducts[0].widthInches)
      }
      
      return activeProducts
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('NoSignedUser')) {
        console.log('User not fully authenticated yet, will retry loading products...')
        return []
      }
      console.error('Error loading products:', error)
      // Set empty array on error so UI doesn't break
      setProducts([])
      return []
    }
  }

  const loadPlacementsForProduct = async (productId: string) => {
    if (!productId) {
      setPlacements([])
      return
    }
    try {
      const [ppResult, globalResult] = await Promise.all([
        client.graphql({
          query: listProductPlacements,
          variables: { filter: { productId: { eq: productId } } },
          authMode: 'userPool'
        }) as Promise<{ data: { listProductPlacements: { items: Array<{ id: string; productId: string; placementId: string; addonFeeOverride?: number; isArchived: boolean }> } } }>,
        client.graphql({
          query: listPlacements,
          authMode: 'userPool'
        }) as Promise<{ data: { listPlacements: { items: Placement[] } } }>,
      ])
      const productPlacements = (ppResult.data.listProductPlacements.items || []).filter(pp => !pp.isArchived)
      const globalPlacements = globalResult.data.listPlacements.items || []
      const resolved: ResolvedPlacement[] = productPlacements.map(pp => {
        const global = globalPlacements.find(p => p.id === pp.placementId)
        return {
          id: pp.placementId,
          name: global?.name ?? pp.placementId,
          description: global?.description,
          effectiveFee: pp.addonFeeOverride ?? global?.defaultAddonFee ?? 0,
        }
      })
      setPlacements(resolved)
    } catch (error) {
      console.error('Error loading placements:', error)
      setPlacements([])
    }
  }

  const loadSectionsForProduct = async (productId: string) => {
    if (!productId) { setSections([]); return }
    try {
      const [psResult, globalResult] = await Promise.all([
        client.graphql({
          query: listProductSections,
          variables: { filter: { productId: { eq: productId } } },
          authMode: 'userPool'
        }) as Promise<{ data: { listProductSections: { items: Array<{ id: string; sectionId: string; sortOrder: number; addonFeeOverride?: number; isArchived: boolean }> } } }>,
        client.graphql({
          query: listSections,
          authMode: 'userPool'
        }) as Promise<{ data: { listSections: { items: Array<{ id: string; name: string; defaultAddonFee: number; isArchived: boolean }> } } }>,
      ])
      const productSections = (psResult.data.listProductSections.items || []).filter(ps => !ps.isArchived)
      const globalSections = globalResult.data.listSections.items || []
      const resolved: ResolvedSection[] = productSections
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(ps => {
          const global = globalSections.find(s => s.id === ps.sectionId)
          return {
            id: ps.sectionId,
            productSectionId: ps.id,
            name: global?.name ?? ps.sectionId,
            effectiveFee: ps.addonFeeOverride ?? global?.defaultAddonFee ?? 0,
            sortOrder: ps.sortOrder,
          }
        })
      setSections(resolved)
    } catch (error) {
      console.error('Error loading sections:', error)
      setSections([])
    }
  }

  const loadSubSectionsForSections = async (sectionIds: string[]) => {
    if (!sectionIds.length) { setSubSections([]); return }
    try {
      // Fetch SectionSubSections for all selected sections and global SubSections in parallel
      const [ssResults, globalResult] = await Promise.all([
        Promise.all(sectionIds.map(sid =>
          client.graphql({
            query: listSectionSubSections,
            variables: { filter: { sectionId: { eq: sid } } },
            authMode: 'userPool'
          }) as Promise<{ data: { listSectionSubSections: { items: Array<{ id: string; sectionId: string; subSectionId: string; sortOrder: number; addonFeeOverride?: number; isArchived: boolean }> } } }>
        )),
        client.graphql({
          query: listSubSections,
          authMode: 'userPool'
        }) as Promise<{ data: { listSubSections: { items: Array<{ id: string; name: string; defaultAddonFee: number; isArchived: boolean }> } } }>,
      ])
      const allLinks = ssResults.flatMap(r => (r.data.listSectionSubSections.items || []).filter(ss => !ss.isArchived))
      const globalSubSections = globalResult.data.listSubSections.items || []
      const resolved: ResolvedSubSection[] = allLinks
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(ss => {
          const global = globalSubSections.find(s => s.id === ss.subSectionId)
          return {
            id: ss.subSectionId,
            sectionSubSectionId: ss.id,
            sectionId: ss.sectionId,
            name: global?.name ?? ss.subSectionId,
            effectiveFee: ss.addonFeeOverride ?? global?.defaultAddonFee ?? 0,
            sortOrder: ss.sortOrder,
          }
        })
      setSubSections(resolved)
    } catch (error) {
      console.error('Error loading sub-sections:', error)
      setSubSections([])
    }
  }

  // Auto-select first product when creating new ad and products are available
  useEffect(() => {
    if (!currentAdId && products.length > 0 && !selectedProduct) {
      const firstProduct = products[0]
      setSelectedProduct(firstProduct.id)
      setAdWidthInches(firstProduct.widthInches)
      // Update ad title with product name
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      setAdTitle(`${firstProduct.name}-${dateStr}`)
      loadSectionsForProduct(firstProduct.id)
    }
  }, [products.length, currentAdId]) // Only depend on products.length and currentAdId to avoid loops
  
  const loadDiscounts = async () => {
    try {
      const result = await client.graphql({
        query: listActiveDiscountsQuery,
        authMode: 'userPool'
      }) as { data: { listDiscounts: { items: Discount[] } } }
      setAllDiscounts(result.data.listDiscounts.items || [])
    } catch (error) {
      console.error('Error loading discounts:', error)
    }
  }

  // Re-evaluate automatic discounts whenever selections change
  useEffect(() => {
    if (allDiscounts.length === 0) return
    const today = new Date().toISOString().split('T')[0]
    const autoEligible = allDiscounts.filter(d => {
      if (d.code) return false // coupon codes must be entered manually
      if (d.startDate && d.startDate > today) return false
      if (d.endDate && d.endDate < today) return false
      const conds = d.conditions ? JSON.parse(d.conditions) : {}
      const { productIds = [], placementIds = [], sectionIds = [], minPlacements = 0 } = conds
      if (productIds.length > 0 && !productIds.includes(selectedProduct)) return false
      if (placementIds.length > 0 && !selectedPlacements.some((id: string) => placementIds.includes(id))) return false
      if (sectionIds.length > 0 && !selectedSections.some((id: string) => sectionIds.includes(id))) return false
      if (minPlacements > 0 && selectedPlacements.length < minPlacements) return false
      return true
    })
    setAppliedDiscounts(prev => {
      const coupons = prev.filter(d => !d.isAutomatic)
      const newAuto = autoEligible.map(d => ({ ...d, isAutomatic: true }))
      return [...newAuto, ...coupons]
    })
  }, [allDiscounts, selectedProduct, selectedPlacements, selectedSections])

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    const today = new Date().toISOString().split('T')[0]
    const discount = allDiscounts.find(d =>
      d.code?.toUpperCase() === code &&
      d.isActive &&
      (!d.startDate || d.startDate <= today) &&
      (!d.endDate || d.endDate >= today)
    )
    if (!discount) {
      setCouponError('Invalid or expired coupon code')
      return
    }
    if (appliedDiscounts.some(d => d.id === discount.id)) {
      setCouponError('This coupon is already applied')
      return
    }
    setAppliedDiscounts(prev => [...prev, { ...discount, isAutomatic: false }])
    setCouponInput('')
    setCouponError('')
  }

  const removeDiscount = (id: string) => {
    setAppliedDiscounts(prev => prev.filter(d => d.id !== id))
  }

  // Load saved card info
  const loadSavedCard = async () => {
    if (!user?.userId) return
    
    try {
      const result = await client.graphql({
        query: getUser,
        variables: { id: user.userId },
        authMode: 'userPool'
      }) as { data: { getUser: any } }
      
      if (result.data?.getUser?.savedCardLast4) {
        setSavedCard({
          last4: result.data.getUser.savedCardLast4,
          brand: result.data.getUser.savedCardBrand || 'Card',
          expMonth: result.data.getUser.savedCardExpMonth || '',
          expYear: result.data.getUser.savedCardExpYear || '',
        })
      } else {
        setSavedCard(undefined)
      }
    } catch (error: any) {
      // Silently handle errors - card fields might not exist in schema yet
      const errorMessage = error.errors?.[0]?.message || error.message || ''
      if (!errorMessage.includes('savedCardLast4') && !errorMessage.includes('Unknown field')) {
        console.error('Error loading saved card:', error)
      }
      setSavedCard(undefined)
    }
  }

  // Save card to user profile
  const handleSaveCard = async (cardData: {
    number: string
    expMonth: string
    expYear: string
    cvv: string
  }) => {
    if (!user?.userId) return

    try {
      const last4 = cardData.number.slice(-4)
      const brand = getCardBrand(cardData.number)
      
      await client.graphql({
        query: updateUser,
        variables: {
          input: {
            id: user.userId,
            savedCardLast4: last4,
            savedCardBrand: brand,
            savedCardExpMonth: cardData.expMonth,
            savedCardExpYear: cardData.expYear,
            savedCardCvv: cardData.cvv, // In production, this should be encrypted
          }
        },
        authMode: 'userPool'
      })

      setSavedCard({
        last4,
        brand,
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
      })
      
      setSnackbar({ open: true, message: 'Card saved successfully', severity: 'success' })
    } catch (error) {
      console.error('Error saving card:', error)
      setSnackbar({ open: true, message: 'Failed to save card', severity: 'error' })
    }
  }

  // Update saved card
  const handleUpdateCard = async (cardData: {
    number: string
    expMonth: string
    expYear: string
    cvv: string
  }) => {
    await handleSaveCard(cardData)
  }

  // Remove saved card
  const handleRemoveCard = async () => {
    if (!user?.userId) return

    try {
      await client.graphql({
        query: updateUser,
        variables: {
          input: {
            id: user.userId,
            savedCardLast4: null,
            savedCardBrand: null,
            savedCardExpMonth: null,
            savedCardExpYear: null,
            savedCardCvv: null,
          }
        },
        authMode: 'userPool'
      })

      setSavedCard(undefined)
      setSnackbar({ open: true, message: 'Card removed successfully', severity: 'success' })
    } catch (error) {
      console.error('Error removing card:', error)
      setSnackbar({ open: true, message: 'Failed to remove card', severity: 'error' })
    }
  }

  // Helper function to get card brand
  const getCardBrand = (number: string): string => {
    const num = number.replace(/\s/g, '')
    if (/^4/.test(num)) return 'Visa'
    if (/^5[1-5]/.test(num)) return 'Mastercard'
    if (/^3[47]/.test(num)) return 'American Express'
    if (/^6(?:011|5)/.test(num)) return 'Discover'
    return 'Card'
  }

  // Ensure User record exists in database - create if missing
  const ensureUserRecord = async (userId: string, email: string) => {
    try {
      // Try to get existing user
      const result = await client.graphql({
        query: getUserRecordQuery,
        variables: { id: userId },
        authMode: 'userPool'
      }) as { data: { getUser: any } }
      
      // User exists, we're done
      if (result.data?.getUser) {
        console.log('User record already exists:', email)
        // Load saved card
        await loadSavedCard()
        return
      }
      
      // User doesn't exist (getUser returned null), create it
      console.log('User record not found (null response), creating new user:', email)
      await createUserRecord(userId, email)
    } catch (error: any) {
      // User doesn't exist - check various error types
      const errorMessage = error.errors?.[0]?.message || error.message || JSON.stringify(error)
      const shouldCreate = 
        error.errors?.[0]?.errorType === 'NotFoundError' ||
        error.errors?.[0]?.errorType === 'DynamoDB:ConditionalCheckFailedException' ||
        errorMessage?.includes('not found') ||
        errorMessage?.includes('NotFound') ||
        errorMessage?.includes('does not exist')
      
      console.log('User check result:', { userId, email, error: errorMessage, shouldCreate })
      
      if (shouldCreate) {
        await createUserRecord(userId, email)
      } else {
        console.error('Unexpected error checking User record:', {
          email,
          error: errorMessage,
          fullError: error
        })
      }
    }
  }
  
  // Helper function to create user record
  const createUserRecord = async (userId: string, email: string) => {
    try {
      const adminEmails = ['iriley@mirabeltechnologies.com']
      const createResult = await client.graphql({
        query: createUserRecordMutation,
        variables: {
          input: {
            id: userId,
            email: email,
            isAdmin: adminEmails.includes(email),
            isBlocked: false
          }
        },
        authMode: 'userPool'
      })
      
      console.log('✅ Created User record for:', email, createResult)
    } catch (createError: any) {
      const errorMessage = createError.errors?.[0]?.message || createError.message || ''
      // Only log if it's not a schema-related error (fields might not exist yet)
      if (!errorMessage.includes('Unknown field') && !errorMessage.includes('savedCard')) {
        console.error('❌ Error creating User record:', {
          email,
          error: createError.errors || createError.message || createError,
          fullError: createError
        })
      }
      // Don't throw - allow app to continue even if user creation fails
    }
  }
  
  // Sync ad width with selected product - handled in main useEffect above

  // Sidebar resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const minWidth = SIDEBAR_WIDTH
      const maxWidth = window.innerWidth * 0.5
      const newWidth = Math.min(Math.max(minWidth, e.clientX), maxWidth)
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handleResizeStart = () => {
    setIsResizing(true)
  }

  const loadAdsList = async () => {
    if (!user) return
    try {
      const variables: { filter?: { owner: { eq: string } }; limit: number } = { limit: 1000 }
      if (isAdmin) {
        variables.filter = { owner: { eq: user.userId } }
      }
      const result = await client.graphql({
        query: listAds,
        authMode: 'userPool',
        variables
      }) as { data: { listAds: { items: Ad[] } } }
      setSavedAds(result.data.listAds.items || [])
    } catch (error: unknown) {
      // Ignore auth errors during initial load - user may not be fully authenticated yet
      if (error instanceof Error && error.message?.includes('NoSignedUser')) {
        console.log('User not fully authenticated yet, will retry...')
        return
      }
      console.error('Error loading ads:', error)
    }
  }

  // Upload image to S3 (using public/ prefix for Amplify Storage)
  const uploadImageToS3 = async (file: File): Promise<{ key: string; url: string }> => {
    const key = `public/images/${Date.now()}-${file.name}`
    await uploadData({
      path: key,
      data: file,
      options: {
        contentType: file.type
      }
    }).result
    
    const urlResult = await getUrl({ path: key })
    return { key, url: urlResult.url.toString() }
  }

  // Get signed URL for S3 image
  const getImageUrl = async (key: string): Promise<string> => {
    const result = await getUrl({ path: key })
    return result.url.toString()
  }

  // Helper to mark ad as edited (change NOT_APPROVED to DRAFT and set unsaved changes)
  const markAsEdited = () => {
    if (isAdLocked) return
    if (adStatus === 'NOT_APPROVED') {
      setAdStatus('DRAFT')
    }
    setHasUnsavedChanges(true)
  }

  // Add a new text block
  const addTextBlock = () => {
    const newBlock: TextBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      text: 'New classified text',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 16,
      alignment: 'left',
      size: 'medium',
      font: 'serif',
      highlight: 'none',
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    markAsEdited();
    
    // Focus the text input after the component re-renders
    setTimeout(() => {
      if (textBlockInputRef.current) {
        textBlockInputRef.current.focus();
        textBlockInputRef.current.select();
      }
    }, 0);
  };

  // Handle image file selection - now uploads to S3
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsSaving(true)
        const { key, url } = await uploadImageToS3(file)
        
    const newBlock: ImageBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
          src: url,
          s3Key: key,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    markAsEdited();
        setSnackbar({ open: true, message: 'Image uploaded successfully', severity: 'success' })
      } catch (error) {
        console.error('Error uploading image:', error)
        setSnackbar({ open: true, message: 'Failed to upload image', severity: 'error' })
      } finally {
        setIsSaving(false)
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const addImageBlock = () => {
    if (isAdLocked) {
      setSnackbar({ open: true, message: 'Cannot edit this ad in its current status.', severity: 'error' })
      return
    }
    fileInputRef.current?.click();
  };

  // Update a text block's properties
  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    if (isAdLocked) {
      setSnackbar({ open: true, message: 'Cannot edit this ad in its current status.', severity: 'error' })
      return
    }
    setBlocks(blocks.map(block =>
      block.id === id && block.type === 'text'
        ? { ...block, ...updates }
        : block
    ));
    markAsEdited();
  };

  // Delete a block
  const deleteBlock = async (id: string) => {
    if (isAdLocked) {
      setSnackbar({ open: true, message: 'Cannot edit this ad in its current status.', severity: 'error' })
      return
    }
    const block = blocks.find(b => b.id === id)
    
    // If it's an image with S3 key, delete from S3
    if (block?.type === 'image' && block.s3Key) {
      try {
        await remove({ path: block.s3Key })
      } catch (error) {
        console.error('Error deleting image from S3:', error)
      }
    }
    
    setBlocks(blocks.filter(block => block.id !== id));
    markAsEdited();
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  // Move block up
  const moveBlockUp = (id: string) => {
    if (isAdLocked) return
    const index = blocks.findIndex(b => b.id === id);
    if (index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      setBlocks(newBlocks);
      markAsEdited();
    }
  };

  // Move block down
  const moveBlockDown = (id: string) => {
    if (isAdLocked) return
    const index = blocks.findIndex(b => b.id === id);
    if (index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
      markAsEdited();
    }
  };

  // Save ad to database
  const saveAd = async () => {
    setIsSaving(true)
    try {
      // Prepare blocks for storage (store S3 keys, not URLs)
      const blocksForStorage = blocks.map(block => {
        if (block.type === 'image') {
          return { ...block, src: '' } // Don't store signed URLs
        }
        return block
      })
      
      const imageKeys = blocks
        .filter((b): b is ImageBlock => b.type === 'image' && !!b.s3Key)
        .map(b => b.s3Key!)
      
      // Store ad settings (border, corners, padding) in content field as JSON
      const adSettings = JSON.stringify({
        borderStyle,
        cornerStyle,
        adPadding,
      })
      
      // If status is NOT_APPROVED, change to DRAFT when saving
      const statusToSave = adStatus === 'NOT_APPROVED' ? 'DRAFT' : adStatus
      
      // Get product name and calculate total price
      const selectedProductData = products.find(p => p.id === selectedProduct)
      const productName = selectedProductData?.name || null
      const pricing = calculatePricing()
      const totalPrice = pricing.finalTotal

      // Snapshot applied discounts at save time
      const discountSnapshot = pricing.discountDetails.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code || null,
        discountType: d.discountType,
        value: d.value,
        computedAmount: d.computedAmount,
      }))

      const input = {
        title: adTitle,
        content: adSettings,
        blocks: JSON.stringify(blocksForStorage),
        widthInches: adWidthInches,
        status: statusToSave || 'DRAFT', // Always ensure status is set
        imageKeys,
        productName,
        totalPrice,
        placementIds: selectedPlacements.length > 0 ? selectedPlacements : undefined,
        sectionIds: selectedSections.length > 0 ? selectedSections : undefined,
        subSectionIds: selectedSubSections.length > 0 ? selectedSubSections : undefined,
        appliedDiscounts: discountSnapshot.length > 0 ? JSON.stringify(discountSnapshot) : undefined,
      }
      
      if (currentAdId) {
        // Update existing ad - cannot edit if locked
        if (isAdLocked) {
          setSnackbar({ open: true, message: 'Cannot edit this ad in its current status.', severity: 'error' })
          setIsSaving(false)
          return
        }
        await client.graphql({
          query: updateAd,
          variables: { input: { id: currentAdId, ...input } },
          authMode: 'userPool'
        })
        // Update local status if it was NOT_APPROVED
        if (adStatus === 'NOT_APPROVED') {
          setAdStatus('DRAFT')
        }
        setSnackbar({ open: true, message: 'Ad saved successfully', severity: 'success' })
        setHasUnsavedChanges(false) // Reset after save
      } else {
        // Create new ad
        const result = await client.graphql({
          query: createAd,
          variables: { input },
          authMode: 'userPool'
        }) as { data: { createAd: Ad } }
        setCurrentAdId(result.data.createAd.id)
        setSnackbar({ open: true, message: 'Ad created successfully', severity: 'success' })
        setHasUnsavedChanges(false) // Reset after save
      }
      
      await loadAdsList()
    } catch (error) {
      console.error('Error saving ad:', error)
      setSnackbar({ open: true, message: 'Failed to save ad', severity: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  // Submit ad for approval (now requires payment first)
  const submitForApproval = async () => {
    if (!currentAdId) {
      setSnackbar({ open: true, message: 'Please save the ad first', severity: 'error' })
      return
    }

    // Calculate total price
    const pricing = calculatePricing()
    const totalPrice = pricing.finalTotal
    if (totalPrice <= 0) {
      setSnackbar({ open: true, message: 'Please add content to your ad', severity: 'error' })
      return
    }

    // Show payment dialog first
    setPaymentDialogOpen(true)
  }

  // Handle payment success - proceed with submission
  const handlePaymentSuccess = async (_paymentMethod: 'new' | 'saved') => {
    setPaymentDialogOpen(false)
    
    if (!currentAdId) {
      setSnackbar({ open: true, message: 'Please save the ad first', severity: 'error' })
      return
    }

    setIsSaving(true)
    try {
      // First, create PDF
      if (!adPreviewRef.current) {
        setSnackbar({ open: true, message: 'Unable to create PDF', severity: 'error' })
        setIsSaving(false)
        return
      }

      // Create PDF (reuse exportToPDF logic)
      const imageBlocks = blocks.filter((b): b is ImageBlock => b.type === 'image')
      const imageBase64Map = new Map<string, string>()
      
      for (const block of imageBlocks) {
        try {
          const base64 = await imageToBase64(block.src)
          imageBase64Map.set(block.id, base64)
        } catch (error) {
          console.error('Failed to convert image to base64:', block.id, error)
        }
      }

      const imageElements = Array.from(adPreviewRef.current.querySelectorAll('img'))
      const blockIdToImgMap = new Map<string, HTMLImageElement>()
      
      imageBlocks.forEach((block) => {
        const img = imageElements.find((imgEl) => {
          let parent = imgEl.parentElement
          while (parent && parent !== adPreviewRef.current) {
            if (parent.getAttribute('data-block-id') === block.id) {
              return true
            }
            parent = parent.parentElement
          }
          return false
        })
        if (img) {
          blockIdToImgMap.set(block.id, img)
        }
      })

      // Store original sources and replace with base64
      const originalSrcs = new Map<HTMLImageElement, string>()
      const imageLoadPromises: Promise<void>[] = []

      blockIdToImgMap.forEach((img, blockId) => {
        const base64 = imageBase64Map.get(blockId)
        if (base64) {
          originalSrcs.set(img, img.src)
          const loadPromise = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject(new Error(`Failed to load image for block ${blockId}`))
            img.src = base64
          })
          imageLoadPromises.push(loadPromise)
        }
      })

      // Wait for all images to load
      try {
        await Promise.all(imageLoadPromises)
        // Additional small delay to ensure rendering
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error('Error loading images:', error)
        // Continue anyway - some images might still render
      }

      const canvas = await html2canvas(adPreviewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
      })

      // Restore original image sources
      blockIdToImgMap.forEach((img) => {
        const originalSrc = originalSrcs.get(img)
        if (originalSrc) {
          img.src = originalSrc
        }
      })

      // Calculate PDF dimensions based on actual ad size
      const pdfWidthInches = adWidthInches
      const canvasScale = 2
      
      // The canvas was captured at 2x scale, so actual pixels = canvas dimensions / 2
      const actualCanvasWidthPx = canvas.width / canvasScale
      const actualCanvasHeightPx = canvas.height / canvasScale
      
      // Calculate height maintaining aspect ratio
      const aspectRatio = actualCanvasHeightPx / actualCanvasWidthPx
      const pdfHeightInches = pdfWidthInches * aspectRatio

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: pdfHeightInches > pdfWidthInches ? 'portrait' : 'landscape',
        unit: 'in',
        format: [pdfWidthInches, pdfHeightInches],
        compress: true,
      })

      // Add the canvas image at exact size (in inches)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthInches, pdfHeightInches, undefined, 'FAST')

      const pdfBlob = pdf.output('blob')
      const pdfFile = new File([pdfBlob], `${adTitle || 'ad'}-${Date.now()}.pdf`, { type: 'application/pdf' })
      const sanitizedTitle = (adTitle || 'ad').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const pdfKey = `public/pdfs/${Date.now()}-${sanitizedTitle}.pdf`
      
      await uploadData({
        path: pdfKey,
        data: pdfFile,
        options: {
          contentType: 'application/pdf'
        }
      }).result

      // Update ad with PENDING_APPROVAL status and PDF key
      await client.graphql({
        query: updateAd,
        variables: {
          input: {
            id: currentAdId,
            status: 'PENDING_APPROVAL',
            pdfKey,
          }
        },
        authMode: 'userPool'
      })

      setAdStatus('PENDING_APPROVAL')
      setHasUnsavedChanges(false) // Reset after submission

      // Get all admin users and send them messages
      try {
        const usersResult = await client.graphql({
          query: listUsers,
          authMode: 'userPool'
        }) as { data: { listUsers: { items: Array<{ id: string; email: string; isAdmin: boolean }> } } }

        const adminUsers = usersResult.data.listUsers.items.filter(u => u.isAdmin)
        const userEmail = user?.signInDetails?.loginId || 'User'

        for (const admin of adminUsers) {
          await client.graphql({
            query: createMessage,
            variables: {
              input: {
                senderId: user?.userId || '',
                senderEmail: userEmail,
                recipientId: admin.id,
                recipientEmail: admin.email,
                subject: `Ad "${adTitle}" submitted for approval`,
                body: `Ad "${adTitle}" has been submitted for approval.\n\nAd ID: ${currentAdId}`,
                read: false,
                owners: [user?.userId || '', admin.id].filter(Boolean),
              }
            },
            authMode: 'userPool'
          })
        }
      } catch (error) {
        console.error('Error sending messages to admins:', error)
        // Don't fail the whole operation if messaging fails
      }

      setSnackbar({ open: true, message: 'Ad submitted for approval', severity: 'success' })
    } catch (error) {
      console.error('Error submitting for approval:', error)
      setSnackbar({ open: true, message: 'Failed to submit for approval', severity: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel submission - change status back to DRAFT
  const cancelSubmission = async () => {
    if (!currentAdId) return

    setIsSaving(true)
    try {
      await client.graphql({
        query: updateAd,
        variables: {
          input: {
            id: currentAdId,
            status: 'DRAFT',
          }
        },
        authMode: 'userPool'
      })

      setAdStatus('DRAFT')
      setHasUnsavedChanges(false) // Reset - they need to make changes and save before submitting again
      setSnackbar({ open: true, message: 'Submission cancelled. Make changes and save to submit again.', severity: 'success' })
    } catch (error) {
      console.error('Error cancelling submission:', error)
      setSnackbar({ open: true, message: 'Failed to cancel submission', severity: 'error' })
    } finally {
      setIsSaving(false)
    }
  }


  // Load ad from database
  const loadAd = async (adId: string) => {
    setIsLoading(true)
    try {
      const result = await client.graphql({
        query: getAd,
        variables: { id: adId },
        authMode: 'userPool'
      }) as { data: { getAd: Ad } }
      
      const ad = result.data.getAd
      if (ad) {
        setCurrentAdId(ad.id)
        setAdTitle(ad.title)
        setAdWidthInches(ad.widthInches || 3)
        
        // Restore ad settings (border, corners, padding) from content field
        if (ad.content) {
          try {
            const settings = JSON.parse(ad.content) as {
              borderStyle?: BorderStyle;
              cornerStyle?: CornerStyle;
              adPadding?: AdPadding;
            }
            setBorderStyle(settings.borderStyle || 'none')
            setCornerStyle(settings.cornerStyle || 'flat')
            setAdPadding(settings.adPadding || 'medium')
          } catch {
            // If content isn't valid JSON, use defaults
            setBorderStyle('none')
            setCornerStyle('flat')
            setAdPadding('medium')
          }
        } else {
          // Use defaults
          setBorderStyle('none')
          setCornerStyle('flat')
          setAdPadding('medium')
        }
        
        // Parse and restore blocks
        if (ad.blocks) {
          const parsedBlocks = JSON.parse(ad.blocks) as Block[]
          
          // Restore signed URLs for images and ensure text blocks have all required fields
          const restoredBlocks = await Promise.all(
            parsedBlocks.map(async (block) => {
              if (block.type === 'image' && block.s3Key) {
                const url = await getImageUrl(block.s3Key)
                return { ...block, src: url }
              }
              if (block.type === 'text') {
                // Ensure all text block fields are present with defaults
                return {
                  ...block,
                  highlight: block.highlight || 'none',
                  alignment: block.alignment || 'left',
                  size: block.size || 'medium',
                  font: block.font || 'serif',
                } as TextBlock
              }
              return block
            })
          )
          
          setBlocks(restoredBlocks)
        } else {
          setBlocks([])
        }
        
        // Restore product selection from saved productName
        if (ad.productName) {
          const matchingProduct = products.find(p => p.name === ad.productName)
          if (matchingProduct) {
            setSelectedProduct(matchingProduct.id)
            await loadPlacementsForProduct(matchingProduct.id)
            await loadSectionsForProduct(matchingProduct.id)
          }
        }

        // Restore placement selections
        setSelectedPlacements(ad.placementIds || [])
        // Restore section and sub-section selections
        const restoredSectionIds = ad.sectionIds || []
        setSelectedSections(restoredSectionIds)
        setSelectedSubSections(ad.subSectionIds || [])
        if (restoredSectionIds.length > 0) {
          await loadSubSectionsForSections(restoredSectionIds)
        }
        
        // Restore approval status
        setAdApproved(ad.approved || false)
        setAdStatus((ad.status as 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'NOT_APPROVED' | 'ARCHIVED' | 'PUBLISHED') || 'DRAFT')
        setHasUnsavedChanges(false) // Reset when loading ad
        
        setSelectedBlockId(null)
        setSnackbar({ open: true, message: 'Ad loaded successfully', severity: 'success' })
      }
    } catch (error) {
      console.error('Error loading ad:', error)
      setSnackbar({ open: true, message: 'Failed to load ad', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  // Create new ad
  const newAd = async () => {
    // Reload products to ensure we have the latest list
    const loadedProducts = await loadProducts()
    
    setCurrentAdId(null)
    
    // Always select the first product by default for new ads
    const currentProducts = loadedProducts.length > 0 ? loadedProducts : products
    const firstProduct = currentProducts.length > 0 ? currentProducts[0] : null
    if (firstProduct) {
      setSelectedProduct(firstProduct.id)
      setAdWidthInches(firstProduct.widthInches)
    } else {
      setSelectedProduct('')
    }
    
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const product = firstProduct || currentProducts.find(p => p.id === selectedProduct)
    setAdTitle(`${product?.name || 'Product'}-${dateStr}`)
    setBlocks([])
    // Don't reset width here - it's already set from the product above
    // Only set to 3 if no product was found
    if (!firstProduct) {
      setAdWidthInches(3)
    }
    setSelectedBlockId(null)
    // Reset border settings to defaults
    setBorderStyle('none')
    setCornerStyle('flat')
    setAdPadding('medium')
    // Reset dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setStartDate(today.toISOString().split('T')[0])
    const endDate = new Date(today)
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setHours(0, 0, 0, 0)
    setEndDate(endDate.toISOString().split('T')[0])
    // Reset approval status
    setAdApproved(false)
    setAdStatus('DRAFT')
    // Reset placements and sections
    setSelectedPlacements([])
    setSelectedSections([])
    setSelectedSubSections([])
    setSubSections([])
    if (firstProduct) {
      loadPlacementsForProduct(firstProduct.id)
      loadSectionsForProduct(firstProduct.id)
    } else {
      setPlacements([])
      setSections([])
    }
  }

  // Helper function to convert image URL to base64 data URL with better error handling
  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      // If already a data URL, return as-is
      if (url.startsWith('data:')) {
        return url
      }
      
      const response = await fetch(url, { 
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            resolve(reader.result)
          } else {
            reject(new Error('Failed to convert image to base64'))
          }
        }
        reader.onerror = () => reject(new Error('FileReader error'))
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Failed to convert image to base64:', error, url)
      throw error
    }
  }

  // Render an ad off-screen from its saved data and return a PDF blob
  const renderAdToPDFBlob = async (ad: Ad): Promise<Blob> => {
    // Parse blocks
    const parsedBlocks: Block[] = ad.blocks ? JSON.parse(ad.blocks) : []

    // Parse ad settings from content field
    let adBorderStyle: BorderStyle = 'none'
    let adCornerStyle: CornerStyle = 'flat'
    let adPaddingStyle: AdPadding = 'medium'
    if (ad.content) {
      try {
        const settings = JSON.parse(ad.content) as {
          borderStyle?: BorderStyle;
          cornerStyle?: CornerStyle;
          adPadding?: AdPadding;
        }
        adBorderStyle = settings.borderStyle || 'none'
        adCornerStyle = settings.cornerStyle || 'flat'
        adPaddingStyle = settings.adPadding || 'medium'
      } catch { /* use defaults */ }
    }

    const widthInches = ad.widthInches || 3
    const widthPx = widthInches * 96

    // Resolve image URLs from S3 keys
    const resolvedBlocks = await Promise.all(
      parsedBlocks.map(async (block) => {
        if (block.type === 'image' && block.s3Key) {
          const url = await getImageUrl(block.s3Key)
          return { ...block, src: url }
        }
        return block
      })
    )

    // Convert images to base64 for reliable canvas capture
    const imageBase64Map = new Map<string, string>()
    for (const block of resolvedBlocks) {
      if (block.type === 'image' && block.src) {
        try {
          const base64 = await imageToBase64(block.src)
          imageBase64Map.set(block.id, base64)
        } catch { /* continue without this image */ }
      }
    }

    // Create off-screen container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    document.body.appendChild(container)

    // Create the ad preview element
    const adEl = document.createElement('div')
    adEl.style.width = `${widthPx}px`
    adEl.style.backgroundColor = '#ffffff'
    adEl.style.border = BORDER_STYLE_MAP[adBorderStyle]
    adEl.style.borderRadius = `${CORNER_STYLE_MAP[adCornerStyle]}px`
    adEl.style.padding = `${PADDING_MAP[adPaddingStyle]}px`
    adEl.style.boxSizing = 'border-box'
    container.appendChild(adEl)

    // Render each block
    for (const block of resolvedBlocks) {
      if (block.type === 'text') {
        const textEl = document.createElement('div')
        textEl.textContent = block.text
        textEl.style.fontWeight = block.bold ? 'bold' : 'normal'
        textEl.style.fontStyle = block.italic ? 'italic' : 'normal'
        textEl.style.textDecoration = block.underline ? 'underline' : 'none'
        textEl.style.fontSize = `${block.fontSize || TEXT_SIZE_MAP[block.size || 'medium']}px`
        textEl.style.fontFamily = FONT_MAP[block.font || 'serif']
        textEl.style.textAlign = block.alignment || 'left'
        textEl.style.color = HIGHLIGHT_STYLE_MAP[block.highlight || 'none'].color
        textEl.style.backgroundColor = HIGHLIGHT_STYLE_MAP[block.highlight || 'none'].backgroundColor
        textEl.style.lineHeight = '1.4'
        textEl.style.width = '100%'
        if (block.highlight && block.highlight !== 'none') {
          textEl.style.paddingLeft = '4px'
          textEl.style.paddingRight = '4px'
          textEl.style.paddingTop = '2px'
          textEl.style.paddingBottom = '2px'
        }
        adEl.appendChild(textEl)
      } else if (block.type === 'image') {
        const wrapper = document.createElement('div')
        wrapper.style.display = 'flex'
        wrapper.style.justifyContent = 'center'
        wrapper.style.width = '100%'
        const img = document.createElement('img')
        img.src = imageBase64Map.get(block.id) || block.src
        img.style.display = 'block'
        img.style.width = '100%'
        img.style.height = 'auto'
        wrapper.appendChild(img)
        adEl.appendChild(wrapper)
      }
    }

    // Wait for all images to load
    const images = Array.from(adEl.querySelectorAll('img'))
    await Promise.all(images.map(img =>
      img.complete ? Promise.resolve() : new Promise<void>(resolve => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
        setTimeout(resolve, 10000)
      })
    ))
    // Small delay for rendering
    await new Promise(resolve => setTimeout(resolve, 300))

    // Capture with html2canvas
    const canvas = await html2canvas(adEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
    })

    // Clean up off-screen container
    document.body.removeChild(container)

    // Calculate PDF dimensions
    const canvasScale = 2
    const actualW = canvas.width / canvasScale
    const actualH = canvas.height / canvasScale
    const aspectRatio = actualH / actualW
    const pdfH = widthInches * aspectRatio

    // Create PDF
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: pdfH > widthInches ? 'portrait' : 'landscape',
      unit: 'in',
      format: [widthInches, pdfH],
      compress: true,
    })
    pdf.addImage(imgData, 'PNG', 0, 0, widthInches, pdfH, undefined, 'FAST')

    return pdf.output('blob')
  }

  // Export a single ad as PDF download
  const exportSingleAd = async (ad: Ad) => {
    setIsExporting(true)
    try {
      const blob = await renderAdToPDFBlob(ad)
      const sanitizedTitle = (ad.title || 'ad').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sanitizedTitle}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSnackbar({ open: true, message: 'PDF downloaded', severity: 'success' })
    } catch (error) {
      console.error('Error exporting ad:', error)
      setSnackbar({ open: true, message: 'Failed to export PDF', severity: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  // Export multiple selected ads as a zip of PDFs
  const exportSelectedAds = async () => {
    if (selectedAdIds.size === 0) return
    setIsExporting(true)
    try {
      const adsToExport = savedAds.filter(ad => selectedAdIds.has(ad.id))

      if (adsToExport.length === 1) {
        // Single ad — just download the PDF directly
        await exportSingleAd(adsToExport[0])
        return
      }

      const zip = new JSZip()
      for (const ad of adsToExport) {
        const blob = await renderAdToPDFBlob(ad)
        const sanitizedTitle = (ad.title || 'ad').replace(/[^a-z0-9]/gi, '-').toLowerCase()
        zip.file(`${sanitizedTitle}.pdf`, blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ads-export-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSnackbar({ open: true, message: `${adsToExport.length} ads exported as zip`, severity: 'success' })
      setSelectedAdIds(new Set())
    } catch (error) {
      console.error('Error exporting ads:', error)
      setSnackbar({ open: true, message: 'Failed to export ads', severity: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  // Delete ad from database - function kept for future use
  // @ts-expect-error - Function is kept for future use
  const deleteCurrentAd = async () => {
    if (!currentAdId) return
    if (isAdLocked) {
      setSnackbar({ open: true, message: 'Cannot delete this ad in its current status.', severity: 'error' })
      return
    }
    
    setIsSaving(true)
    try {
      // Delete images from S3
      for (const block of blocks) {
        if (block.type === 'image' && block.s3Key) {
          await remove({ path: block.s3Key })
        }
      }
      
      await client.graphql({
        query: deleteAd,
        variables: { input: { id: currentAdId } },
        authMode: 'userPool'
      })
      
      newAd()
      await loadAdsList()
      setSnackbar({ open: true, message: 'Ad deleted successfully', severity: 'success' })
    } catch (error) {
      console.error('Error deleting ad:', error)
      setSnackbar({ open: true, message: 'Failed to delete ad', severity: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  // Get selected block (text or image)
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const selectedTextBlock = selectedBlock?.type === 'text' ? selectedBlock as TextBlock : undefined;
  const selectedImageBlock = selectedBlock?.type === 'image' ? selectedBlock as ImageBlock : undefined;

  // Convert inches to pixels (assume 96px/inch for web)
  const adWidthPx = adWidthInches * 96;
  
  // Calculate ad height in pixels (will be determined by content)
  const [adHeightPx, setAdHeightPx] = useState(200)
  
  // Update height when content changes using ResizeObserver
  useEffect(() => {
    if (!adPreviewRef.current) return

    const measureHeight = () => {
      if (adPreviewRef.current) {
        const h = adPreviewRef.current.getBoundingClientRect().height
        setAdHeightPx(Math.max(h, 200))
      }
    }

    // Initial measurement
    measureHeight()

    // Use ResizeObserver — read height directly from entry to avoid stale reads
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.borderBoxSize?.[0]?.blockSize
          ?? entry.contentRect.height
        setAdHeightPx(Math.max(h, 200))
      }
    })

    resizeObserver.observe(adPreviewRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [blocks, adWidthInches, borderStyle, adPadding, selectedTextBlock?.text])
  
  // Calculate ad statistics
  const calculateStats = () => {
    const textBlocks = blocks.filter((b): b is TextBlock => b.type === 'text')
    const imageBlocks = blocks.filter((b): b is ImageBlock => b.type === 'image')
    
    const totalWords = textBlocks.reduce((sum, block) => {
      const words = block.text.trim().split(/\s+/).filter(word => word.length > 0)
      return sum + words.length
    }, 0)
    
    const totalLines = textBlocks.reduce((sum, block) => {
      const lines = block.text.split('\n').filter(line => line.trim().length > 0)
      return sum + Math.max(lines.length, 1)
    }, 0)
    
    const textSections = textBlocks.length
    const textSectionsWithDecorations = textBlocks.filter(block => block.bold || block.italic || block.underline).length
    const textSectionsWithHighlights = textBlocks.filter(block => block.highlight && block.highlight !== 'none').length
    const imageCount = imageBlocks.length
    
    const heightInches = (adHeightPx / 96).toFixed(2)
    const widthInches = adWidthInches.toFixed(2)
    
    return {
      width: widthInches,
      height: heightInches,
      totalWords,
      totalLines,
      textSections,
      textSectionsWithDecorations,
      textSectionsWithHighlights,
      imageCount,
    }
  }
  
  // Calculate pricing
  const calculatePricing = () => {
    const stats = calculateStats()
    const product = products.find(p => p.id === selectedProduct)
    const productPrice = product?.basePrice || 0

    const wordPrice = stats.totalWords * PRICING_DATA.pricePerWord
    const linePrice = stats.totalLines * PRICING_DATA.pricePerLine
    const imagePrice = stats.imageCount * PRICING_DATA.pricePerImage
    const decorationPrice = stats.textSectionsWithDecorations * PRICING_DATA.pricePerDecoration
    const highlightPrice = stats.textSectionsWithHighlights * PRICING_DATA.pricePerHighlight
    const placementFees = placements
      .filter(p => selectedPlacements.includes(p.id))
      .reduce((sum, p) => sum + (p.effectiveFee || 0), 0)
    const sectionFees = sections
      .filter(s => selectedSections.includes(s.id))
      .reduce((sum, s) => sum + (s.effectiveFee || 0), 0)
    const subSectionFees = subSections
      .filter(ss => selectedSubSections.includes(ss.id))
      .reduce((sum, ss) => sum + (ss.effectiveFee || 0), 0)

    const subtotal = wordPrice + linePrice + imagePrice + decorationPrice + highlightPrice + productPrice + placementFees + sectionFees + subSectionFees

    // Calculate each applied discount against the subtotal
    const discountDetails = appliedDiscounts.map(d => ({
      ...d,
      computedAmount: d.discountType === 'FLAT'
        ? Math.min(d.value, subtotal)
        : subtotal * (d.value / 100),
    }))
    const totalDiscountAmount = discountDetails.reduce((sum, d) => sum + d.computedAmount, 0)
    const finalTotal = Math.max(0, subtotal - totalDiscountAmount)

    return {
      productPrice,
      wordPrice,
      linePrice,
      imagePrice,
      decorationPrice,
      highlightPrice,
      placementFees,
      sectionFees,
      subSectionFees,
      subtotal,
      discountDetails,
      totalDiscountAmount,
      finalTotal,
    }
  }
  
  const stats = calculateStats()
  const pricing = calculatePricing()
  
  // Ruler component for vertical (left side)
  // widthInches parameter kept for API consistency with HorizontalRuler but not used in this component
  const VerticalRuler = ({ heightPx, widthInches: _widthInches }: { heightPx: number; widthInches: number }) => {
    const pixelsPerInch = 96
    const heightInches = heightPx / pixelsPerInch
    const rulerWidth = 25 // pixels
    const tickLength = 8 // pixels
    
    const ticks = []
    for (let i = 0; i <= Math.ceil(heightInches) + 0.5; i += 0.5) {
      const isFullInch = i % 1 === 0
      const yPos = i * pixelsPerInch
      if (yPos > heightPx) break // Don't draw beyond content
      
      ticks.push(
        <Box
          key={i}
          sx={{
            position: 'absolute',
            right: isFullInch ? 0 : rulerWidth - tickLength * 0.6,
            top: `${yPos}px`,
            width: isFullInch ? `${tickLength}px` : `${tickLength * 0.6}px`,
            height: '1px',
            bgcolor: '#666',
          }}
        />
      )
      if (isFullInch && i > 0) {
        ticks.push(
          <Typography
            key={`label-${i}`}
            sx={{
              position: 'absolute',
              right: `${tickLength + 3}px`,
              top: `${yPos - 7}px`,
              fontSize: '9px',
              color: '#666',
              fontFamily: 'monospace',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {i}"
          </Typography>
        )
      }
    }
    
    return (
      <Box
        sx={{
          position: 'absolute',
          left: `-${rulerWidth}px`,
          top: 0,
          width: `${rulerWidth}px`,
          height: `${heightPx}px`,
          bgcolor: '#f5f5f5',
          borderRight: '1px solid #ccc',
          pointerEvents: 'none',
        }}
      >
        {ticks}
      </Box>
    )
  }
  
  // Ruler component for horizontal (bottom side)
  const HorizontalRuler = ({ widthPx, widthInches }: { widthPx: number; widthInches: number }) => {
    const pixelsPerInch = 96
    const rulerHeight = 25 // pixels
    const tickLength = 8 // pixels
    
    const ticks = []
    for (let i = 0; i <= Math.ceil(widthInches) + 0.5; i += 0.5) {
      const isFullInch = i % 1 === 0
      const xPos = i * pixelsPerInch
      if (xPos > widthPx) break // Don't draw beyond content
      
      ticks.push(
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: isFullInch ? 0 : rulerHeight - tickLength * 0.6,
            left: `${xPos}px`,
            width: '1px',
            height: isFullInch ? `${tickLength}px` : `${tickLength * 0.6}px`,
            bgcolor: '#666',
          }}
        />
      )
      if (isFullInch && i > 0) {
        ticks.push(
          <Typography
            key={`label-${i}`}
            sx={{
              position: 'absolute',
              top: `${tickLength + 3}px`,
              left: `${xPos - 7}px`,
              fontSize: '9px',
              color: '#666',
              fontFamily: 'monospace',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {i}"
          </Typography>
        )
      }
    }
    
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: `-${rulerHeight}px`,
          left: 0,
          width: `${widthPx}px`,
          height: `${rulerHeight}px`,
          bgcolor: '#f5f5f5',
          borderTop: '1px solid #ccc',
          pointerEvents: 'none',
        }}
      >
        {ticks}
      </Box>
    )
  }

  // Show admin dashboard if open (only for admins)
  const [adminDashboardAdFilter, setAdminDashboardAdFilter] = useState<string | undefined>(undefined)
  if (showAdminDashboard) {
    // Only show admin dashboard if user is admin (both Cognito group and database)
    if (!isAdmin) {
      setShowAdminDashboard(false)
      setSnackbar({ open: true, message: 'Access denied. Admin privileges required.', severity: 'error' })
      return null
    }
    return <AdminDashboard onBack={() => { setShowAdminDashboard(false); setAdminDashboardAdFilter(undefined) }} initialAdFilter={adminDashboardAdFilter} />
  }

  // Show landing page if enabled
  if (showLandingPage) {
    return (
      <Box sx={{ width: '100vw', height: '100vh', bgcolor: 'grey.100', overflow: 'auto' }}>
        {/* App Bar */}
        <AppBar position="fixed" sx={{ zIndex: 1300 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              📰 Classified Ad Builder
            </Typography>
            
            <Tooltip title="Create new ad. Starts a new classified ad from scratch.">
              <IconButton color="inherit" onClick={() => { setShowLandingPage(false); newAd(); }}>
                <NoteAddIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="View my ads. Opens a list of all your saved ads.">
              <IconButton color="inherit" onClick={() => setAdsDialogOpen(true)}>
                <FolderOpenIcon />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title="Account">
              <IconButton color="inherit" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                <Badge badgeContent={unreadMessageCount} color="error" max={99}>
                  <AccountCircleIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Messages Dialog */}
        <MessagesDialog 
          open={showMessagesDialog} 
          onClose={() => setShowMessagesDialog(false)} 
          unreadCount={unreadMessageCount}
          onUnreadCountChange={setUnreadMessageCount}
          onNavigateToAdmin={(adId) => {
            setAdminDashboardAdFilter(adId)
            setShowAdminDashboard(true)
          }}
        />

        {/* My Ads Dialog */}
        <Dialog 
          open={adsDialogOpen} 
          onClose={() => setAdsDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>My Ads</DialogTitle>
          <DialogContent>
            {savedAds.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setAdsDialogOpen(false)
                    setShowLandingPage(false)
                    newAd()
                  }}
                >
                  Create Your First Ad
                </Button>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedAdIds.size > 0 && selectedAdIds.size < savedAds.length}
                        checked={savedAds.length > 0 && selectedAdIds.size === savedAds.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAdIds(new Set(savedAds.map(a => a.id)))
                          } else {
                            setSelectedAdIds(new Set())
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>Ad Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedAds.map((ad) => {
                    // Parse blocks to calculate stats
                    let totalWords = 0
                    let imageCount = 0
                    let textSectionsWithDecorations = 0
                    let textSectionsWithHighlights = 0

                    if (ad.blocks) {
                      try {
                        const parsedBlocks = JSON.parse(ad.blocks) as Block[]
                        parsedBlocks.forEach(block => {
                          if (block.type === 'text') {
                            const words = block.text.trim().split(/\s+/).filter((w: string) => w.length > 0)
                            totalWords += words.length
                            if (block.bold || block.italic || block.underline) {
                              textSectionsWithDecorations++
                            }
                            if (block.highlight && block.highlight !== 'none') {
                              textSectionsWithHighlights++
                            }
                          } else if (block.type === 'image') {
                            imageCount++
                          }
                        })
                      } catch { /* ignore parse errors */ }
                    }

                    // Calculate price estimate
                    const product = products.find(p => p.id === selectedProduct) || products[0]
                    const wordPrice = totalWords * PRICING_DATA.pricePerWord
                    const imagePrice = imageCount * PRICING_DATA.pricePerImage
                    const decorationPrice = textSectionsWithDecorations * PRICING_DATA.pricePerDecoration
                    const highlightPrice = textSectionsWithHighlights * PRICING_DATA.pricePerHighlight
                    const totalPrice = (product?.basePrice || 0) + wordPrice + imagePrice + decorationPrice + highlightPrice

                    // Get approval status
                    const status = ad.status || 'DRAFT'

                    return (
                      <TableRow
                        key={ad.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        selected={selectedAdIds.has(ad.id)}
                        onClick={() => {
                          setAdsDialogOpen(false)
                          setShowLandingPage(false)
                          loadAd(ad.id)
                        }}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedAdIds.has(ad.id)}
                            onChange={(e) => {
                              const next = new Set(selectedAdIds)
                              if (e.target.checked) {
                                next.add(ad.id)
                              } else {
                                next.delete(ad.id)
                              }
                              setSelectedAdIds(next)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {ad.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ad.widthInches || 3}" wide • {totalWords} words • {imageCount} images
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={
                              status === 'PUBLISHED' ? 'Published' :
                              status === 'APPROVED' ? 'Approved' :
                              status === 'PENDING_APPROVAL' ? 'Pending' :
                              status === 'NOT_APPROVED' ? 'Not Approved' :
                              status === 'ARCHIVED' ? 'Archived' :
                              'Draft'
                            }
                            color={
                              status === 'PUBLISHED' ? 'success' :
                              status === 'APPROVED' ? 'success' :
                              status === 'PENDING_APPROVAL' ? 'warning' :
                              status === 'NOT_APPROVED' ? 'error' :
                              status === 'ARCHIVED' ? 'default' :
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {ad.updatedAt ? new Date(ad.updatedAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" fontWeight={500}>
                            ${totalPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Export as PDF">
                              <IconButton
                                size="small"
                                disabled={isExporting}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  exportSingleAd(ad)
                                }}
                              >
                                {isExporting ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAdsDialogOpen(false)
                                setShowLandingPage(false)
                                loadAd(ad.id)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              disabled={status === 'APPROVED' || status === 'PENDING_APPROVAL' || status === 'PUBLISHED' || status === 'ARCHIVED'}
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (confirm(`Delete "${ad.title}"?`)) {
                                  try {
                                    // Delete images from S3 if any
                                    if (ad.blocks) {
                                      const parsedBlocks = JSON.parse(ad.blocks) as Block[]
                                      for (const block of parsedBlocks) {
                                        if (block.type === 'image' && block.s3Key) {
                                          await remove({ path: block.s3Key })
                                        }
                                      }
                                    }
                                    await client.graphql({
                                      query: deleteAd,
                                      variables: { input: { id: ad.id } },
                                      authMode: 'userPool'
                                    })
                                    await loadAdsList()
                                    setSnackbar({ open: true, message: 'Ad deleted', severity: 'success' })
                                  } catch (error) {
                                    console.error('Error deleting ad:', error)
                                    setSnackbar({ open: true, message: 'Failed to delete ad', severity: 'error' })
                                  }
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            {selectedAdIds.size > 0 && (
              <Button
                variant="contained"
                startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                disabled={isExporting}
                onClick={exportSelectedAds}
                sx={{ mr: 'auto' }}
              >
                Export {selectedAdIds.size} ad{selectedAdIds.size > 1 ? 's' : ''}
              </Button>
            )}
            <Button onClick={() => { setAdsDialogOpen(false); setSelectedAdIds(new Set()) }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
        >
          <MenuItem disabled>
            <ListItemText primary={user?.signInDetails?.loginId || 'User'} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setUserMenuAnchor(null); setContactDialogOpen(true); }}>
            <ListItemIcon><ContactsIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Contact Info" />
          </MenuItem>
          <MenuItem onClick={() => { setUserMenuAnchor(null); setShowMessagesDialog(true); }}>
            <ListItemIcon>
              <Badge badgeContent={unreadMessageCount} color="error">
                <MailIcon fontSize="small" />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Messages" />
          </MenuItem>
          {isAdmin && (
            <MenuItem onClick={() => { setUserMenuAnchor(null); setShowAdminDashboard(true); }}>
              <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </MenuItem>
          )}
          <MenuItem onClick={signOut}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Sign Out" />
          </MenuItem>
        </Menu>

        {/* Contact Info Dialog */}
        <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Contact Information</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                size="small"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
              />
              <TextField
                label="Phone"
                fullWidth
                size="small"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                size="small"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              />
              <TextField
                label="Address"
                fullWidth
                size="small"
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="City"
                  fullWidth
                  size="small"
                  value={contactInfo.city}
                  onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                />
                <TextField
                  label="State"
                  fullWidth
                  size="small"
                  value={contactInfo.state}
                  onChange={(e) => setContactInfo({ ...contactInfo, state: e.target.value })}
                />
                <TextField
                  label="ZIP"
                  fullWidth
                  size="small"
                  value={contactInfo.zip}
                  onChange={(e) => setContactInfo({ ...contactInfo, zip: e.target.value })}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Tooltip title="Cancel saving contact info. Closes the dialog without saving changes.">
              <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
            </Tooltip>
            <Tooltip title="Save contact information. Saves your contact details to your user profile.">
              <Button variant="contained" onClick={async () => {
                // Save contact info to user record
                try {
                  await client.graphql({
                    query: updateUser,
                    variables: {
                      input: {
                        id: user?.userId,
                        contactName: contactInfo.name,
                        contactPhone: contactInfo.phone,
                        contactEmail: contactInfo.email,
                        contactAddress: contactInfo.address,
                        contactCity: contactInfo.city,
                        contactState: contactInfo.state,
                        contactZip: contactInfo.zip,
                      }
                    },
                    authMode: 'userPool'
                  })
                  setSnackbar({ open: true, message: 'Contact info saved', severity: 'success' })
                  setContactDialogOpen(false)
                } catch (error) {
                  console.error('Error saving contact info:', error)
                  setSnackbar({ open: true, message: 'Failed to save contact info', severity: 'error' })
                }
              }}>
                Save
              </Button>
            </Tooltip>
          </DialogActions>
      </Dialog>

        {/* Landing Page Content */}
        <Box sx={{ pt: `${APPBAR_HEIGHT}px`, minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 4, py: 8 }}>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 800 }}>
              <NewspaperIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Welcome to Classified Ad Builder
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Create professional classified advertisements for your local newspaper with ease
              </Typography>
            </Box>

            {/* Features Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 4, mb: 6, maxWidth: 1200, width: '100%' }}>
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CreateIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Easy Creation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Build your ad with our intuitive drag-and-drop editor. Add text, images, and format your content exactly as you want it.
                </Typography>
              </Paper>

              <Paper elevation={2} sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ImageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Rich Media
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload images to make your ad stand out. Support for multiple images with automatic sizing and positioning.
                </Typography>
              </Paper>

              <Paper elevation={2} sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Professional Output
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Export your ad as a PDF ready for print. Preview exactly how it will look in the newspaper.
                </Typography>
              </Paper>
            </Box>

            {/* Call to Action */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<GetStartedIcon />}
                onClick={() => { setShowLandingPage(false); newAd(); }}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                Create Your First Ad
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: 'grey.100', overflow: 'hidden', position: 'relative' }}>
      {/* Messages Dialog */}
      <MessagesDialog 
        open={showMessagesDialog} 
        onClose={() => setShowMessagesDialog(false)} 
        unreadCount={unreadMessageCount}
        onUnreadCountChange={setUnreadMessageCount}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={calculatePricing().finalTotal}
        savedCard={savedCard}
        onSaveCard={handleSaveCard}
        onUpdateCard={handleUpdateCard}
        onRemoveCard={handleRemoveCard}
      />
      
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => {
              setShowLandingPage(true)
              setCurrentAdId(null)
              setBlocks([])
            }}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📰 Classified Ad Builder
          </Typography>
          
          <Tooltip title="New Ad">
            <IconButton color="inherit" onClick={newAd}>
              <NoteAddIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="My Ads">
            <IconButton color="inherit" onClick={() => setAdsDialogOpen(true)}>
              <FolderOpenIcon />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
          
          <Tooltip title="Account">
            <IconButton color="inherit" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* My Ads Dialog */}
      <Dialog 
        open={adsDialogOpen} 
        onClose={() => setAdsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>My Ads</DialogTitle>
        <DialogContent>
          {savedAds.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No saved ads yet. Create your first ad!
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedAdIds.size > 0 && selectedAdIds.size < savedAds.length}
                      checked={savedAds.length > 0 && selectedAdIds.size === savedAds.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAdIds(new Set(savedAds.map(a => a.id)))
                        } else {
                          setSelectedAdIds(new Set())
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Ad Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedAds.map((ad) => {
                  // Parse blocks to calculate stats
                  let totalWords = 0
                  let imageCount = 0
                  let textSectionsWithDecorations = 0
                  let textSectionsWithHighlights = 0

                  if (ad.blocks) {
                    try {
                      const parsedBlocks = JSON.parse(ad.blocks) as Block[]
                      parsedBlocks.forEach(block => {
                        if (block.type === 'text') {
                          const words = block.text.trim().split(/\s+/).filter((w: string) => w.length > 0)
                          totalWords += words.length
                          if (block.bold || block.italic || block.underline) {
                            textSectionsWithDecorations++
                          }
                          if (block.highlight && block.highlight !== 'none') {
                            textSectionsWithHighlights++
                          }
                        } else if (block.type === 'image') {
                          imageCount++
                        }
                      })
                    } catch { /* ignore parse errors */ }
                  }

                  // Calculate price estimate
                  const product = products.find(p => p.id === selectedProduct) || products[0]
                  const wordPrice = totalWords * PRICING_DATA.pricePerWord
                  const imagePrice = imageCount * PRICING_DATA.pricePerImage
                  const decorationPrice = textSectionsWithDecorations * PRICING_DATA.pricePerDecoration
                  const highlightPrice = textSectionsWithHighlights * PRICING_DATA.pricePerHighlight
                  const totalPrice = (product?.basePrice || 0) + wordPrice + imagePrice + decorationPrice + highlightPrice

                  // Get approval status
                  const status = ad.status || 'DRAFT'

                  return (
                    <TableRow
                      key={ad.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      selected={selectedAdIds.has(ad.id)}
                      onClick={() => {
                        setAdsDialogOpen(false)
                        setShowLandingPage(false)
                        loadAd(ad.id)
                      }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedAdIds.has(ad.id)}
                          onChange={(e) => {
                            const next = new Set(selectedAdIds)
                            if (e.target.checked) {
                              next.add(ad.id)
                            } else {
                              next.delete(ad.id)
                            }
                            setSelectedAdIds(next)
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {ad.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ad.widthInches || 3}" wide • {totalWords} words • {imageCount} images
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={
                            status === 'PUBLISHED' ? 'Published' :
                            status === 'APPROVED' ? 'Approved' :
                            status === 'PENDING_APPROVAL' ? 'Pending' :
                            status === 'NOT_APPROVED' ? 'Not Approved' :
                            status === 'ARCHIVED' ? 'Archived' :
                            'Draft'
                          }
                          color={
                            status === 'PUBLISHED' ? 'success' :
                            status === 'APPROVED' ? 'success' :
                            status === 'PENDING_APPROVAL' ? 'warning' :
                            status === 'NOT_APPROVED' ? 'error' :
                            status === 'ARCHIVED' ? 'default' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {ad.updatedAt ? new Date(ad.updatedAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight={500}>
                          ${totalPrice.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Export as PDF">
                            <IconButton
                              size="small"
                              disabled={isExporting}
                              onClick={(e) => {
                                e.stopPropagation()
                                exportSingleAd(ad)
                              }}
                            >
                              {isExporting ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation()
                              setAdsDialogOpen(false)
                              setShowLandingPage(false)
                              loadAd(ad.id)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            disabled={status === 'APPROVED' || status === 'PENDING_APPROVAL' || status === 'PUBLISHED' || status === 'ARCHIVED'}
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (confirm(`Delete "${ad.title}"?`)) {
                                try {
                                  // Delete images from S3 if any
                                  if (ad.blocks) {
                                    const parsedBlocks = JSON.parse(ad.blocks) as Block[]
                                    for (const block of parsedBlocks) {
                                      if (block.type === 'image' && block.s3Key) {
                                        await remove({ path: block.s3Key })
                                      }
                                    }
                                  }
                                  await client.graphql({
                                    query: deleteAd,
                                    variables: { input: { id: ad.id } },
                                    authMode: 'userPool'
                                  })
                                  await loadAdsList()
                                  setSnackbar({ open: true, message: 'Ad deleted', severity: 'success' })
                                } catch (error) {
                                  console.error('Error deleting ad:', error)
                                  setSnackbar({ open: true, message: 'Failed to delete ad', severity: 'error' })
                                }
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          {selectedAdIds.size > 0 && (
            <Button
              variant="contained"
              startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              disabled={isExporting}
              onClick={exportSelectedAds}
              sx={{ mr: 'auto' }}
            >
              Export {selectedAdIds.size} ad{selectedAdIds.size > 1 ? 's' : ''}
            </Button>
          )}
          <Button onClick={() => { setAdsDialogOpen(false); setSelectedAdIds(new Set()) }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
      >
        <MenuItem disabled>
          <ListItemText primary={user?.signInDetails?.loginId || 'User'} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setUserMenuAnchor(null); setContactDialogOpen(true); }}>
          <ListItemIcon><ContactsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Contact Info" />
        </MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); setShowMessagesDialog(true); }}>
          <ListItemIcon>
            <Badge badgeContent={unreadMessageCount} color="error">
              <MailIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Messages" />
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={() => { setUserMenuAnchor(null); setShowAdminDashboard(true); }}>
            <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Admin Dashboard" />
          </MenuItem>
        )}
        <MenuItem onClick={signOut}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
      
      {/* Contact Info Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Information</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              size="small"
              value={contactInfo.name}
              onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              size="small"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              size="small"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
            />
            <TextField
              label="Address"
              fullWidth
              size="small"
              value={contactInfo.address}
              onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="City"
                size="small"
                value={contactInfo.city}
                onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                sx={{ flex: 2 }}
              />
              <TextField
                label="State"
                size="small"
                value={contactInfo.state}
                onChange={(e) => setContactInfo({ ...contactInfo, state: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="ZIP"
                size="small"
                value={contactInfo.zip}
                onChange={(e) => setContactInfo({ ...contactInfo, zip: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setContactDialogOpen(false)
              setSnackbar({ open: true, message: 'Contact info saved', severity: 'success' })
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fixed Sidebar */}
      <Paper
        ref={sidebarRef}
        elevation={2}
        sx={{
          position: 'fixed',
          left: 0,
          top: APPBAR_HEIGHT,
          height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
          width: `${sidebarWidth}px`,
          zIndex: 1200,
          borderRadius: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {/* Resizer */}
        <Box
          onMouseDown={handleResizeStart}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '4px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 1201,
            '&:hover': {
              bgcolor: 'primary.main',
            },
            ...(isResizing && {
              bgcolor: 'primary.main',
            }),
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            <Tabs 
              value={sidebarTab} 
              onChange={(_, newValue) => setSidebarTab(newValue)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="My Ad" />
              <Tab label="Content" />
              <Tab label="Pricing" />
            </Tabs>

            {/* Hidden file input for images */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Tab Panel: My Ad (index 0) */}
            <Box 
              role="tabpanel" 
              hidden={sidebarTab !== 0} 
              sx={{ px: 3, py: 2, flex: 1, overflowY: 'auto' }}
            >
              {sidebarTab === 0 && (
                <>
                  {/* Product Dropdown */}
                  <Box mb={2} sx={{ pt: 0.5 }}>
                    <FormControl fullWidth size="small" variant="outlined">
                      <InputLabel id="product-select-label">Select Product</InputLabel>
                      <Select
                        labelId="product-select-label"
                        value={selectedProduct || (products.length > 0 ? products[0].id : '')}
                        label="Select Product"
                        disabled={isAdLocked}
                        onChange={(e) => {
                          setSelectedProduct(e.target.value)
                          // Update ad width when product changes
                          const product = products.find(p => p.id === e.target.value)
                          if (product) {
                            setAdWidthInches(product.widthInches)
                          }
                          // Update ad title with new product name
                          if (!currentAdId) {
                            const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            const product = products.find(p => p.id === e.target.value)
                            setAdTitle(`${product?.name || 'Product'}-${dateStr}`)
                          }
                          // Load placements and sections for newly selected product
                          setSelectedPlacements([])
                          setSelectedSections([])
                          setSelectedSubSections([])
                          setSubSections([])
                          loadPlacementsForProduct(e.target.value)
                          loadSectionsForProduct(e.target.value)
                        }}
                        renderValue={(value) => {
                          if (!value || value === '') {
                            return '';
                          }
                          const product = products.find(p => p.id === value);
                          return product ? `${product.name} (${product.widthInches}" wide)` : '';
                        }}
                      >
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name} ({product.widthInches}" wide)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Sections Multi-Select */}
                  {sections.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Sections
                      </Typography>
                      <FormGroup>
                        {sections.map(section => (
                          <FormControlLabel
                            key={section.id}
                            control={
                              <Checkbox
                                size="small"
                                disabled={isAdLocked}
                                checked={selectedSections.includes(section.id)}
                                onChange={(e) => {
                                  const newSelected = e.target.checked
                                    ? [...selectedSections, section.id]
                                    : selectedSections.filter(id => id !== section.id)
                                  setSelectedSections(newSelected)
                                  // Reload sub-sections for selected sections
                                  loadSubSectionsForSections(newSelected)
                                  // Clear sub-section selections that no longer have a parent section selected
                                  if (!e.target.checked) {
                                    setSelectedSubSections(prev =>
                                      prev.filter(ssId => {
                                        // Keep only sub-sections that belong to still-selected sections
                                        const subsForSection = subSections.filter(ss => ss.sectionId === section.id).map(ss => ss.id)
                                        return !subsForSection.includes(ssId)
                                      })
                                    )
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {section.name}
                                {section.effectiveFee > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    (+${section.effectiveFee.toFixed(2)})
                                  </Typography>
                                )}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  )}

                  {/* Sub-Sections Multi-Select */}
                  {subSections.length > 0 && selectedSections.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Sub-Sections
                      </Typography>
                      <FormGroup>
                        {subSections.filter(ss => selectedSections.includes(ss.sectionId)).map(ss => (
                          <FormControlLabel
                            key={ss.id}
                            control={
                              <Checkbox
                                size="small"
                                disabled={isAdLocked}
                                checked={selectedSubSections.includes(ss.id)}
                                onChange={(e) => {
                                  setSelectedSubSections(prev =>
                                    e.target.checked
                                      ? [...prev, ss.id]
                                      : prev.filter(id => id !== ss.id)
                                  )
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {ss.name}
                                {ss.effectiveFee > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    (+${ss.effectiveFee.toFixed(2)})
                                  </Typography>
                                )}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  )}

                  {/* Placement Multi-Select */}
                  {placements.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Placements
                      </Typography>
                      <FormGroup>
                        {placements.map(placement => (
                          <FormControlLabel
                            key={placement.id}
                            control={
                              <Checkbox
                                size="small"
                                disabled={isAdLocked}
                                checked={selectedPlacements.includes(placement.id)}
                                onChange={(e) => {
                                  setSelectedPlacements(prev =>
                                    e.target.checked
                                      ? [...prev, placement.id]
                                      : prev.filter(id => id !== placement.id)
                                  )
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {placement.name}
                                {placement.description && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    — {placement.description}
                                  </Typography>
                                )}
                                {placement.effectiveFee > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    (+${placement.effectiveFee.toFixed(2)})
                                  </Typography>
                                )}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  )}

                  {/* Ad Name */}
                  <Box mb={2}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Ad Name"
                      value={adTitle}
                      onChange={(e) => {
                        setAdTitle(e.target.value)
                        markAsEdited()
                      }}
                      disabled={isAdLocked}
                    />
                  </Box>

                  {/* Start Date */}
                  <Box mb={2}>
                    <TextField
                      type="date"
                      size="small"
                      fullWidth
                      label="Start Date"
                      value={startDate}
                      disabled={isAdLocked}
                      onChange={(e) => {
                        const newStartDate = e.target.value
                        setStartDate(newStartDate)
                        // If end date is before new start date, update it
                        if (endDate < newStartDate) {
                          const newEndDate = new Date(newStartDate)
                          newEndDate.setMonth(newEndDate.getMonth() + 1)
                          setEndDate(newEndDate.toISOString().split('T')[0])
                        }
                        markAsEdited()
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: getTodayDateString(),
                        max: (() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const maxDate = new Date(today)
                          maxDate.setMonth(maxDate.getMonth() + 6)
                          return maxDate.toISOString().split('T')[0]
                        })(),
                      }}
                    />
                  </Box>

                  {/* End Date */}
                  <Box mb={2}>
                    <TextField
                      type="date"
                      size="small"
                      fullWidth
                      label="End Date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        markAsEdited()
                      }}
                      disabled={isAdLocked}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: startDate,
                        max: (() => {
                          const start = new Date(startDate)
                          const maxDate = new Date(start)
                          maxDate.setMonth(maxDate.getMonth() + 6)
                          return maxDate.toISOString().split('T')[0]
                        })(),
                      }}
                    />
                  </Box>

                  {/* Border Style */}
                  <Box mb={2}>
                    <Box sx={{ position: 'relative', my: 2 }}>
                      <Divider />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pr: 1,
                          color: 'text.secondary',
                          px: 0.5
                        }}
                      >
                        Border
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={borderStyle}
                      exclusive
                      onChange={(_, value) => {
                        if (value) {
                          setBorderStyle(value)
                          markAsEdited()
                        }
                      }}
                      size="small"
                      fullWidth
                      disabled={isAdLocked}
                    >
                      <ToggleButton value="none">None</ToggleButton>
                      <ToggleButton value="thin">Thin</ToggleButton>
                      <ToggleButton value="thick">Thick</ToggleButton>
                      <ToggleButton value="dashed">Dashed</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Corner Style */}
                  <Box mb={2}>
                    <Box sx={{ position: 'relative', my: 2 }}>
                      <Divider />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pr: 1,
                          color: 'text.secondary',
                          px: 0.5
                        }}
                      >
                        Corners
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={cornerStyle}
                      exclusive
                      onChange={(_, value) => {
                        if (value) {
                          setCornerStyle(value)
                          markAsEdited()
                        }
                      }}
                      size="small"
                      fullWidth
                      disabled={isAdLocked}
                    >
                      <ToggleButton value="flat">Flat</ToggleButton>
                      <ToggleButton value="rounded">Rounded</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Padding */}
                  <Box mb={2}>
                    <Box sx={{ position: 'relative', my: 2 }}>
                      <Divider />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pr: 1,
                          color: 'text.secondary',
                          px: 0.5
                        }}
                      >
                        Padding
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={adPadding}
                      exclusive
                      onChange={(_, value) => {
                        if (value) {
                          setAdPadding(value)
                          markAsEdited()
                        }
                      }}
                      size="small"
                      fullWidth
                      disabled={isAdLocked}
                    >
                      <ToggleButton value="none">None</ToggleButton>
                      <ToggleButton value="medium">Medium</ToggleButton>
                      <ToggleButton value="large">Large</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </>
              )}
            </Box>

            {/* Tab Panel: Content (index 1) */}
            <Box 
              role="tabpanel" 
              hidden={sidebarTab !== 1} 
              sx={{ px: 3, py: 2, flex: 1, overflowY: 'auto' }}
            >
              {sidebarTab === 1 && (
                <>
                  <Stack direction="row" spacing={1} mb={2}>
                    <Button variant="contained" size="small" startIcon={<CircularPlusIcon color="primary" />} onClick={addTextBlock} disabled={isAdLocked || isSaving || products.length === 0} sx={{ flex: 1 }}>
                      Text
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<CircularPlusIcon color="primary" />} onClick={addImageBlock} disabled={isAdLocked || isSaving || products.length === 0} sx={{ flex: 1 }}>
                      Image
                    </Button>
                  </Stack>

                  {/* Nothing selected hint */}
                  {!selectedTextBlock && !selectedImageBlock && blocks.length > 0 && (
                    <Box sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', px: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        Click on a text or image block in the ad preview to select it and edit its properties here.
                      </Typography>
                    </Box>
                  )}

                  {/* Text Block Editor */}
                  {selectedTextBlock && (
                    <Paper elevation={1} sx={{ p: 2, mt: 2, mb: 2, bgcolor: 'background.paper' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Edit Text
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Move block up. Moves this text block one position higher in the ad.">
                            <span>
                              <IconButton size="small" onClick={() => moveBlockUp(selectedTextBlock.id)} disabled={isAdLocked}>
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Move block down. Moves this text block one position lower in the ad.">
                            <span>
                              <IconButton size="small" onClick={() => moveBlockDown(selectedTextBlock.id)} disabled={isAdLocked}>
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete block. Permanently removes this text block from the ad.">
                            <span>
                              <IconButton size="small" color="error" onClick={() => deleteBlock(selectedTextBlock.id)} disabled={isAdLocked}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <TextField
                        multiline
                        minRows={3}
                        maxRows={6}
                        fullWidth
                        disabled={isAdLocked}
                        value={selectedTextBlock.text}
                        onChange={e => updateTextBlock(selectedTextBlock.id, { text: e.target.value })}
                        inputRef={textBlockInputRef}
                        onFocus={(e) => {
                          // Select all text when focused
                          const target = e.target as HTMLTextAreaElement
                          if (target && target.select) {
                            target.select()
                          }
                        }}
                        sx={{ mb: 2 }}
                      />
                      
                      {/* Style Controls Row */}
                      <Stack direction="row" spacing={1} mb={2} alignItems="center">
                        <Tooltip title="Bold text. Makes the selected text bold for emphasis.">
                          <span>
                            <IconButton
                              size="small"
                              color={selectedTextBlock.bold ? 'primary' : 'default'}
                              onClick={() => updateTextBlock(selectedTextBlock.id, { bold: !selectedTextBlock.bold })}
                              disabled={isAdLocked}
                            >
                              <FormatBoldIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Italic text. Makes the selected text italic for emphasis.">
                          <span>
                            <IconButton
                              size="small"
                              color={selectedTextBlock.italic ? 'primary' : 'default'}
                              onClick={() => updateTextBlock(selectedTextBlock.id, { italic: !selectedTextBlock.italic })}
                              disabled={isAdLocked}
                            >
                              <FormatItalicIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Underline text. Adds an underline to the selected text.">
                          <span>
                            <IconButton
                              size="small"
                              color={selectedTextBlock.underline ? 'primary' : 'default'}
                              onClick={() => updateTextBlock(selectedTextBlock.id, { underline: !selectedTextBlock.underline })}
                              disabled={isAdLocked}
                            >
                              <FormatUnderlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        <ToggleButtonGroup
                          value={selectedTextBlock.alignment}
                          exclusive
                          onChange={(_, value) => value && updateTextBlock(selectedTextBlock.id, { alignment: value })}
                          size="small"
                        >
                          <ToggleButton value="left" aria-label="left aligned">
                            <FormatAlignLeftIcon fontSize="small" />
                          </ToggleButton>
                          <ToggleButton value="center" aria-label="centered">
                            <FormatAlignCenterIcon fontSize="small" />
                          </ToggleButton>
                          <ToggleButton value="right" aria-label="right aligned">
                            <FormatAlignRightIcon fontSize="small" />
                          </ToggleButton>
                        </ToggleButtonGroup>
                </Stack>

                      {/* Size Selection */}
                      <Box mb={2}>
                        <Box sx={{ position: 'relative', my: 2 }}>
                          <Divider />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pr: 1,
                              color: 'text.secondary',
                              backgroundColor: 'background.paper',
                              px: 0.5
                            }}
                          >
                            Size
                          </Typography>
                        </Box>
                        <ToggleButtonGroup
                          value={selectedTextBlock.size}
                          exclusive
                          onChange={(_, value) => value && updateTextBlock(selectedTextBlock.id, { size: value, fontSize: TEXT_SIZE_MAP[value as TextSize] })}
                          size="small"
                          fullWidth
                        >
                          <ToggleButton value="small">Small</ToggleButton>
                          <ToggleButton value="medium">Medium</ToggleButton>
                          <ToggleButton value="large">Large</ToggleButton>
                        </ToggleButtonGroup>
                      </Box>

                      {/* Font Selection */}
                      <Box mb={2}>
                        <Box sx={{ position: 'relative', my: 2 }}>
                          <Divider />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pr: 1,
                              color: 'text.secondary',
                              backgroundColor: 'background.paper',
                              px: 0.5
                            }}
                          >
                            Font
                          </Typography>
                        </Box>
                        <ToggleButtonGroup
                          value={selectedTextBlock.font}
                          exclusive
                          onChange={(_, value) => value && updateTextBlock(selectedTextBlock.id, { font: value })}
                          size="small"
                          fullWidth
                        >
                          <ToggleButton value="serif" sx={{ fontFamily: '"Times New Roman", serif' }}>
                            Serif
                          </ToggleButton>
                          <ToggleButton value="sans-serif" sx={{ fontFamily: 'Arial, sans-serif' }}>
                            Sans-serif
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>

                      {/* Highlight Selection */}
                      <Box>
                        <Box sx={{ position: 'relative', my: 2 }}>
                          <Divider />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pr: 1,
                              color: 'text.secondary',
                              backgroundColor: 'background.paper',
                              px: 0.5
                            }}
                          >
                            Highlight
                          </Typography>
                        </Box>
                        <ToggleButtonGroup
                          value={selectedTextBlock.highlight || 'none'}
                          exclusive
                          onChange={(_, value) => value && updateTextBlock(selectedTextBlock.id, { highlight: value })}
                          size="small"
                          fullWidth
                        >
                          <ToggleButton value="none">None</ToggleButton>
                          <ToggleButton value="black" sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' } }}>
                            Black
                          </ToggleButton>
                          <ToggleButton value="gray" sx={{ bgcolor: '#e0e0e0', '&:hover': { bgcolor: '#d0d0d0' } }}>
                            Gray
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                    </Paper>
                  )}

                  {/* Image Block Editor */}
                  {selectedImageBlock && (
                    <Paper elevation={1} sx={{ p: 2, mt: 2, mb: 2, bgcolor: 'background.paper' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Edit Image
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Move up">
                            <span>
                              <IconButton size="small" onClick={() => moveBlockUp(selectedImageBlock.id)} disabled={isAdLocked}>
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Move down">
                            <span>
                              <IconButton size="small" onClick={() => moveBlockDown(selectedImageBlock.id)} disabled={isAdLocked}>
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <span>
                              <IconButton size="small" color="error" onClick={() => deleteBlock(selectedImageBlock.id)} disabled={isAdLocked}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img 
                          src={selectedImageBlock.src} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 4 }} 
                        />
                      </Box>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<CircularPlusIcon color="primary" />}
                        onClick={addImageBlock}
                        disabled={isAdLocked || isSaving}
                      >
                        Replace Image
                      </Button>
                    </Paper>
                  )}
                </>
              )}
            </Box>


            {/* Tab Panel: Pricing (index 2) */}
            <Box 
              role="tabpanel" 
              hidden={sidebarTab !== 2} 
              sx={{ px: 3, py: 2, flex: 1, overflowY: 'auto' }}
            >
              {sidebarTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Pricing Breakdown */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Pricing Breakdown
                    </Typography>
                    <Paper variant="outlined" sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableBody>
                          {/* Product Pricing - moved to top */}
                          {selectedProduct && pricing.productPrice > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2">
                                  Product: {products.find(p => p.id === selectedProduct)?.name || selectedProduct}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.productPrice.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          {/* Dimensions - no price */}
                          <TableRow>
                            <TableCell sx={{ borderBottom: 'none' }}>
                              <Typography variant="body2">
                                Dimensions: {stats.width}" × {stats.height}"
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: 'none' }}>
                              {/* Empty for items without price */}
                            </TableCell>
                          </TableRow>
                          
                          {/* Word Count - no price, but has pricing line item */}
                          <TableRow>
                            <TableCell sx={{ borderBottom: 'none' }}>
                              <Typography variant="body2">
                                Word Count: {stats.totalWords}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: 'none' }}>
                              {/* Empty */}
                            </TableCell>
                          </TableRow>
                          
                          {/* Words Pricing */}
                          <TableRow>
                            <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                Words ({stats.totalWords} × ${PRICING_DATA.pricePerWord.toFixed(2)})
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: 'none' }}>
                              <Typography variant="body2" fontWeight={500}>
                                ${pricing.wordPrice.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          
                          {/* Line Count - no price, but has pricing line item */}
                          <TableRow>
                            <TableCell sx={{ borderBottom: 'none' }}>
                              <Typography variant="body2">
                                Line Count: {stats.totalLines}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: 'none' }}>
                              {/* Empty */}
                            </TableCell>
                          </TableRow>
                          
                          {/* Lines Pricing */}
                          <TableRow>
                            <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                Lines ({stats.totalLines} × ${PRICING_DATA.pricePerLine.toFixed(2)})
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: 'none' }}>
                              <Typography variant="body2" fontWeight={500}>
                                ${pricing.linePrice.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          
                          {/* Text Sections - no price */}
                          <TableRow>
                            <TableCell sx={{ borderBottom: 'none' }}>
                              <Typography variant="body2">
                                Text Sections: {stats.textSections}
                                {stats.textSectionsWithDecorations > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    ({stats.textSectionsWithDecorations} with decorations)
                                  </Typography>
                                )}
                                {stats.textSectionsWithHighlights > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    ({stats.textSectionsWithHighlights} with highlights)
                                  </Typography>
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: 'none' }}>
                              {/* Empty */}
                            </TableCell>
                          </TableRow>
                          
                          {/* Images - no price line, but has pricing line item */}
                          <TableRow>
                            <TableCell sx={{ borderBottom: 'none' }}>
                              <Typography variant="body2">
                                Images: {stats.imageCount}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderBottom: 'none' }}>
                              {/* Empty */}
                            </TableCell>
                          </TableRow>
                          
                          {/* Images Pricing */}
                          {stats.imageCount > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Images ({stats.imageCount} × ${PRICING_DATA.pricePerImage.toFixed(2)})
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.imagePrice.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          {/* Decorations Pricing */}
                          {stats.textSectionsWithDecorations > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Decorations ({stats.textSectionsWithDecorations} × ${PRICING_DATA.pricePerDecoration.toFixed(2)})
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.decorationPrice.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          {/* Highlights Pricing */}
                          {stats.textSectionsWithHighlights > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Highlights ({stats.textSectionsWithHighlights} × ${PRICING_DATA.pricePerHighlight.toFixed(2)})
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.highlightPrice.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          {/* Section Fees */}
                          {selectedSections.length > 0 && pricing.sectionFees > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Sections ({sections.filter(s => selectedSections.includes(s.id)).map(s => s.name).join(', ')})
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.sectionFees.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}

                          {/* Sub-Section Fees */}
                          {selectedSubSections.length > 0 && pricing.subSectionFees > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Sub-Sections ({subSections.filter(ss => selectedSubSections.includes(ss.id)).map(ss => ss.name).join(', ')})
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.subSectionFees.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}

                          {/* Placement Fees */}
                          {selectedPlacements.length > 0 && pricing.placementFees > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Placements ({placements.filter(p => selectedPlacements.includes(p.id)).map(p => p.name).join(', ')})
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.placementFees.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}

                          {/* Subtotal (only shown when discounts are applied) */}
                          {pricing.totalDiscountAmount > 0 && (
                            <TableRow>
                              <TableCell sx={{ borderTop: 1, borderColor: 'divider' }}>
                                <Typography variant="body2" fontWeight={600}>Subtotal</Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ borderTop: 1, borderColor: 'divider' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  ${pricing.subtotal.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}

                          {/* Discount rows */}
                          {pricing.discountDetails.map(d => (
                            <TableRow key={d.id}>
                              <TableCell sx={{ borderBottom: 'none', pl: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="body2" color="success.main">
                                    {d.name}
                                    {d.code && ` (${d.code})`}
                                    {' — '}
                                    {d.discountType === 'FLAT' ? `-$${d.value.toFixed(2)}` : `-${d.value}%`}
                                  </Typography>
                                  {!d.isAutomatic && (
                                    <IconButton
                                      size="small"
                                      sx={{ p: 0, ml: 0.5 }}
                                      onClick={() => removeDiscount(d.id)}
                                    >
                                      <CloseIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Typography variant="body2" color="success.main" fontWeight={500}>
                                  -${d.computedAmount.toFixed(2)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Total */}
                          <TableRow>
                            <TableCell sx={{ borderTop: pricing.totalDiscountAmount > 0 ? 0 : 1, borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={600}>
                                {pricing.totalDiscountAmount > 0 ? 'Total After Discounts' : 'Total'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ borderTop: pricing.totalDiscountAmount > 0 ? 0 : 1, borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={700} fontSize="1.1rem">
                                ${pricing.finalTotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  </Box>

                  {/* Coupon Code */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Promo Code
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Enter code"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                        error={!!couponError}
                        helperText={couponError}
                        sx={{ flex: 1 }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                      />
                      <Button variant="outlined" size="small" onClick={applyCoupon} sx={{ alignSelf: 'flex-start' }}>
                        Apply
                      </Button>
                    </Box>
                    {appliedDiscounts.filter(d => d.isAutomatic).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {appliedDiscounts.filter(d => d.isAutomatic).map(d => (
                          <Typography key={d.id} variant="caption" color="success.main" display="block">
                            ✓ {d.name} applied automatically
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
      </Paper>

      {/* Preview Area */}
      <Box
        onClick={() => setSelectedBlockId(null)}
        sx={{
          ml: `${sidebarWidth}px`,
          width: `calc(100vw - ${sidebarWidth}px)`,
          height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
          mt: `${APPBAR_HEIGHT}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: isResizing ? 'none' : 'margin-left 0.2s, width 0.2s',
          bgcolor: 'grey.100',
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'auto',
          pt: 2,
          pb: 4,
        }}
      >
        {/* Header area with badge and buttons */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            width: '100%',
            px: 2,
            minHeight: 48,
          }}
        >
          {/* Approval Status Badge - Left side */}
          <Box>
            {currentAdId && (
              <Chip
                label={
                  adApproved ? 'Approved' : 
                  adStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : 
                  adStatus === 'NOT_APPROVED' ? 'Not Approved' : 
                  'Draft'
                }
                color={
                  adApproved ? 'success' : 
                  adStatus === 'PENDING_APPROVAL' ? 'warning' : 
                  adStatus === 'NOT_APPROVED' ? 'error' : 
                  'default'
                }
                sx={{
                  height: 36.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  px: 1.5,
                }}
              />
            )}
          </Box>
          
          {/* Save and Submit/Edit buttons - Right side */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {adStatus === 'APPROVED' || adStatus === 'ARCHIVED' || adStatus === 'PUBLISHED' ? (
              // No buttons for Approved, Archived, or Published
              null
            ) : adStatus === 'PENDING_APPROVAL' ? (
              // Pending: Cancel submission button
              <Button
                variant="outlined"
                color="primary"
                onClick={cancelSubmission}
                disabled={isSaving}
                sx={{ bgcolor: 'white', boxShadow: 2, minWidth: 140, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              >
                Cancel Submission
              </Button>
            ) : adStatus === 'NOT_APPROVED' ? (
              // Not Approved: Edit & Send for approval (after changes and first save)
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveAd}
                  disabled={isSaving || blocks.length === 0}
                  startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{ boxShadow: 2, minWidth: 120 }}
                >
                  Save Ad
                </Button>
                {currentAdId && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={submitForApproval}
                    disabled={isSaving || blocks.length === 0 || hasUnsavedChanges}
                    sx={{ bgcolor: 'white', boxShadow: 2, minWidth: 140, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                  >
                    Submit for Approval
                  </Button>
                )}
              </>
            ) : (
              // Draft: Save & Send for approval (after first save)
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveAd}
                  disabled={isSaving || blocks.length === 0}
                  startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{ boxShadow: 2, minWidth: 120 }}
                >
                  Save Ad
                </Button>
                {currentAdId && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={submitForApproval}
                    disabled={isSaving || blocks.length === 0 || hasUnsavedChanges}
                    sx={{ bgcolor: 'white', boxShadow: 2, minWidth: 140, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                  >
                    Submit for Approval
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
        
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box
            ref={adContainerRef}
            onClick={(e) => {
              // If clicking on the container (outside the Paper), deselect
              if (e.target === e.currentTarget) {
                setSelectedBlockId(null)
              }
            }}
            sx={{
              position: 'relative',
              display: 'inline-block',
              mt: 0,
            }}
          >
            
            {/* Vertical Ruler (Left Side) */}
            <VerticalRuler heightPx={adHeightPx} widthInches={adWidthInches} />
            
            {/* Horizontal Ruler (Bottom Side) */}
            <HorizontalRuler widthPx={adWidthPx} widthInches={adWidthInches} />
            
            {/* Ad Preview - this is what gets exported to PDF */}
            <Paper
              ref={adPreviewRef}
              elevation={borderStyle === 'none' ? 1 : 3}
              className="ad-preview"
              onClick={() => {
                // Deselect when clicking on the Paper background
                // Block clicks stop propagation, so this only fires for background clicks
                setSelectedBlockId(null)
              }}
              sx={{
                width: adWidthPx,
                minHeight: 200,
                border: BORDER_STYLE_MAP[borderStyle],
                borderRadius: `${CORNER_STYLE_MAP[cornerStyle]}px`,
                boxShadow: borderStyle === 'none' ? 1 : 3,
                p: `${PADDING_MAP[adPadding]}px`,
                boxSizing: 'border-box',
                position: 'relative',
                transition: 'width 0.2s, border 0.2s, border-radius 0.2s, padding 0.2s',
                cursor: 'default',
              }}
            >
              {blocks.length === 0 && (
                <Box className="empty-state">
                  <Typography color="text.secondary" variant="body2">
                    Add text or images to start building your classified ad.
                  </Typography>
                </Box>
              )}
              {blocks.map((block, index) =>
                block.type === 'text' ? (
                  <Box
                    key={block.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedBlockId(block.id)
                      setSidebarTab(1)
                    }}
                    className={`block-text ${selectedBlockId === block.id ? 'selected' : ''}`}
                    sx={{
                      mt: index === 0 ? 0 : 0, // No top margin - padding comes from Paper
                      mb: 0, // No bottom margin
                      px: block.highlight && block.highlight !== 'none' ? 0.5 : 0,
                      py: block.highlight && block.highlight !== 'none' ? 0.25 : 0,
                      fontWeight: block.bold ? 'bold' : 'normal',
                      fontStyle: block.italic ? 'italic' : 'normal',
                      textDecoration: block.underline ? 'underline' : 'none',
                      fontSize: block.fontSize || TEXT_SIZE_MAP[block.size || 'medium'],
                      fontFamily: FONT_MAP[block.font || 'serif'],
                      textAlign: block.alignment || 'left',
                      color: HIGHLIGHT_STYLE_MAP[block.highlight || 'none'].color,
                      backgroundColor: HIGHLIGHT_STYLE_MAP[block.highlight || 'none'].backgroundColor,
                      lineHeight: 1.4,
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    {block.text}
                  </Box>
                ) : (
                  <Box
                    key={block.id}
                    data-block-id={block.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedBlockId(block.id)
                      setSidebarTab(1)
                    }}
                    className={`block-image ${selectedBlockId === block.id ? 'selected' : ''}`}
                    sx={{
                      mt: 0, // No top margin
                      mb: 0, // No bottom margin
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <img
                      src={block.src}
                      alt="Ad"
                      crossOrigin="anonymous"
                      loading="eager"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                        margin: 0,
                        padding: 0,
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', block.src)
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </Box>
                )
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default App
