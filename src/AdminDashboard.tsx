import { useState, useEffect } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { generateClient } from 'aws-amplify/api'
import { fetchAuthSession } from 'aws-amplify/auth'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Badge,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Collapse,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block'
import ArchiveIcon from '@mui/icons-material/Archive'
import MessageIcon from '@mui/icons-material/Message'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import ContactsIcon from '@mui/icons-material/Contacts'
import MailIcon from '@mui/icons-material/Mail'
import SaveIcon from '@mui/icons-material/Save'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import { getUrl } from 'aws-amplify/storage'
import MessagesDialog from './MessagesDialog'
import { updateUser } from './graphql/mutations'
import JSZip from 'jszip'

// GraphQL queries and mutations (these will need to be generated after amplify push)
const listAdsQuery = /* GraphQL */ `
  query ListAds($filter: ModelAdFilterInput) {
    listAds(filter: $filter) {
      items {
        id
        title
        owner
        status
        approved
        approvedAt
        approvedBy
        productName
        totalPrice
        widthInches
        pdfKey
        createdAt
        updatedAt
      }
    }
  }
`

const updateAdMutation = /* GraphQL */ `
  mutation UpdateAd($input: UpdateAdInput!) {
    updateAd(input: $input) {
      id
      approved
      approvedAt
      approvedBy
      status
    }
  }
`

const deleteAdMutation = /* GraphQL */ `
  mutation DeleteAd($input: DeleteAdInput!) {
    deleteAd(input: $input) {
      id
    }
  }
`

const listUsersQuery = /* GraphQL */ `
  query ListUsers {
    listUsers {
      items {
        id
        email
        isAdmin
        isBlocked
        contactName
        createdAt
      }
    }
  }
`

const updateUserMutation = /* GraphQL */ `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      isAdmin
      isBlocked
    }
  }
`

const deleteUserMutation = /* GraphQL */ `
  mutation DeleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input) {
      id
    }
  }
`

const listProductsQuery = /* GraphQL */ `
  query ListProducts {
    listProducts {
      items {
        id
        name
        widthInches
        basePrice
        isArchived
        createdAt
      }
    }
  }
`

const createProductMutation = /* GraphQL */ `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      widthInches
      basePrice
      isArchived
    }
  }
`

const updateProductMutation = /* GraphQL */ `
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      name
      widthInches
      basePrice
      isArchived
    }
  }
`

const deleteProductMutation = /* GraphQL */ `
  mutation DeleteProduct($input: DeleteProductInput!) {
    deleteProduct(input: $input) {
      id
    }
  }
`

const listPlacementsQuery = /* GraphQL */ `
  query ListPlacements($filter: ModelPlacementFilterInput) {
    listPlacements(filter: $filter) {
      items {
        id
        productId
        name
        description
        addonFee
        isArchived
      }
    }
  }
`

const createPlacementMutation = /* GraphQL */ `
  mutation CreatePlacement($input: CreatePlacementInput!) {
    createPlacement(input: $input) {
      id
      productId
      name
      description
      addonFee
      isArchived
    }
  }
`

const updatePlacementMutation = /* GraphQL */ `
  mutation UpdatePlacement($input: UpdatePlacementInput!) {
    updatePlacement(input: $input) {
      id
      productId
      name
      description
      addonFee
      isArchived
    }
  }
`

const deletePlacementMutation = /* GraphQL */ `
  mutation DeletePlacement($input: DeletePlacementInput!) {
    deletePlacement(input: $input) {
      id
    }
  }
`

const listPricingSettingsQuery = /* GraphQL */ `
  query ListPricingSettings {
    listPricingSettings {
      items {
        id
        key
        value
        label
        description
      }
    }
  }
`

const createPricingSettingMutation = /* GraphQL */ `
  mutation CreatePricingSetting($input: CreatePricingSettingInput!) {
    createPricingSetting(input: $input) {
      id
      key
      value
      label
      description
    }
  }
`

const updatePricingSettingMutation = /* GraphQL */ `
  mutation UpdatePricingSetting($input: UpdatePricingSettingInput!) {
    updatePricingSetting(input: $input) {
      id
      key
      value
    }
  }
`

const createMessageMutation = /* GraphQL */ `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
    }
  }
`

const getUserQuery = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
    }
  }
`

interface Ad {
  id: string
  title: string
  owner: string
  status: string
  approved: boolean
  approvedAt?: string
  approvedBy?: string
  productName?: string
  totalPrice?: number
  widthInches?: number
  pdfKey?: string
  createdAt?: string
}

interface User {
  id: string
  email: string
  isAdmin: boolean
  isBlocked: boolean
  contactName?: string
  createdAt?: string
}

interface Product {
  id: string
  name: string
  widthInches: number
  basePrice: number
  isArchived: boolean
}

interface PricingSetting {
  id: string
  key: string
  value: number
  label: string
  description?: string
}

interface Placement {
  id: string
  productId: string
  name: string
  description?: string
  addonFee: number
  isArchived: boolean
}

interface AdminDashboardProps {
  onBack: () => void
  initialAdFilter?: string // Ad ID to filter by
}

// User Row Component for ad count loading
interface UserRowProps {
  user: User
  selected: boolean
  onSelect: () => void
  onToggleAdmin: () => void
  onToggleBlock: () => void
  onMessage: () => void
  onDelete: () => void
  getUserAdCount: (userId: string) => Promise<number>
}

function UserRow({ user, selected, onSelect, onToggleAdmin, onToggleBlock, onMessage, onDelete, getUserAdCount }: UserRowProps) {
  const [adCount, setAdCount] = useState<number | null>(null)
  
  useEffect(() => {
    getUserAdCount(user.id).then(setAdCount)
  }, [user.id, getUserAdCount])
  
  return (
    <TableRow selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={onSelect} />
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.contactName || '-'}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          {user.isAdmin && <Chip size="small" label="Admin" color="primary" />}
          {user.isBlocked && <Chip size="small" label="Blocked" color="error" />}
        </Stack>
      </TableCell>
      <TableCell>{adCount !== null ? adCount : '...'}</TableCell>
      <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Toggle admin status. Grants or removes admin privileges for this user.">
            <FormControlLabel
              control={<Switch size="small" checked={user.isAdmin} onChange={onToggleAdmin} />}
              label="Admin"
              labelPlacement="start"
            />
          </Tooltip>
          <Tooltip title="Toggle block status. Blocks or unblocks this user's access to the system.">
            <IconButton size="small" onClick={onToggleBlock} color={user.isBlocked ? 'default' : 'warning'}>
              <BlockIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send message. Opens message dialog to send a message to this user.">
            <IconButton size="small" onClick={onMessage}>
              <MessageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete user. Permanently removes this user from the system.">
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

export default function AdminDashboard({ onBack, initialAdFilter }: AdminDashboardProps) {
  const client = generateClient()
  const { user, signOut } = useAuthenticator()
  
  const [activeTab, setActiveTab] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success'
  })
  
  // Data states
  const [ads, setAds] = useState<Ad[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [pricingSettings, setPricingSettings] = useState<PricingSetting[]>([])
  
  // Selection states
  const [selectedAds, setSelectedAds] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Status menu anchor for individual ad status changes
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ element: HTMLElement; adId: string } | null>(null)
  
  // Filter states
  const [adStatusFilter, setAdStatusFilter] = useState<'PENDING_APPROVAL' | 'APPROVED' | 'NOT_APPROVED' | 'PUBLISHED' | 'ARCHIVED'>('PENDING_APPROVAL')
  const [adIdSearch, setAdIdSearch] = useState<string>('')
  const [userNameFilter, setUserNameFilter] = useState('')
  const [userEmailFilter, setUserEmailFilter] = useState('')
  const [userAdminFilter, setUserAdminFilter] = useState<'all' | 'admin' | 'user'>('all')
  
  // Pricing matrix product selection
  const [selectedPricingProduct, setSelectedPricingProduct] = useState<string>('')
  
  // Local state for pricing values (before saving)
  const [localPricingValues, setLocalPricingValues] = useState<Record<string, string>>({})
  const [localBasePrice, setLocalBasePrice] = useState<string>('')
  
  // Dialog states
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState<User | null>(null)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({ name: '', widthInches: 3, basePrice: 25 })

  // Placement state
  const [placements, setPlacements] = useState<Placement[]>([])
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [placementForm, setPlacementForm] = useState({ name: '', description: '', addonFee: 0 })
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null)
  const [addingPlacementForProductId, setAddingPlacementForProductId] = useState<string | null>(null)
  
  // User menu and account states
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [showMessagesDialog, setShowMessagesDialog] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  // Initialize ad ID search from initialAdFilter and switch to PENDING_APPROVAL
  useEffect(() => {
    if (initialAdFilter) {
      setAdIdSearch(initialAdFilter)
      setAdStatusFilter('PENDING_APPROVAL')
    }
  }, [initialAdFilter])

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 0) loadAds(adIdSearch || initialAdFilter)
    else if (activeTab === 1) loadUsers()
    else if (activeTab === 2) loadProducts()
    else if (activeTab === 3) loadPricingSettings()
  }, [activeTab, initialAdFilter, adIdSearch])

  const loadAds = async (adIdFilter?: string) => {
    setIsLoading(true)
    try {
      const filter: any = {}
      if (adIdFilter) {
        // When searching by ad ID, filter by ID only (ignore status filter)
        filter.id = { eq: adIdFilter }
      } else {
        // Apply status filter - filter by status field directly
        if (adStatusFilter === 'PENDING_APPROVAL') {
          filter.status = { eq: 'PENDING_APPROVAL' }
        } else if (adStatusFilter === 'APPROVED') {
          filter.status = { eq: 'APPROVED' }
        } else if (adStatusFilter === 'NOT_APPROVED') {
          filter.status = { eq: 'NOT_APPROVED' }
        } else if (adStatusFilter === 'PUBLISHED') {
          filter.status = { eq: 'PUBLISHED' }
        } else if (adStatusFilter === 'ARCHIVED') {
          filter.status = { eq: 'ARCHIVED' }
        }
        // If no filter matches, load all ads (no filter applied)
      }
      const result = await client.graphql({
        query: listAdsQuery,
        variables: { filter: Object.keys(filter).length > 0 ? filter : undefined },
        authMode: 'userPool'
      }) as { data: { listAds: { items: Ad[] } } }
      
      let filteredAds = result.data.listAds.items || []
      
      // Ensure all ads have a status (default to DRAFT if missing)
      filteredAds = filteredAds.map(ad => ({
        ...ad,
        status: ad.status || 'DRAFT'
      }))
      
      setAds(filteredAds)
      setSelectedAds([]) // Clear selection when loading new ads
    } catch (error) {
      console.error('Error loading ads:', error)
      setSnackbar({ open: true, message: 'Failed to load ads', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Reload ads when filter or search changes
  useEffect(() => {
    if (activeTab === 0) {
      if (adIdSearch) {
        loadAds(adIdSearch)
      } else {
        loadAds()
      }
    }
  }, [adStatusFilter, activeTab, adIdSearch])
  
  // Reload users when filters change
  useEffect(() => {
    if (activeTab === 1) {
      // Users are already loaded, filtering is done client-side
    }
  }, [userNameFilter, userEmailFilter, userAdminFilter, activeTab])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const result = await client.graphql({
        query: listUsersQuery,
        authMode: 'userPool'
      }) as { data: { listUsers: { items: User[] } } }
      const users = result.data.listUsers.items || []
      console.log('Loaded users:', users.length, users)
      setUsers(users)
      setSelectedUsers([]) // Clear selection when loading
    } catch (error: any) {
      console.error('Error loading users:', {
        error: error.errors || error.message || error,
        fullError: error
      })
      setSnackbar({ 
        open: true, 
        message: `Failed to load users: ${error.errors?.[0]?.message || error.message || 'Unknown error'}`,
        severity: 'error' 
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Get ad count for a user
  const getUserAdCount = async (userId: string): Promise<number> => {
    try {
      const result = await client.graphql({
        query: listAdsQuery,
        variables: { filter: { owner: { eq: userId } } },
        authMode: 'userPool'
      }) as { data: { listAds: { items: Ad[] } } }
      return result.data.listAds.items?.length || 0
    } catch (error) {
      console.error('Error getting ad count:', error)
      return 0
    }
  }
  
  // Filter users based on search criteria
  const getFilteredUsers = () => {
    return users.filter(user => {
      const nameMatch = !userNameFilter || (user.contactName?.toLowerCase().includes(userNameFilter.toLowerCase()) || user.email.toLowerCase().includes(userNameFilter.toLowerCase()))
      const emailMatch = !userEmailFilter || user.email.toLowerCase().includes(userEmailFilter.toLowerCase())
      const adminMatch = userAdminFilter === 'all' || 
                        (userAdminFilter === 'admin' && user.isAdmin) ||
                        (userAdminFilter === 'user' && !user.isAdmin)
      return nameMatch && emailMatch && adminMatch
    })
  }
  
  const handleSelectAllUsers = () => {
    const filtered = getFilteredUsers()
    if (selectedUsers.length === filtered.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filtered.map(u => u.id))
    }
  }
  
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }
  
  const handleMessageUser = (userItem: User) => {
    setMessageRecipient(userItem)
    setMessageSubject('')
    setMessageBody('')
    setMessageDialogOpen(true)
  }
  
  // Bulk actions for users
  const handleBulkToggleAdmin = async () => {
    try {
      const filteredUsers = users.filter(u => selectedUsers.includes(u.id))
      const shouldBeAdmin = filteredUsers.some(u => !u.isAdmin) // If any is not admin, make all admin
      
      // Update database for all selected users
      await Promise.all(selectedUsers.map(userId => {
        const user = users.find(u => u.id === userId)
        if (!user) return Promise.resolve()
        
        return client.graphql({
          query: updateUserMutation,
          variables: {
            input: {
              id: userId,
              isAdmin: shouldBeAdmin
            }
          },
          authMode: 'userPool'
        })
      }))
      
      // Update Cognito groups for all selected users
      try {
        const session = await fetchAuthSession()
        const credentials = session.credentials
        const region = session.tokens?.idToken?.payload?.iss?.split('.')[2]?.split('/')[0] || 'us-east-1'
        
        const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } = await import('@aws-sdk/client-cognito-identity-provider')
        
        const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
        if (!userPoolId) {
          throw new Error('Missing VITE_COGNITO_USER_POOL_ID for admin operations.')
        }
        
        const cognitoClient = new CognitoIdentityProviderClient({
          region,
          credentials: credentials ? {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
          } : undefined
        })
        
        // Update Cognito groups for each user
        await Promise.all(selectedUsers.map(userId => {
          const user = users.find(u => u.id === userId)
          if (!user) return Promise.resolve()
          
          const username = user.email
          if (shouldBeAdmin) {
            return cognitoClient.send(new AdminAddUserToGroupCommand({
              UserPoolId: userPoolId,
              Username: username,
              GroupName: 'admin'
            }))
          } else {
            return cognitoClient.send(new AdminRemoveUserFromGroupCommand({
              UserPoolId: userPoolId,
              Username: username,
              GroupName: 'admin'
            }))
          }
        }))
        
        setSnackbar({ open: true, message: `${selectedUsers.length} users updated (database and Cognito groups)`, severity: 'success' })
      } catch (cognitoError: any) {
        console.error('Error updating Cognito groups:', cognitoError)
        setSnackbar({ 
          open: true, 
          message: `Database updated for ${selectedUsers.length} users, but Cognito group updates failed. Please update groups manually in AWS Console.`,
          severity: 'warning' 
        })
      }
      
      setSelectedUsers([])
      loadUsers()
    } catch (error: any) {
      console.error('Error bulk updating users:', error)
      setSnackbar({ open: true, message: `Failed to update users: ${error.message || 'Unknown error'}`, severity: 'error' })
    }
  }
  
  const handleBulkToggleBlock = async () => {
    try {
      const filteredUsers = users.filter(u => selectedUsers.includes(u.id))
      const shouldBeBlocked = filteredUsers.some(u => !u.isBlocked) // If any is not blocked, block all
      
      await Promise.all(selectedUsers.map(userId => {
        return client.graphql({
          query: updateUserMutation,
          variables: {
            input: {
              id: userId,
              isBlocked: shouldBeBlocked
            }
          },
          authMode: 'userPool'
        })
      }))
      setSnackbar({ open: true, message: `${selectedUsers.length} users updated`, severity: 'success' })
      setSelectedUsers([])
      loadUsers()
    } catch (error) {
      console.error('Error bulk updating users:', error)
      setSnackbar({ open: true, message: 'Failed to update users', severity: 'error' })
    }
  }
  
  const handleBulkMessageUsers = async () => {
    if (selectedUsers.length === 0) return
    const firstUser = users.find(u => u.id === selectedUsers[0])
    if (firstUser) {
      setMessageRecipient(firstUser)
      setMessageSubject('')
      setMessageBody(`This message is being sent to ${selectedUsers.length} user(s).`)
      setMessageDialogOpen(true)
    }
  }

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const result = await client.graphql({
        query: listProductsQuery,
        authMode: 'userPool'
      }) as { data: { listProducts: { items: Product[] } } }
      const loadedProducts = result.data.listProducts.items || []
      setProducts(loadedProducts)
      // Set default selected product if none selected and products exist (only non-archived products)
      const activeProducts = loadedProducts.filter(p => !p.isArchived)
      if (!selectedPricingProduct && activeProducts.length > 0) {
        setSelectedPricingProduct(activeProducts[0].id)
      } else if (selectedPricingProduct) {
        // Check if selected product still exists and is not archived
        const selectedProduct = loadedProducts.find(p => p.id === selectedPricingProduct)
        if (!selectedProduct || selectedProduct.isArchived) {
          // Reset to first active product if selected product is archived or doesn't exist
          if (activeProducts.length > 0) {
            setSelectedPricingProduct(activeProducts[0].id)
          } else {
            setSelectedPricingProduct('')
          }
        }
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setSnackbar({ open: true, message: 'Failed to load products', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPricingSettings = async () => {
    setIsLoading(true)
    try {
      const result = await client.graphql({
        query: listPricingSettingsQuery,
        authMode: 'userPool'
      }) as { data: { listPricingSettings: { items: PricingSetting[] } } }
      const settings = result.data.listPricingSettings.items || []
      setPricingSettings(settings)
      
      // Initialize local pricing values from loaded settings
      const localValues: Record<string, string> = {}
      settings.forEach(setting => {
        localValues[setting.key] = setting.value.toFixed(2)
      })
      setLocalPricingValues(localValues)
      
      // Initialize base price
      if (selectedPricingProduct) {
        const product = products.find(p => p.id === selectedPricingProduct)
        if (product) {
          setLocalBasePrice(product.basePrice.toFixed(2))
        }
      }
    } catch (error) {
      console.error('Error loading pricing settings:', error)
      setSnackbar({ open: true, message: 'Failed to load pricing', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Validate currency input (numbers only, max 2 decimal places)
  const validateCurrencyInput = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    let cleaned = value.replace(/[^\d.]/g, '')
    
    // Only allow one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2)
    }
    
    return cleaned
  }
  
  // Save all pricing values
  const handleSaveAllPricing = async () => {
    if (!selectedPricingProduct) {
      setSnackbar({ open: true, message: 'Please select a product first', severity: 'warning' })
      return
    }
    
    setIsLoading(true)
    try {
      // Save base price
      const product = products.find(p => p.id === selectedPricingProduct)
      if (product && localBasePrice !== '') {
        await client.graphql({
          query: updateProductMutation,
          variables: {
            input: {
              id: product.id,
              basePrice: parseFloat(localBasePrice) || 0
            }
          },
          authMode: 'userPool'
        })
      }
      
      // Save all pricing settings
      const savePromises: Promise<any>[] = []
      
      // Get all pricing keys that should exist for this product
      const pricingKeys = [
        `pricePerDay_${selectedPricingProduct}`,
        `pricePerWord_${selectedPricingProduct}`,
        `pricePerLine_${selectedPricingProduct}`,
        `pricePerImage_${selectedPricingProduct}`,
        ...['none', 'thin', 'thick', 'dashed'].map(t => `border_${t}_${selectedPricingProduct}`),
        ...['flat', 'rounded'].map(t => `corner_${t}_${selectedPricingProduct}`),
        ...['none', 'medium', 'large'].map(t => `padding_${t}_${selectedPricingProduct}`),
        ...['pricePerBold', 'pricePerItalic', 'pricePerUnderline'].map(k => `${k}_${selectedPricingProduct}`),
        ...['left', 'center', 'right', 'justify'].map(t => `alignment_${t}_${selectedPricingProduct}`),
        ...['small', 'medium', 'large'].map(t => `size_${t}_${selectedPricingProduct}`),
        ...['serif', 'sans-serif'].map(t => `font_${t}_${selectedPricingProduct}`),
        ...['none', 'black', 'gray'].map(t => `highlight_${t}_${selectedPricingProduct}`),
      ]
      
      pricingKeys.forEach(key => {
        const value = localPricingValues[key] || '0.00'
        const numValue = parseFloat(value) || 0
        const setting = pricingSettings.find(s => s.key === key)
        
        // Extract label and description from key
        const parts = key.split('_')
        let label = parts[0]
        let description = `Pricing for ${key}`
        
        if (parts[0] === 'pricePer') {
          label = `Price Per ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`
          description = `Price per ${parts[1]}`
        } else if (parts.length > 1) {
          label = `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`
          description = `Price for ${parts[1]} ${parts[0]}`
        }
        
        if (setting) {
          // Update existing setting
          savePromises.push(
            client.graphql({
              query: updatePricingSettingMutation,
              variables: {
                input: {
                  id: setting.id,
                  value: numValue
                }
              },
              authMode: 'userPool'
            }) as Promise<any>
          )
        } else {
          // Create new setting
          savePromises.push(
            client.graphql({
              query: createPricingSettingMutation,
              variables: {
                input: {
                  key,
                  value: numValue,
                  label,
                  description
                }
              },
              authMode: 'userPool'
            }) as Promise<any>
          )
        }
      })
      
      await Promise.all(savePromises)
      
      setSnackbar({ open: true, message: 'All pricing saved successfully', severity: 'success' })
      await loadProducts()
      await loadPricingSettings()
    } catch (error) {
      console.error('Error saving pricing:', error)
      setSnackbar({ open: true, message: 'Failed to save pricing', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessageToAdOwner = async (adOwnerId: string, adTitle: string, status: 'APPROVED' | 'NOT_APPROVED' | 'PUBLISHED') => {
    try {
      // Get owner email
      const userResult = await client.graphql({
        query: getUserQuery,
        variables: { id: adOwnerId },
        authMode: 'userPool'
      }) as { data: { getUser: { id: string; email: string } | null } }
      
      if (userResult.data?.getUser) {
        const statusMessages = {
          'APPROVED': 'has been approved',
          'NOT_APPROVED': 'has been not approved',
          'PUBLISHED': 'has been published'
        }
        
        await client.graphql({
          query: createMessageMutation,
          variables: {
            input: {
              senderId: user?.userId || '',
              senderEmail: user?.signInDetails?.loginId || 'Admin',
              recipientId: userResult.data.getUser.id,
              recipientEmail: userResult.data.getUser.email,
              subject: `Ad "${adTitle}" ${statusMessages[status]}`,
              body: `Your ad "${adTitle}" ${statusMessages[status]}.`,
              read: false
            }
          },
          authMode: 'userPool'
        })
      }
    } catch (error) {
      console.error('Error sending message to ad owner:', error)
    }
  }

  const handleApproveAd = async (ad: Ad) => {
    try {
      await client.graphql({
        query: updateAdMutation,
        variables: {
          input: {
            id: ad.id,
            approved: true,
            approvedAt: new Date().toISOString(),
            approvedBy: user?.signInDetails?.loginId,
            status: 'APPROVED'
          }
        },
        authMode: 'userPool'
      })
      
      // Send message to ad owner
      await sendMessageToAdOwner(ad.owner, ad.title, 'APPROVED')
      
      setSnackbar({ open: true, message: 'Ad approved', severity: 'success' })
      loadAds()
    } catch (error) {
      console.error('Error approving ad:', error)
      setSnackbar({ open: true, message: 'Failed to approve ad', severity: 'error' })
    }
  }

  const handleRejectAd = async (ad: Ad) => {
    try {
      await client.graphql({
        query: updateAdMutation,
        variables: {
          input: {
            id: ad.id,
            approved: false,
            status: 'NOT_APPROVED'
          }
        },
        authMode: 'userPool'
      })
      
      // Send message to ad owner
      await sendMessageToAdOwner(ad.owner, ad.title, 'NOT_APPROVED')
      
      setSnackbar({ open: true, message: 'Ad rejected', severity: 'success' })
      loadAds()
    } catch (error) {
      console.error('Error rejecting ad:', error)
      setSnackbar({ open: true, message: 'Failed to reject ad', severity: 'error' })
    }
  }
  
  const handlePublishAd = async (ad: Ad) => {
    try {
      await client.graphql({
        query: updateAdMutation,
        variables: {
          input: {
            id: ad.id,
            status: 'PUBLISHED',
            approved: true
          }
        },
        authMode: 'userPool'
      })
      
      // Send message to ad owner
      await sendMessageToAdOwner(ad.owner, ad.title, 'PUBLISHED')
      
      setSnackbar({ open: true, message: 'Ad published', severity: 'success' })
      loadAds()
    } catch (error) {
      console.error('Error publishing ad:', error)
      setSnackbar({ open: true, message: 'Failed to publish ad', severity: 'error' })
    }
  }

  const handleUnpublishAd = async (ad: Ad) => {
    try {
      await client.graphql({
        query: updateAdMutation,
        variables: {
          input: {
            id: ad.id,
            status: 'APPROVED' // Unpublish back to approved
          }
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Ad unpublished', severity: 'success' })
      loadAds()
    } catch (error) {
      console.error('Error unpublishing ad:', error)
      setSnackbar({ open: true, message: 'Failed to unpublish ad', severity: 'error' })
    }
  }

  const handleArchiveAd = async (ad: Ad) => {
    try {
      await client.graphql({
        query: updateAdMutation,
        variables: {
          input: {
            id: ad.id,
            status: 'ARCHIVED'
          }
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Ad archived', severity: 'success' })
      loadAds()
    } catch (error) {
      console.error('Error archiving ad:', error)
      setSnackbar({ open: true, message: 'Failed to archive ad', severity: 'error' })
    }
  }

  const handleStatusChange = async (ad: Ad, newStatus: string) => {
    setStatusMenuAnchor(null) // Close menu
    try {
      const updateInput: any = {
        id: ad.id,
        status: newStatus
      }
      
      // Set approved flag based on status
      if (newStatus === 'APPROVED') {
        updateInput.approved = true
        updateInput.approvedAt = new Date().toISOString()
        updateInput.approvedBy = user?.signInDetails?.loginId
      } else if (newStatus === 'NOT_APPROVED') {
        updateInput.approved = false
      } else if (newStatus === 'PUBLISHED') {
        updateInput.approved = true
      }
      
      await client.graphql({
        query: updateAdMutation,
        variables: {
          input: updateInput
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: `Ad status changed to ${newStatus.replace('_', ' ')}`, severity: 'success' })
      loadAds()
    } catch (error) {
      console.error('Error changing ad status:', error)
      setSnackbar({ open: true, message: 'Failed to change ad status', severity: 'error' })
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const adsToUpdate = selectedAds.map(adId => ads.find(a => a.id === adId)).filter((ad): ad is Ad => ad !== undefined)
      
      await Promise.all(adsToUpdate.map(ad => {
        const updateInput: any = {
          id: ad.id,
          status: newStatus
        }
        
        // Set approved flag based on status
        if (newStatus === 'APPROVED') {
          updateInput.approved = true
          updateInput.approvedAt = new Date().toISOString()
          updateInput.approvedBy = user?.signInDetails?.loginId
        } else if (newStatus === 'NOT_APPROVED') {
          updateInput.approved = false
        } else if (newStatus === 'PUBLISHED') {
          updateInput.approved = true
        }
        
        return client.graphql({
          query: updateAdMutation,
          variables: {
            input: updateInput
          },
          authMode: 'userPool'
        })
      }))
      
      // Send messages to ad owners if status is APPROVED, NOT_APPROVED, or PUBLISHED
      if (newStatus === 'APPROVED' || newStatus === 'NOT_APPROVED' || newStatus === 'PUBLISHED') {
        await Promise.all(adsToUpdate.map(ad => 
          sendMessageToAdOwner(ad.owner, ad.title, newStatus as 'APPROVED' | 'NOT_APPROVED' | 'PUBLISHED')
        ))
      }
      
      setSnackbar({ open: true, message: `${selectedAds.length} ad(s) status changed to ${newStatus.replace('_', ' ')}`, severity: 'success' })
      setSelectedAds([])
      loadAds()
    } catch (error) {
      console.error('Error bulk changing ad status:', error)
      setSnackbar({ open: true, message: 'Failed to change ad status', severity: 'error' })
    }
  }

  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, adId: string) => {
    setStatusMenuAnchor({ element: event.currentTarget, adId })
  }

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null)
  }
  
  const handleDeleteAd = async (ad: Ad) => {
    if (!confirm(`Delete "${ad.title}"?`)) return
    try {
      await client.graphql({
        query: deleteAdMutation,
        variables: { input: { id: ad.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Ad deleted', severity: 'success' })
      loadAds()
    } catch (error) {
      console.error('Error deleting ad:', error)
      setSnackbar({ open: true, message: 'Failed to delete ad', severity: 'error' })
    }
  }
  
  const handleSelectAllAds = () => {
    if (selectedAds.length === ads.length) {
      setSelectedAds([])
    } else {
      setSelectedAds(ads.map(ad => ad.id))
    }
  }
  
  const handleSelectAd = (adId: string) => {
    if (selectedAds.includes(adId)) {
      setSelectedAds(selectedAds.filter(id => id !== adId))
    } else {
      setSelectedAds([...selectedAds, adId])
    }
  }
  
  // Bulk actions for ads
  const handleBulkApproveAds = async () => {
    try {
      const adsToApprove = selectedAds.map(adId => ads.find(a => a.id === adId)).filter((ad): ad is Ad => ad !== undefined)
      
      await Promise.all(adsToApprove.map(ad => {
        return client.graphql({
          query: updateAdMutation,
          variables: {
            input: {
              id: ad.id,
              approved: true,
              approvedAt: new Date().toISOString(),
              approvedBy: user?.signInDetails?.loginId,
              status: 'APPROVED'
            }
          },
          authMode: 'userPool'
        })
      }))
      
      // Send messages to all ad owners
      await Promise.all(adsToApprove.map(ad => sendMessageToAdOwner(ad.owner, ad.title, 'APPROVED')))
      
      setSnackbar({ open: true, message: `${selectedAds.length} ads approved`, severity: 'success' })
      setSelectedAds([])
      loadAds()
    } catch (error) {
      console.error('Error bulk approving ads:', error)
      setSnackbar({ open: true, message: 'Failed to approve ads', severity: 'error' })
    }
  }
  
  const handleBulkRejectAds = async () => {
    try {
      const adsToReject = selectedAds.map(adId => ads.find(a => a.id === adId)).filter((ad): ad is Ad => ad !== undefined)
      
      await Promise.all(adsToReject.map(ad => {
        return client.graphql({
          query: updateAdMutation,
          variables: {
            input: {
              id: ad.id,
              approved: false,
              status: 'NOT_APPROVED'
            }
          },
          authMode: 'userPool'
        })
      }))
      
      // Send messages to all ad owners
      await Promise.all(adsToReject.map(ad => sendMessageToAdOwner(ad.owner, ad.title, 'NOT_APPROVED')))
      
      setSnackbar({ open: true, message: `${selectedAds.length} ads rejected`, severity: 'success' })
      setSelectedAds([])
      loadAds()
    } catch (error) {
      console.error('Error bulk rejecting ads:', error)
      setSnackbar({ open: true, message: 'Failed to reject ads', severity: 'error' })
    }
  }
  
  const handleBulkPublishAds = async () => {
    try {
      const adsToPublish = selectedAds.map(adId => ads.find(a => a.id === adId)).filter((ad): ad is Ad => ad !== undefined)
      
      await Promise.all(adsToPublish.map(ad => {
        return client.graphql({
          query: updateAdMutation,
          variables: {
            input: {
              id: ad.id,
              status: 'PUBLISHED',
              approved: true
            }
          },
          authMode: 'userPool'
        })
      }))
      
      // Send messages to all ad owners
      await Promise.all(adsToPublish.map(ad => sendMessageToAdOwner(ad.owner, ad.title, 'PUBLISHED')))
      
      setSnackbar({ open: true, message: `${selectedAds.length} ads published`, severity: 'success' })
      setSelectedAds([])
      loadAds()
    } catch (error) {
      console.error('Error bulk publishing ads:', error)
      setSnackbar({ open: true, message: 'Failed to publish ads', severity: 'error' })
    }
  }

  const handleBulkUnpublishAds = async () => {
    try {
      const adsToUnpublish = selectedAds.map(adId => ads.find(a => a.id === adId)).filter((ad): ad is Ad => ad !== undefined)
      
      await Promise.all(adsToUnpublish.map(ad => {
        return client.graphql({
          query: updateAdMutation,
          variables: {
            input: {
              id: ad.id,
              status: 'APPROVED',
              approved: true
            }
          },
          authMode: 'userPool'
        })
      }))
      
      setSnackbar({ open: true, message: `${selectedAds.length} ads unpublished`, severity: 'success' })
      setSelectedAds([])
      loadAds()
    } catch (error) {
      console.error('Error bulk unpublishing ads:', error)
      setSnackbar({ open: true, message: 'Failed to unpublish ads', severity: 'error' })
    }
  }

  const handleBulkArchiveAds = async () => {
    try {
      await Promise.all(selectedAds.map(adId => {
        return client.graphql({
          query: updateAdMutation,
          variables: {
            input: {
              id: adId,
              status: 'ARCHIVED'
            }
          },
          authMode: 'userPool'
        })
      }))
      setSnackbar({ open: true, message: `${selectedAds.length} ads archived`, severity: 'success' })
      setSelectedAds([])
      loadAds()
    } catch (error) {
      console.error('Error bulk archiving ads:', error)
      setSnackbar({ open: true, message: 'Failed to archive ads', severity: 'error' })
    }
  }
  
  const handleBulkDeleteAds = async () => {
    if (!confirm(`Delete ${selectedAds.length} ads?`)) return
    try {
      await Promise.all(selectedAds.map(adId => {
        return client.graphql({
          query: deleteAdMutation,
          variables: { input: { id: adId } },
          authMode: 'userPool'
        })
      }))
      setSnackbar({ open: true, message: `${selectedAds.length} ads deleted`, severity: 'success' })
      setSelectedAds([])
      loadAds()
    } catch (error) {
      console.error('Error bulk deleting ads:', error)
      setSnackbar({ open: true, message: 'Failed to delete ads', severity: 'error' })
    }
  }
  
  const handleBulkMessageAdOwners = async () => {
    const uniqueOwnersSet = new Set(selectedAds.map(adId => {
      const ad = ads.find(a => a.id === adId)
      return ad?.owner
    }).filter(Boolean))
    const uniqueOwners = Array.from(uniqueOwnersSet)
    // uniqueOwners will be used when implementing bulk messaging to multiple owners
    console.log('Unique owners for bulk messaging:', uniqueOwners.length)
    
    setMessageRecipient(null)
    setMessageSubject('Regarding your ads')
    setMessageBody(`You have ${selectedAds.length} ad(s) that require attention.`)
    setMessageDialogOpen(true)
  }

  const handleExportSelectedAds = async () => {
    if (selectedAds.length === 0) {
      setSnackbar({ open: true, message: 'Please select ads to export', severity: 'error' })
      return
    }

    // Filter to only approved ads
    const approvedAds = selectedAds
      .map(adId => ads.find(a => a.id === adId))
      .filter((ad): ad is Ad => ad !== undefined && ad.approved === true)

    if (approvedAds.length === 0) {
      setSnackbar({ open: true, message: 'No approved ads selected. Please select approved ads to export.', severity: 'error' })
      return
    }

    setIsLoading(true)
    try {
      const zip = new JSZip()
      
      // Create CSV with ad information
      const csvRows: string[] = []
      csvRows.push('Title,Owner,Product,Price,Width (inches),Created Date,Approved Date,Approved By,PDF Key')
      
      // Download PDFs and add to zip
      const pdfPromises = approvedAds.map(async (ad) => {
        // Add to CSV
        const csvRow = [
          `"${(ad.title || '').replace(/"/g, '""')}"`,
          `"${(ad.owner || '').replace(/"/g, '""')}"`,
          `"${(ad.productName || '').replace(/"/g, '""')}"`,
          ad.totalPrice?.toFixed(2) || '0.00',
          ad.widthInches?.toString() || '',
          ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : '',
          ad.approvedAt ? new Date(ad.approvedAt).toLocaleDateString() : '',
          `"${(ad.approvedBy || '').replace(/"/g, '""')}"`,
          `"${(ad.pdfKey || '').replace(/"/g, '""')}"`
        ].join(',')
        csvRows.push(csvRow)
        
        // Download PDF if available
        if (ad.pdfKey) {
          try {
            const urlResult = await getUrl({ path: ad.pdfKey })
            const response = await fetch(urlResult.url.toString())
            if (response.ok) {
              const blob = await response.blob()
              const sanitizedTitle = (ad.title || 'ad').replace(/[^a-z0-9]/gi, '-').toLowerCase()
              const pdfFileName = `${sanitizedTitle}-${ad.id.substring(0, 8)}.pdf`
              zip.file(`pdfs/${pdfFileName}`, blob)
            }
          } catch (error) {
            console.error(`Error downloading PDF for ad ${ad.id}:`, error)
            // Continue even if PDF download fails
          }
        }
      })
      
      await Promise.all(pdfPromises)
      
      // Add CSV to zip
      const csvContent = csvRows.join('\n')
      zip.file('ads-export.csv', csvContent)
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Download zip file
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `approved-ads-export-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Set exported ads to published status
      try {
        await Promise.all(approvedAds.map(ad => {
          return client.graphql({
            query: updateAdMutation,
            variables: {
              input: {
                id: ad.id,
                status: 'PUBLISHED',
                approved: true
              }
            },
            authMode: 'userPool'
          })
        }))
      } catch (error) {
        console.error('Error publishing exported ads:', error)
        // Continue even if publishing fails - export was successful
      }
      
      setSnackbar({ open: true, message: `Exported and published ${approvedAds.length} ad(s)`, severity: 'success' })
      setSelectedAds([])
      loadAds() // Reload to show updated status
    } catch (error) {
      console.error('Error exporting ads:', error)
      setSnackbar({ open: true, message: 'Failed to export ads', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPdf = async (ad: Ad) => {
    if (!ad.pdfKey) {
      setSnackbar({ open: true, message: 'No PDF available', severity: 'error' })
      return
    }
    try {
      const urlResult = await getUrl({ path: ad.pdfKey })
      const newWindow = window.open(urlResult.url.toString(), '_blank', 'noopener,noreferrer')
      if (!newWindow) {
        setSnackbar({ open: true, message: 'Please allow popups to view PDF', severity: 'error' })
      }
    } catch (error) {
      console.error('Error getting PDF URL:', error)
      setSnackbar({ open: true, message: 'Failed to open PDF', severity: 'error' })
    }
  }

  const handleToggleAdmin = async (userItem: User) => {
    try {
      const newAdminStatus = !userItem.isAdmin
      
      // Update database first
      await client.graphql({
        query: updateUserMutation,
        variables: {
          input: {
            id: userItem.id,
            isAdmin: newAdminStatus
          }
        },
        authMode: 'userPool'
      })
      
      // Update Cognito group membership
      try {
        const session = await fetchAuthSession()
        const credentials = session.credentials
        const region = session.tokens?.idToken?.payload?.iss?.split('.')[2]?.split('/')[0] || 'us-east-1'
        
        // Import AWS SDK dynamically
        const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } = await import('@aws-sdk/client-cognito-identity-provider')
        
        const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
        if (!userPoolId) {
          throw new Error('Missing VITE_COGNITO_USER_POOL_ID for admin operations.')
        }
        
        const cognitoClient = new CognitoIdentityProviderClient({
          region,
          credentials: credentials ? {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
          } : undefined
        })
        
        // Get username from user email (Cognito uses email as username)
        const username = userItem.email
        
        if (newAdminStatus) {
          // Add user to Admin group
          await cognitoClient.send(new AdminAddUserToGroupCommand({
            UserPoolId: userPoolId,
            Username: username,
            GroupName: 'Admin'
          }))
        } else {
          // Remove user from Admin group
          await cognitoClient.send(new AdminRemoveUserFromGroupCommand({
            UserPoolId: userPoolId,
            Username: username,
            GroupName: 'Admin'
          }))
        }
        
        setSnackbar({ open: true, message: `Admin status updated (Cognito group ${newAdminStatus ? 'added' : 'removed'})`, severity: 'success' })
      } catch (cognitoError: any) {
        console.error('Error updating Cognito group:', cognitoError)
        // Database was updated, but Cognito group update failed
        setSnackbar({ 
          open: true, 
          message: `Database updated, but Cognito group update failed. Please add/remove user manually from Admin group in AWS Console. Error: ${cognitoError.message || 'Unknown error'}`,
          severity: 'warning' 
        })
      }
      
      loadUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      setSnackbar({ open: true, message: `Failed to update user: ${error.message || 'Unknown error'}`, severity: 'error' })
    }
  }

  const handleToggleBlock = async (userItem: User) => {
    try {
      await client.graphql({
        query: updateUserMutation,
        variables: {
          input: {
            id: userItem.id,
            isBlocked: !userItem.isBlocked
          }
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: `User ${userItem.isBlocked ? 'unblocked' : 'blocked'}`, severity: 'success' })
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' })
    }
  }

  const handleDeleteUser = async (userItem: User) => {
    if (!confirm(`Delete user ${userItem.email}?`)) return
    try {
      await client.graphql({
        query: deleteUserMutation,
        variables: { input: { id: userItem.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'User deleted', severity: 'success' })
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' })
    }
  }

  const handleSendMessage = async () => {
    if (!messageRecipient || !messageBody.trim()) return
    try {
      await client.graphql({
        query: createMessageMutation,
        variables: {
          input: {
            senderId: user?.userId,
            senderEmail: user?.signInDetails?.loginId,
            recipientId: messageRecipient.id,
            recipientEmail: messageRecipient.email,
            subject: messageSubject,
            body: messageBody,
            read: false
          }
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Message sent', severity: 'success' })
      setMessageDialogOpen(false)
      setMessageSubject('')
      setMessageBody('')
    } catch (error) {
      console.error('Error sending message:', error)
      setSnackbar({ open: true, message: 'Failed to send message', severity: 'error' })
    }
  }

  const handleSaveProduct = async () => {
    // Validate form
    if (!productForm.name.trim()) {
      setSnackbar({ open: true, message: 'Product name is required', severity: 'error' })
      return
    }
    if (!productForm.widthInches || productForm.widthInches <= 0) {
      setSnackbar({ open: true, message: 'Width must be greater than 0', severity: 'error' })
      return
    }
    if (!productForm.basePrice || productForm.basePrice < 0) {
      setSnackbar({ open: true, message: 'Base price must be 0 or greater', severity: 'error' })
      return
    }

    try {
      if (editingProduct) {
        await client.graphql({
          query: updateProductMutation,
          variables: {
            input: {
              id: editingProduct.id,
              name: productForm.name.trim(),
              widthInches: productForm.widthInches,
              basePrice: productForm.basePrice
            }
          },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' })
      } else {
        const result = await client.graphql({
          query: createProductMutation,
          variables: {
            input: {
              name: productForm.name.trim(),
              widthInches: productForm.widthInches,
              basePrice: productForm.basePrice,
              isArchived: false
            }
          },
          authMode: 'userPool'
        }) as { data: { createProduct: any }, errors?: any[] }
        
        if (result.errors && result.errors.length > 0) {
          throw new Error(result.errors[0].message || 'Failed to create product')
        }
        
        if (!result.data?.createProduct) {
          throw new Error('Product creation returned null - check authorization')
        }
        
        setSnackbar({ open: true, message: 'Product created successfully', severity: 'success' })
      }
      setProductDialogOpen(false)
      setEditingProduct(null)
      setProductForm({ name: '', widthInches: 3, basePrice: 25 })
      loadProducts()
    } catch (error: any) {
      console.error('Error saving product:', error)
      let errorMessage = 'Failed to save product'
      
      if (error?.errors && error.errors.length > 0) {
        const graphqlError = error.errors[0]
        if (graphqlError.errorType === 'Unauthorized') {
          errorMessage = 'Unauthorized: You must be in the Admin Cognito group to create products. Please contact your administrator or run: amplify push (if schema was updated).'
        } else {
          errorMessage = graphqlError.message || errorMessage
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
    }
  }

  const handleArchiveProduct = async (product: Product) => {
    try {
      await client.graphql({
        query: updateProductMutation,
        variables: {
          input: {
            id: product.id,
            isArchived: !product.isArchived
          }
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: `Product ${product.isArchived ? 'restored' : 'archived'}`, severity: 'success' })
      loadProducts()
    } catch (error) {
      console.error('Error archiving product:', error)
      setSnackbar({ open: true, message: 'Failed to archive product', severity: 'error' })
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`)) {
      return
    }
    try {
      await client.graphql({
        query: deleteProductMutation,
        variables: {
          input: {
            id: product.id
          }
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Product deleted', severity: 'success' })
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' })
    }
  }

  const loadPlacements = async (productId: string) => {
    try {
      const result = await client.graphql({
        query: listPlacementsQuery,
        variables: { filter: { productId: { eq: productId } } },
        authMode: 'userPool'
      }) as { data: { listPlacements: { items: Placement[] } } }
      setPlacements(prev => {
        const others = prev.filter(p => p.productId !== productId)
        return [...others, ...result.data.listPlacements.items]
      })
    } catch (error) {
      console.error('Error loading placements:', error)
    }
  }

  const handleToggleProductExpand = (productId: string) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null)
    } else {
      setExpandedProductId(productId)
      loadPlacements(productId)
      setAddingPlacementForProductId(null)
      setEditingPlacement(null)
    }
  }

  const handleSavePlacement = async (productId: string) => {
    try {
      if (editingPlacement) {
        await client.graphql({
          query: updatePlacementMutation,
          variables: {
            input: {
              id: editingPlacement.id,
              name: placementForm.name,
              description: placementForm.description || undefined,
              addonFee: placementForm.addonFee,
            }
          },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Placement updated', severity: 'success' })
      } else {
        await client.graphql({
          query: createPlacementMutation,
          variables: {
            input: {
              productId,
              name: placementForm.name,
              description: placementForm.description || undefined,
              addonFee: placementForm.addonFee,
              isArchived: false,
            }
          },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Placement created', severity: 'success' })
      }
      setEditingPlacement(null)
      setAddingPlacementForProductId(null)
      setPlacementForm({ name: '', description: '', addonFee: 0 })
      loadPlacements(productId)
    } catch (error) {
      console.error('Error saving placement:', error)
      setSnackbar({ open: true, message: 'Failed to save placement', severity: 'error' })
    }
  }

  const handleDeletePlacement = async (placement: Placement) => {
    if (!confirm(`Delete placement "${placement.name}"? This cannot be undone.`)) return
    try {
      await client.graphql({
        query: deletePlacementMutation,
        variables: { input: { id: placement.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Placement deleted', severity: 'success' })
      loadPlacements(placement.productId)
    } catch (error) {
      console.error('Error deleting placement:', error)
      setSnackbar({ open: true, message: 'Failed to delete placement', severity: 'error' })
    }
  }

  const handleArchivePlacement = async (placement: Placement) => {
    try {
      await client.graphql({
        query: updatePlacementMutation,
        variables: { input: { id: placement.id, isArchived: !placement.isArchived } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: placement.isArchived ? 'Placement restored' : 'Placement archived', severity: 'success' })
      loadPlacements(placement.productId)
    } catch (error) {
      console.error('Error archiving placement:', error)
      setSnackbar({ open: true, message: 'Failed to update placement', severity: 'error' })
    }
  }


  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={onBack} edge="start" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
          
          <Tooltip title="Account">
            <IconButton color="inherit" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
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
        <MenuItem onClick={signOut}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
      
      {/* Messages Dialog */}
      <MessagesDialog 
        open={showMessagesDialog} 
        onClose={() => setShowMessagesDialog(false)} 
        unreadCount={unreadMessageCount}
        onUnreadCountChange={setUnreadMessageCount}
        onNavigateToAdmin={(adId) => {
          setAdIdSearch(adId)
          setAdStatusFilter('PENDING_APPROVAL')
          setActiveTab(0) // Switch to ADS tab
          setShowMessagesDialog(false) // Close messages dialog
        }}
      />
      
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
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
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
        </DialogActions>
      </Dialog>
      
      <Box sx={{ pt: 10, px: 3, pb: 3 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
            <Tab label="Ads" />
            <Tab label="Users" />
            <Tab label="Products" />
            <Tab label="Pricing" />
          </Tabs>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Ads Tab */}
            {activeTab === 0 && (
              <Paper>
                {/* Status Filter and Bulk Actions Toolbar */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Status Filter</InputLabel>
                      <Select
                        value={adStatusFilter}
                        label="Status Filter"
                        onChange={(e) => {
                          setAdStatusFilter(e.target.value as 'PENDING_APPROVAL' | 'APPROVED' | 'NOT_APPROVED' | 'PUBLISHED' | 'ARCHIVED')
                          // Clear search when changing status filter
                          if (adIdSearch) {
                            setAdIdSearch('')
                          }
                        }}
                      >
                        <MenuItem value="PENDING_APPROVAL">Pending</MenuItem>
                        <MenuItem value="APPROVED">Approved</MenuItem>
                        <MenuItem value="NOT_APPROVED">Not Approved</MenuItem>
                        <MenuItem value="PUBLISHED">Published</MenuItem>
                        <MenuItem value="ARCHIVED">Archived</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      placeholder="Search by Ad ID"
                      value={adIdSearch}
                      onChange={(e) => setAdIdSearch(e.target.value)}
                      sx={{ minWidth: 200 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: adIdSearch ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setAdIdSearch('')}
                              edge="end"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Stack>
                  <Tooltip title="Refresh ads list">
                    <IconButton onClick={() => loadAds(adIdSearch || initialAdFilter)} disabled={isLoading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {selectedAds.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Change Status</InputLabel>
                        <Select
                          value=""
                          label="Change Status"
                          onChange={(e) => handleBulkStatusChange(e.target.value)}
                          sx={{ fontSize: '0.875rem' }}
                        >
                          <MenuItem value="PENDING_APPROVAL">Pending</MenuItem>
                          <MenuItem value="APPROVED">Approved</MenuItem>
                          <MenuItem value="NOT_APPROVED">Not Approved</MenuItem>
                          <MenuItem value="PUBLISHED">Published</MenuItem>
                          <MenuItem value="ARCHIVED">Archived</MenuItem>
                        </Select>
                      </FormControl>
                      <Tooltip title={`Approve ${selectedAds.length} selected ad(s). Marks ads as approved and ready for publication.`}>
                        <Button size="small" variant="outlined" color="success" startIcon={<CheckIcon />} onClick={handleBulkApproveAds}>
                          Approve ({selectedAds.length})
                        </Button>
                      </Tooltip>
                      <Tooltip title={`Reject ${selectedAds.length} selected ad(s). Marks ads as not approved.`}>
                        <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} onClick={handleBulkRejectAds}>
                          Reject ({selectedAds.length})
                        </Button>
                      </Tooltip>
                      {adStatusFilter === 'APPROVED' && (
                        <Tooltip title={`Publish ${selectedAds.length} selected approved ad(s). Published ads cannot be edited.`}>
                          <Button size="small" variant="outlined" color="success" startIcon={<CheckIcon />} onClick={handleBulkPublishAds}>
                            Publish ({selectedAds.length})
                          </Button>
                        </Tooltip>
                      )}
                      {adStatusFilter === 'PUBLISHED' && (
                        <Tooltip title={`Unpublish ${selectedAds.length} selected published ad(s). Returns ads to approved status.`}>
                          <Button size="small" variant="outlined" color="warning" startIcon={<CloseIcon />} onClick={handleBulkUnpublishAds}>
                            Unpublish ({selectedAds.length})
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip title={`Archive ${selectedAds.length} selected ad(s). Moves ads to archived status for record keeping.`}>
                        <Button size="small" variant="outlined" startIcon={<ArchiveIcon />} onClick={handleBulkArchiveAds}>
                          Archive ({selectedAds.length})
                        </Button>
                      </Tooltip>
                      {adStatusFilter !== 'PUBLISHED' && (
                        <Tooltip title={`Delete ${selectedAds.length} selected ad(s). Permanently removes ads from the system.`}>
                          <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleBulkDeleteAds}>
                            Delete ({selectedAds.length})
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip title={`Send message to owner(s) of ${selectedAds.length} selected ad(s). Opens message dialog to contact ad owners.`}>
                        <Button size="small" variant="outlined" startIcon={<MessageIcon />} onClick={handleBulkMessageAdOwners}>
                          Message Owner ({selectedAds.length})
                        </Button>
                      </Tooltip>
                      {adStatusFilter === 'APPROVED' && (
                        <Tooltip title={`Export ${selectedAds.length} selected approved ad(s) as a zip file containing CSV and PDFs.`}>
                          <span>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="primary" 
                              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />} 
                              onClick={handleExportSelectedAds}
                              disabled={isLoading}
                            >
                              Export ({selectedAds.length})
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                  )}
                </Box>
                
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedAds.length > 0 && selectedAds.length < ads.length}
                          checked={ads.length > 0 && selectedAds.length === ads.length}
                          onChange={handleSelectAllAds}
                        />
                      </TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">No ads found</TableCell>
                      </TableRow>
                    ) : (
                      ads.map(ad => (
                        <TableRow key={ad.id} selected={selectedAds.includes(ad.id)}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedAds.includes(ad.id)}
                              onChange={() => handleSelectAd(ad.id)}
                            />
                          </TableCell>
                          <TableCell>{ad.title}</TableCell>
                          <TableCell>
                            <Box 
                              sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                              }}
                              onClick={(e) => handleStatusMenuOpen(e, ad.id)}
                            >
                              <Chip
                                label={
                                  ad.status === 'PUBLISHED' ? 'Published' : 
                                  ad.status === 'APPROVED' ? 'Approved' : 
                                  ad.status === 'PENDING_APPROVAL' ? 'Pending' : 
                                  ad.status === 'NOT_APPROVED' ? 'Not Approved' : 
                                  ad.status === 'ARCHIVED' ? 'Archived' : 
                                  'Draft'
                                }
                                color={
                                  ad.status === 'PUBLISHED' ? 'success' : 
                                  ad.status === 'APPROVED' ? 'success' : 
                                  ad.status === 'PENDING_APPROVAL' ? 'warning' : 
                                  ad.status === 'NOT_APPROVED' ? 'error' : 
                                  ad.status === 'ARCHIVED' ? 'default' : 
                                  'default'
                                }
                                size="small"
                              />
                              <ArrowDropDownIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            </Box>
                            <Menu
                              anchorEl={statusMenuAnchor?.adId === ad.id ? statusMenuAnchor.element : null}
                              open={statusMenuAnchor?.adId === ad.id}
                              onClose={handleStatusMenuClose}
                            >
                              <MenuItem onClick={() => handleStatusChange(ad, 'PENDING_APPROVAL')}>Pending</MenuItem>
                              <MenuItem onClick={() => handleStatusChange(ad, 'APPROVED')}>Approved</MenuItem>
                              <MenuItem onClick={() => handleStatusChange(ad, 'NOT_APPROVED')}>Not Approved</MenuItem>
                              <MenuItem onClick={() => handleStatusChange(ad, 'PUBLISHED')}>Published</MenuItem>
                              <MenuItem onClick={() => handleStatusChange(ad, 'ARCHIVED')}>Archived</MenuItem>
                            </Menu>
                          </TableCell>
                          <TableCell>{ad.owner}</TableCell>
                          <TableCell>{ad.productName || '-'}</TableCell>
                          <TableCell>
                            {ad.totalPrice != null ? `$${ad.totalPrice.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>{ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : '-'}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                              <Tooltip title="View PDF. Opens the ad PDF in a new window for review.">
                                <span>
                                  <IconButton size="small" onClick={() => handleViewPdf(ad)} disabled={!ad.pdfKey}>
                                    <PictureAsPdfIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              {adStatusFilter === 'APPROVED' && (
                                <Tooltip title="Publish ad. Published ads cannot be edited.">
                                  <IconButton size="small" color="success" onClick={() => handlePublishAd(ad)}>
                                    <CheckIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {adStatusFilter === 'PUBLISHED' && (
                                <>
                                  <Tooltip title="Unpublish ad. Returns ad to approved status.">
                                    <IconButton size="small" color="warning" onClick={() => handleUnpublishAd(ad)}>
                                      <CloseIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Archive ad. Moves this ad to archived status for record keeping.">
                                    <IconButton size="small" onClick={() => handleArchiveAd(ad)}>
                                      <ArchiveIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {adStatusFilter === 'PENDING_APPROVAL' && (
                                <>
                                  <Tooltip title="Approve ad. Marks this ad as approved and ready for publication.">
                                    <IconButton size="small" color="success" onClick={() => handleApproveAd(ad)}>
                                      <CheckIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject ad. Marks this ad as not approved.">
                                    <IconButton size="small" color="error" onClick={() => handleRejectAd(ad)}>
                                      <CloseIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {adStatusFilter !== 'PUBLISHED' && adStatusFilter !== 'PENDING_APPROVAL' && adStatusFilter !== 'APPROVED' && (
                                <Tooltip title="Archive ad. Moves this ad to archived status for record keeping.">
                                  <IconButton size="small" onClick={() => handleArchiveAd(ad)}>
                                    <ArchiveIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {adStatusFilter !== 'PUBLISHED' && (
                                <Tooltip title="Delete ad. Permanently removes this ad from the system.">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteAd(ad)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {/* Users Tab */}
            {activeTab === 1 && (
              <Paper>
                {/* Filters and Bulk Actions Toolbar */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                      <TextField
                        size="small"
                        label="Search Name/Email"
                        value={userNameFilter}
                        onChange={(e) => setUserNameFilter(e.target.value)}
                        sx={{ minWidth: 200 }}
                      />
                      <TextField
                        size="small"
                        label="Filter Email"
                        value={userEmailFilter}
                        onChange={(e) => setUserEmailFilter(e.target.value)}
                        sx={{ minWidth: 200 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Admin Status</InputLabel>
                        <Select
                          value={userAdminFilter}
                          label="Admin Status"
                          onChange={(e) => setUserAdminFilter(e.target.value as 'all' | 'admin' | 'user')}
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="admin">Admin Only</MenuItem>
                          <MenuItem value="user">Users Only</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                    <Tooltip title="Refresh users list">
                      <IconButton onClick={loadUsers} disabled={isLoading}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {selectedUsers.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Tooltip title={`Toggle admin status for ${selectedUsers.length} selected user(s). Grants or removes admin privileges.`}>
                        <Button size="small" variant="outlined" startIcon={<AdminPanelSettingsIcon />} onClick={handleBulkToggleAdmin}>
                          Toggle Admin ({selectedUsers.length})
                        </Button>
                      </Tooltip>
                      <Tooltip title={`Toggle block status for ${selectedUsers.length} selected user(s). Blocks or unblocks user access.`}>
                        <Button size="small" variant="outlined" color="warning" startIcon={<BlockIcon />} onClick={handleBulkToggleBlock}>
                          Toggle Block ({selectedUsers.length})
                        </Button>
                      </Tooltip>
                      <Tooltip title={`Send message to ${selectedUsers.length} selected user(s). Opens message dialog.`}>
                        <Button size="small" variant="outlined" startIcon={<MessageIcon />} onClick={handleBulkMessageUsers}>
                          Message ({selectedUsers.length})
                        </Button>
                      </Tooltip>
                    </Stack>
                  )}
                </Box>
                
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedUsers.length > 0 && selectedUsers.length < getFilteredUsers().length}
                          checked={getFilteredUsers().length > 0 && selectedUsers.length === getFilteredUsers().length}
                          onChange={handleSelectAllUsers}
                        />
                      </TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ad Count</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredUsers().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      getFilteredUsers().map(userItem => (
                        <UserRow
                          key={userItem.id}
                          user={userItem}
                          selected={selectedUsers.includes(userItem.id)}
                          onSelect={() => handleSelectUser(userItem.id)}
                          onToggleAdmin={() => handleToggleAdmin(userItem)}
                          onToggleBlock={() => handleToggleBlock(userItem)}
                          onMessage={() => handleMessageUser(userItem)}
                          onDelete={() => handleDeleteUser(userItem)}
                          getUserAdCount={getUserAdCount}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {/* Products Tab */}
            {activeTab === 2 && (
              <Paper>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Tooltip title="Add new product. Creates a new ad product with configurable width and base price.">
                    <Button variant="contained" onClick={() => { setEditingProduct(null); setProductForm({ name: '', widthInches: 3, basePrice: 25 }); setProductDialogOpen(true) }}>
                      Add Product
                    </Button>
                  </Tooltip>
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 40 }} />
                      <TableCell>Name</TableCell>
                      <TableCell>Width (inches)</TableCell>
                      <TableCell>Base Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No products configured</TableCell>
                      </TableRow>
                    ) : (
                      products.map(product => {
                        const isExpanded = expandedProductId === product.id
                        const productPlacements = placements.filter(p => p.productId === product.id)
                        return (
                          <>
                            <TableRow key={product.id} sx={{ opacity: product.isArchived ? 0.5 : 1 }}>
                              <TableCell sx={{ width: 40, p: 0.5 }}>
                                <IconButton size="small" onClick={() => handleToggleProductExpand(product.id)}>
                                  {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                                </IconButton>
                              </TableCell>
                              <TableCell>{product.name || '-'}</TableCell>
                              <TableCell>{product.widthInches || 0}"</TableCell>
                              <TableCell>${(product.basePrice || 0).toFixed(2)}</TableCell>
                              <TableCell>
                                {product.isArchived ? <Chip size="small" label="Archived" /> : <Chip size="small" label="Active" color="success" />}
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Tooltip title="Edit product">
                                    <IconButton size="small" onClick={() => {
                                      setEditingProduct(product);
                                      setProductForm({
                                        name: product.name || '',
                                        widthInches: product.widthInches || 3,
                                        basePrice: product.basePrice || 0
                                      });
                                      setProductDialogOpen(true);
                                    }}>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={product.isArchived ? "Restore product" : "Archive product"}>
                                    <IconButton size="small" onClick={() => handleArchiveProduct(product)}>
                                      <ArchiveIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete product permanently">
                                    <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product)}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            <TableRow key={`${product.id}-placements`}>
                              <TableCell colSpan={6} sx={{ p: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ bgcolor: 'grey.50', px: 4, py: 2 }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                      <Typography variant="subtitle2" fontWeight={600}>Placements</Typography>
                                      <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => {
                                          setEditingPlacement(null)
                                          setPlacementForm({ name: '', description: '', addonFee: 0 })
                                          setAddingPlacementForProductId(product.id)
                                        }}
                                      >
                                        Add Placement
                                      </Button>
                                    </Stack>

                                    {/* Inline add/edit form */}
                                    {(addingPlacementForProductId === product.id || (editingPlacement && editingPlacement.productId === product.id)) && (
                                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                        <Stack spacing={1.5}>
                                          <TextField
                                            size="small"
                                            label="Name"
                                            value={placementForm.name}
                                            onChange={e => setPlacementForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                          />
                                          <TextField
                                            size="small"
                                            label="Description (optional)"
                                            value={placementForm.description}
                                            onChange={e => setPlacementForm(f => ({ ...f, description: e.target.value }))}
                                          />
                                          <TextField
                                            size="small"
                                            label="Addon Fee ($)"
                                            type="number"
                                            value={placementForm.addonFee}
                                            onChange={e => setPlacementForm(f => ({ ...f, addonFee: parseFloat(e.target.value) || 0 }))}
                                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                          />
                                          <Stack direction="row" spacing={1}>
                                            <Button
                                              size="small"
                                              variant="contained"
                                              disabled={!placementForm.name.trim()}
                                              onClick={() => handleSavePlacement(product.id)}
                                            >
                                              {editingPlacement ? 'Update' : 'Create'}
                                            </Button>
                                            <Button
                                              size="small"
                                              onClick={() => {
                                                setAddingPlacementForProductId(null)
                                                setEditingPlacement(null)
                                                setPlacementForm({ name: '', description: '', addonFee: 0 })
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                          </Stack>
                                        </Stack>
                                      </Paper>
                                    )}

                                    {/* Placements sub-table */}
                                    {productPlacements.length === 0 ? (
                                      <Typography variant="body2" color="text.secondary">No placements yet</Typography>
                                    ) : (
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Addon Fee</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {productPlacements.map(placement => (
                                            <TableRow key={placement.id} sx={{ opacity: placement.isArchived ? 0.5 : 1 }}>
                                              <TableCell>{placement.name}</TableCell>
                                              <TableCell>{placement.description || '-'}</TableCell>
                                              <TableCell>${(placement.addonFee || 0).toFixed(2)}</TableCell>
                                              <TableCell>
                                                {placement.isArchived
                                                  ? <Chip size="small" label="Archived" />
                                                  : <Chip size="small" label="Active" color="success" />}
                                              </TableCell>
                                              <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                  <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => {
                                                      setEditingPlacement(placement)
                                                      setPlacementForm({
                                                        name: placement.name,
                                                        description: placement.description || '',
                                                        addonFee: placement.addonFee,
                                                      })
                                                      setAddingPlacementForProductId(null)
                                                    }}>
                                                      <EditIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title={placement.isArchived ? 'Restore' : 'Archive'}>
                                                    <IconButton size="small" onClick={() => handleArchivePlacement(placement)}>
                                                      <ArchiveIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title="Delete permanently">
                                                    <IconButton size="small" color="error" onClick={() => handleDeletePlacement(placement)}>
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                </Stack>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    )}
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {/* Pricing Tab */}
            {activeTab === 3 && (
              <Paper sx={{ p: 3, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Pricing Matrix</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 250 }}>
                      <InputLabel>Select Product</InputLabel>
                      <Select
                        value={selectedPricingProduct}
                        label="Select Product"
                        onChange={(e) => {
                          setSelectedPricingProduct(e.target.value)
                          setLocalPricingValues({})
                          setLocalBasePrice('')
                          loadPricingSettings()
                        }}
                      >
                        {products.filter(p => !p.isArchived).map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name} ({product.widthInches}" wide)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Tooltip title="Save all pricing values">
                      <IconButton 
                        color="primary" 
                        onClick={handleSaveAllPricing}
                        disabled={!selectedPricingProduct || isLoading}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* Base Price */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Base Price</Typography>
                      <TextField
                        type="text"
                        size="small"
                        fullWidth
                        label="Base price ($)"
                        value={localBasePrice}
                        onChange={(e) => {
                          const validated = validateCurrencyInput(e.target.value)
                          setLocalBasePrice(validated)
                        }}
                        disabled={!selectedPricingProduct}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Base price for this product
                      </Typography>
                    </Paper>
                  </Box>
                  
                  {/* Price Per Day */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Price Per Day</Typography>
                      <TextField
                        type="text"
                        size="small"
                        fullWidth
                        label="Price per day ($)"
                        value={localPricingValues[`pricePerDay_${selectedPricingProduct}`] || '0.00'}
                        onChange={(e) => {
                          const validated = validateCurrencyInput(e.target.value)
                          setLocalPricingValues({
                            ...localPricingValues,
                            [`pricePerDay_${selectedPricingProduct}`]: validated
                          })
                        }}
                        disabled={!selectedPricingProduct}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Additional price charged per day the ad runs
                      </Typography>
                    </Paper>
                  </Box>
                  
                  {/* Border Options */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Border Selection</Typography>
                      <Stack spacing={1}>
                        {['none', 'thin', 'thick', 'dashed'].map(borderType => {
                          return (
                            <Box key={borderType} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{borderType}</Typography>
                              <TextField
                                type="text"
                                size="small"
                                label="Price ($)"
                                value={localPricingValues[`border_${borderType}_${selectedPricingProduct}`] || '0.00'}
                                onChange={(e) => {
                                  const validated = validateCurrencyInput(e.target.value)
                                  setLocalPricingValues({
                                    ...localPricingValues,
                                    [`border_${borderType}_${selectedPricingProduct}`]: validated
                                  })
                                }}
                                sx={{ flex: 1 }}
                                disabled={!selectedPricingProduct}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Corner Options */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Corners</Typography>
                      <Stack spacing={1}>
                        {['flat', 'rounded'].map(cornerType => {
                          return (
                            <Box key={cornerType} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{cornerType}</Typography>
                              <TextField
                                type="text"
                                size="small"
                                label="Price ($)"
                                value={localPricingValues[`corner_${cornerType}_${selectedPricingProduct}`] || '0.00'}
                                onChange={(e) => {
                                  const validated = validateCurrencyInput(e.target.value)
                                  setLocalPricingValues({
                                    ...localPricingValues,
                                    [`corner_${cornerType}_${selectedPricingProduct}`]: validated
                                  })
                                }}
                                sx={{ flex: 1 }}
                                disabled={!selectedPricingProduct}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Padding Options */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Padding</Typography>
                      <Stack spacing={1}>
                        {['none', 'medium', 'large'].map(paddingType => {
                          return (
                            <Box key={paddingType} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{paddingType}</Typography>
                              <TextField
                                type="text"
                                size="small"
                                label="Price ($)"
                                value={localPricingValues[`padding_${paddingType}_${selectedPricingProduct}`] || '0.00'}
                                onChange={(e) => {
                                  const validated = validateCurrencyInput(e.target.value)
                                  setLocalPricingValues({
                                    ...localPricingValues,
                                    [`padding_${paddingType}_${selectedPricingProduct}`]: validated
                                  })
                                }}
                                sx={{ flex: 1 }}
                                disabled={!selectedPricingProduct}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Word Count */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Word Count</Typography>
                      <TextField
                        type="text"
                        size="small"
                        fullWidth
                        label="Price per word ($)"
                        value={localPricingValues[`pricePerWord_${selectedPricingProduct}`] || '0.00'}
                        onChange={(e) => {
                          const validated = validateCurrencyInput(e.target.value)
                          setLocalPricingValues({
                            ...localPricingValues,
                            [`pricePerWord_${selectedPricingProduct}`]: validated
                          })
                        }}
                        disabled={!selectedPricingProduct}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Price charged for each word in text blocks
                      </Typography>
                    </Paper>
                  </Box>
                  
                  {/* Line Count */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Line Count</Typography>
                      <TextField
                        type="text"
                        size="small"
                        fullWidth
                        label="Price per line ($)"
                        value={localPricingValues[`pricePerLine_${selectedPricingProduct}`] || '0.00'}
                        onChange={(e) => {
                          const validated = validateCurrencyInput(e.target.value)
                          setLocalPricingValues({
                            ...localPricingValues,
                            [`pricePerLine_${selectedPricingProduct}`]: validated
                          })
                        }}
                        disabled={!selectedPricingProduct}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Price charged for each line of text
                      </Typography>
                    </Paper>
                  </Box>
                  
                  {/* Text Formatting */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Text Formatting</Typography>
                      <Stack spacing={1}>
                        {[
                          { key: 'pricePerBold', label: 'Bold Sections', desc: 'Price per text block with bold formatting' },
                          { key: 'pricePerItalic', label: 'Italic Sections', desc: 'Price per text block with italic formatting' },
                          { key: 'pricePerUnderline', label: 'Underline Sections', desc: 'Price per text block with underline formatting' },
                        ].map(item => {
                          return (
                            <Box key={item.key}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                <Typography sx={{ minWidth: 150 }}>{item.label}</Typography>
                                <TextField
                                  type="text"
                                  size="small"
                                  label="Price ($)"
                                  value={localPricingValues[`${item.key}_${selectedPricingProduct}`] || '0.00'}
                                  onChange={(e) => {
                                    const validated = validateCurrencyInput(e.target.value)
                                    setLocalPricingValues({
                                      ...localPricingValues,
                                      [`${item.key}_${selectedPricingProduct}`]: validated
                                    })
                                  }}
                                  sx={{ flex: 1 }}
                                  disabled={!selectedPricingProduct}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 17 }}>
                                {item.desc}
                              </Typography>
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Alignment Options */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Text Alignment</Typography>
                      <Stack spacing={1}>
                        {['left', 'center', 'right', 'justify'].map(alignType => {
                          return (
                            <Box key={alignType} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{alignType}</Typography>
                              <TextField
                                type="text"
                                size="small"
                                label="Price ($)"
                                value={localPricingValues[`alignment_${alignType}_${selectedPricingProduct}`] || '0.00'}
                                onChange={(e) => {
                                  const validated = validateCurrencyInput(e.target.value)
                                  setLocalPricingValues({
                                    ...localPricingValues,
                                    [`alignment_${alignType}_${selectedPricingProduct}`]: validated
                                  })
                                }}
                                sx={{ flex: 1 }}
                                disabled={!selectedPricingProduct}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Size Options */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Text Size</Typography>
                      <Stack spacing={1}>
                        {['small', 'medium', 'large'].map(sizeType => {
                          return (
                            <Box key={sizeType} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{sizeType}</Typography>
                              <TextField
                                type="text"
                                size="small"
                                label="Price ($)"
                                value={localPricingValues[`size_${sizeType}_${selectedPricingProduct}`] || '0.00'}
                                onChange={(e) => {
                                  const validated = validateCurrencyInput(e.target.value)
                                  setLocalPricingValues({
                                    ...localPricingValues,
                                    [`size_${sizeType}_${selectedPricingProduct}`]: validated
                                  })
                                }}
                                sx={{ flex: 1 }}
                                disabled={!selectedPricingProduct}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Font Options */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Font</Typography>
                      <Stack spacing={1}>
                        {['serif', 'sans-serif'].map(fontType => {
                          return (
                            <Box key={fontType} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{fontType}</Typography>
                              <TextField
                                type="text"
                                size="small"
                                label="Price ($)"
                                value={localPricingValues[`font_${fontType}_${selectedPricingProduct}`] || '0.00'}
                                onChange={(e) => {
                                  const validated = validateCurrencyInput(e.target.value)
                                  setLocalPricingValues({
                                    ...localPricingValues,
                                    [`font_${fontType}_${selectedPricingProduct}`]: validated
                                  })
                                }}
                                sx={{ flex: 1 }}
                                disabled={!selectedPricingProduct}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Highlight Options */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Text Highlight</Typography>
                      <Stack spacing={1}>
                        {['none', 'black', 'gray'].map(highlightType => {
                          return (
                            <Box key={highlightType} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{highlightType}</Typography>
                              <TextField
                                type="text"
                                size="small"
                                label="Price ($)"
                                value={localPricingValues[`highlight_${highlightType}_${selectedPricingProduct}`] || '0.00'}
                                onChange={(e) => {
                                  const validated = validateCurrencyInput(e.target.value)
                                  setLocalPricingValues({
                                    ...localPricingValues,
                                    [`highlight_${highlightType}_${selectedPricingProduct}`]: validated
                                  })
                                }}
                                sx={{ flex: 1 }}
                                disabled={!selectedPricingProduct}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                  
                  {/* Image Pricing */}
                  <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
                    <Paper variant="outlined" sx={{ p: 2, width: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Images</Typography>
                      <TextField
                        type="text"
                        size="small"
                        fullWidth
                        label="Price per image ($)"
                        value={localPricingValues[`pricePerImage_${selectedPricingProduct}`] || '0.00'}
                        onChange={(e) => {
                          const validated = validateCurrencyInput(e.target.value)
                          setLocalPricingValues({
                            ...localPricingValues,
                            [`pricePerImage_${selectedPricingProduct}`]: validated
                          })
                        }}
                        disabled={!selectedPricingProduct}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Price charged for each image in the ad
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
                
                {/* Save Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                  <Tooltip title="Save all pricing values for the selected product">
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveAllPricing}
                      disabled={!selectedPricingProduct || isLoading}
                    >
                      Save All Pricing
                    </Button>
                  </Tooltip>
                </Box>
              </Paper>
            )}

          </>
        )}
      </Box>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Message to {messageRecipient?.email}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Subject" fullWidth value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} />
            <TextField label="Message" fullWidth multiline rows={4} value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Cancel sending message. Closes the dialog without sending.">
            <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          </Tooltip>
          <Tooltip title="Send message. Delivers the message to the selected recipient.">
            <Button variant="contained" onClick={handleSendMessage}>Send</Button>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Name" 
              fullWidth 
              value={productForm.name} 
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
              autoFocus
            />
            <TextField 
              label="Width (inches)" 
              type="number" 
              fullWidth 
              value={productForm.widthInches || ''} 
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setProductForm({ ...productForm, widthInches: isNaN(val) ? 0 : val });
              }}
              inputProps={{ step: 0.1, min: 1, max: 10 }}
              required
            />
            <TextField 
              label="Base Price ($)" 
              type="number" 
              fullWidth 
              value={productForm.basePrice || ''} 
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setProductForm({ ...productForm, basePrice: isNaN(val) ? 0 : val });
              }}
              inputProps={{ step: 0.01, min: 0 }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Cancel product edit. Closes the dialog without saving changes.">
            <Button onClick={() => {
              setProductDialogOpen(false);
              setEditingProduct(null);
              setProductForm({ name: '', widthInches: 3, basePrice: 25 });
            }}>Cancel</Button>
          </Tooltip>
          <Tooltip title="Save product. Saves the product configuration to the database.">
            <span>
              <Button 
                variant="contained" 
                onClick={handleSaveProduct}
                disabled={!productForm.name.trim() || !productForm.widthInches || productForm.widthInches <= 0 || !productForm.basePrice || productForm.basePrice < 0}
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

