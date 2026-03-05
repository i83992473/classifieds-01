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
  List,
  ListItem,
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha'
import { getUrl } from 'aws-amplify/storage'
import MessagesDialog from './MessagesDialog'
import { updateUser } from './graphql/mutations'
import JSZip from 'jszip'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
        name
        description
        defaultAddonFee
        isArchived
      }
    }
  }
`

const createPlacementMutation = /* GraphQL */ `
  mutation CreatePlacement($input: CreatePlacementInput!) {
    createPlacement(input: $input) {
      id
      name
      description
      defaultAddonFee
      isArchived
    }
  }
`

const updatePlacementMutation = /* GraphQL */ `
  mutation UpdatePlacement($input: UpdatePlacementInput!) {
    updatePlacement(input: $input) {
      id
      name
      description
      defaultAddonFee
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

const listProductPlacementsQuery = /* GraphQL */ `
  query ListProductPlacements($filter: ModelProductPlacementFilterInput) {
    listProductPlacements(filter: $filter) {
      items {
        id
        productId
        placementId
        addonFeeOverride
        isArchived
      }
    }
  }
`

const createProductPlacementMutation = /* GraphQL */ `
  mutation CreateProductPlacement($input: CreateProductPlacementInput!) {
    createProductPlacement(input: $input) {
      id
      productId
      placementId
      addonFeeOverride
      isArchived
    }
  }
`

const updateProductPlacementMutation = /* GraphQL */ `
  mutation UpdateProductPlacement($input: UpdateProductPlacementInput!) {
    updateProductPlacement(input: $input) {
      id
      productId
      placementId
      addonFeeOverride
      isArchived
    }
  }
`

const deleteProductPlacementMutation = /* GraphQL */ `
  mutation DeleteProductPlacement($input: DeleteProductPlacementInput!) {
    deleteProductPlacement(input: $input) {
      id
    }
  }
`

const listSectionsQuery = /* GraphQL */ `
  query ListSections($filter: ModelSectionFilterInput) {
    listSections(filter: $filter) {
      items { id name description defaultAddonFee isArchived }
    }
  }
`
const createSectionMutation = /* GraphQL */ `
  mutation CreateSection($input: CreateSectionInput!) {
    createSection(input: $input) { id name description defaultAddonFee isArchived }
  }
`
const updateSectionMutation = /* GraphQL */ `
  mutation UpdateSection($input: UpdateSectionInput!) {
    updateSection(input: $input) { id name description defaultAddonFee isArchived }
  }
`
const deleteSectionMutation = /* GraphQL */ `
  mutation DeleteSection($input: DeleteSectionInput!) {
    deleteSection(input: $input) { id }
  }
`

const listSubSectionsQuery = /* GraphQL */ `
  query ListSubSections($filter: ModelSubSectionFilterInput) {
    listSubSections(filter: $filter) {
      items { id name description defaultAddonFee isArchived }
    }
  }
`
const createSubSectionMutation = /* GraphQL */ `
  mutation CreateSubSection($input: CreateSubSectionInput!) {
    createSubSection(input: $input) { id name description defaultAddonFee isArchived }
  }
`
const updateSubSectionMutation = /* GraphQL */ `
  mutation UpdateSubSection($input: UpdateSubSectionInput!) {
    updateSubSection(input: $input) { id name description defaultAddonFee isArchived }
  }
`
const deleteSubSectionMutation = /* GraphQL */ `
  mutation DeleteSubSection($input: DeleteSubSectionInput!) {
    deleteSubSection(input: $input) { id }
  }
`

const listProductSectionsQuery = /* GraphQL */ `
  query ListProductSections($filter: ModelProductSectionFilterInput) {
    listProductSections(filter: $filter) {
      items { id productId sectionId sortOrder addonFeeOverride isArchived }
    }
  }
`
const createProductSectionMutation = /* GraphQL */ `
  mutation CreateProductSection($input: CreateProductSectionInput!) {
    createProductSection(input: $input) { id productId sectionId sortOrder addonFeeOverride isArchived }
  }
`
const updateProductSectionMutation = /* GraphQL */ `
  mutation UpdateProductSection($input: UpdateProductSectionInput!) {
    updateProductSection(input: $input) { id productId sectionId sortOrder addonFeeOverride isArchived }
  }
`
const deleteProductSectionMutation = /* GraphQL */ `
  mutation DeleteProductSection($input: DeleteProductSectionInput!) {
    deleteProductSection(input: $input) { id }
  }
`

const listSectionSubSectionsQuery = /* GraphQL */ `
  query ListSectionSubSections($filter: ModelSectionSubSectionFilterInput) {
    listSectionSubSections(filter: $filter) {
      items { id sectionId subSectionId sortOrder addonFeeOverride isArchived }
    }
  }
`
const createSectionSubSectionMutation = /* GraphQL */ `
  mutation CreateSectionSubSection($input: CreateSectionSubSectionInput!) {
    createSectionSubSection(input: $input) { id sectionId subSectionId sortOrder addonFeeOverride isArchived }
  }
`
const updateSectionSubSectionMutation = /* GraphQL */ `
  mutation UpdateSectionSubSection($input: UpdateSectionSubSectionInput!) {
    updateSectionSubSection(input: $input) { id sectionId subSectionId sortOrder addonFeeOverride isArchived }
  }
`
const deleteSectionSubSectionMutation = /* GraphQL */ `
  mutation DeleteSectionSubSection($input: DeleteSectionSubSectionInput!) {
    deleteSectionSubSection(input: $input) { id }
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

const listDiscountsQuery = /* GraphQL */ `
  query ListDiscounts {
    listDiscounts {
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

const createDiscountMutation = /* GraphQL */ `
  mutation CreateDiscount($input: CreateDiscountInput!) {
    createDiscount(input: $input) {
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
`

const updateDiscountMutation = /* GraphQL */ `
  mutation UpdateDiscount($input: UpdateDiscountInput!) {
    updateDiscount(input: $input) {
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
`

const deleteDiscountMutation = /* GraphQL */ `
  mutation DeleteDiscount($input: DeleteDiscountInput!) {
    deleteDiscount(input: $input) {
      id
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
  name: string
  description?: string
  defaultAddonFee: number
  isArchived: boolean
}

interface ProductPlacement {
  id: string
  productId: string
  placementId: string
  addonFeeOverride?: number
  isArchived: boolean
}

interface Section {
  id: string
  name: string
  description?: string
  defaultAddonFee: number
  isArchived: boolean
}

interface SubSection {
  id: string
  name: string
  description?: string
  defaultAddonFee: number
  isArchived: boolean
}

interface ProductSection {
  id: string
  productId: string
  sectionId: string
  sortOrder: number
  addonFeeOverride?: number
  isArchived: boolean
}

interface SectionSubSection {
  id: string
  sectionId: string
  subSectionId: string
  sortOrder: number
  addonFeeOverride?: number
  isArchived: boolean
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

interface DiscountConditions {
  productIds: string[]
  placementIds: string[]
  sectionIds: string[]
  minPlacements: number
}

const DEFAULT_DISCOUNT_FORM = {
  name: '',
  description: '',
  isAutomatic: true,
  code: '',
  discountType: 'FLAT' as 'FLAT' | 'PERCENTAGE',
  value: '',
  isActive: true,
  startDate: '',
  endDate: '',
  conditionProductIds: [] as string[],
  conditionPlacementIds: [] as string[],
  conditionSectionIds: [] as string[],
  conditionMinPlacements: '',
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

// Sortable row for ProductSection DnD
function SortablePSRow({ ps, sections, onEdit, onRemove }: {
  ps: ProductSection
  sections: Section[]
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ps.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const globalSection = sections.find(s => s.id === ps.sectionId)
  const defaultFee = globalSection?.defaultAddonFee ?? 0
  const effectiveFee = ps.addonFeeOverride ?? defaultFee
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell sx={{ width: 32, p: 0.5, color: 'text.disabled', cursor: 'grab' }} {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="small" />
      </TableCell>
      <TableCell>{globalSection?.name || ps.sectionId}</TableCell>
      <TableCell>${defaultFee.toFixed(2)}</TableCell>
      <TableCell>{ps.addonFeeOverride != null ? `$${ps.addonFeeOverride.toFixed(2)}` : <Typography variant="body2" color="text.secondary">(default)</Typography>}</TableCell>
      <TableCell>${effectiveFee.toFixed(2)}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Edit fee override">
            <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Remove from product">
            <IconButton size="small" color="error" onClick={onRemove}><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

// Sortable row for SectionSubSection DnD
function SortableSSRow({ ss, subSections, onEdit, onRemove }: {
  ss: SectionSubSection
  subSections: SubSection[]
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ss.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const globalSub = subSections.find(s => s.id === ss.subSectionId)
  const defaultFee = globalSub?.defaultAddonFee ?? 0
  const effectiveFee = ss.addonFeeOverride ?? defaultFee
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell sx={{ width: 32, p: 0.5, color: 'text.disabled', cursor: 'grab' }} {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="small" />
      </TableCell>
      <TableCell>{globalSub?.name || ss.subSectionId}</TableCell>
      <TableCell>${defaultFee.toFixed(2)}</TableCell>
      <TableCell>{ss.addonFeeOverride != null ? `$${ss.addonFeeOverride.toFixed(2)}` : <Typography variant="body2" color="text.secondary">(default)</Typography>}</TableCell>
      <TableCell>${effectiveFee.toFixed(2)}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Edit fee override">
            <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Remove from section">
            <IconButton size="small" color="error" onClick={onRemove}><DeleteIcon fontSize="small" /></IconButton>
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

  // Products sub-tab (0 = Products, 1 = Placements, 2 = Sections, 3 = Sub-Sections)
  const [productsSubTab, setProductsSubTab] = useState(0)

  // Placement state
  const [placements, setPlacements] = useState<Placement[]>([])
  const [productPlacements, setProductPlacements] = useState<ProductPlacement[]>([])
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [placementForm, setPlacementForm] = useState({ name: '', description: '', defaultAddonFee: 0 })
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null)
  const [placementDialogOpen, setPlacementDialogOpen] = useState(false)
  const [addingPlacementToProductId, setAddingPlacementToProductId] = useState<string | null>(null)
  const [addPlacementToProductForm, setAddPlacementToProductForm] = useState({ placementId: '', addonFeeOverride: '' })
  const [editingProductPlacement, setEditingProductPlacement] = useState<ProductPlacement | null>(null)
  const [productPlacementDialogOpen, setProductPlacementDialogOpen] = useState(false)
  const [productPlacementFeeOverride, setProductPlacementFeeOverride] = useState('')

  // Section / SubSection state
  const [sections, setSections] = useState<Section[]>([])
  const [subSections, setSubSections] = useState<SubSection[]>([])
  const [productSections, setProductSections] = useState<ProductSection[]>([])
  const [sectionSubSections, setSectionSubSections] = useState<SectionSubSection[]>([])

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [sectionForm, setSectionForm] = useState({ name: '', description: '', defaultAddonFee: 0 })

  const [subSectionDialogOpen, setSubSectionDialogOpen] = useState(false)
  const [editingSubSection, setEditingSubSection] = useState<SubSection | null>(null)
  const [subSectionForm, setSubSectionForm] = useState({ name: '', description: '', defaultAddonFee: 0 })

  // Checklist dialogs
  const [addSectionsToProductOpen, setAddSectionsToProductOpen] = useState(false)
  const [addSectionsToProductId, setAddSectionsToProductId] = useState<string | null>(null)
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([])

  const [addSubSectionsToSectionOpen, setAddSubSectionsToSectionOpen] = useState(false)
  const [addSubSectionsToSectionId, setAddSubSectionsToSectionId] = useState<string | null>(null)
  const [selectedSubSectionIds, setSelectedSubSectionIds] = useState<string[]>([])

  // ProductSection fee override dialog
  const [editingProductSection, setEditingProductSection] = useState<ProductSection | null>(null)
  const [productSectionDialogOpen, setProductSectionDialogOpen] = useState(false)
  const [productSectionFeeOverride, setProductSectionFeeOverride] = useState('')

  // SectionSubSection fee override dialog
  const [editingSectionSubSection, setEditingSectionSubSection] = useState<SectionSubSection | null>(null)
  const [sectionSubSectionDialogOpen, setSectionSubSectionDialogOpen] = useState(false)
  const [sectionSubSectionFeeOverride, setSectionSubSectionFeeOverride] = useState('')

  // Expanded section row (for sub-sections sub-table in Sections sub-tab)
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)

  // Discount state
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [discountForm, setDiscountForm] = useState(DEFAULT_DISCOUNT_FORM)
  const [deleteDiscountDialogOpen, setDeleteDiscountDialogOpen] = useState(false)
  const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor))

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
    else if (activeTab === 2) { loadProducts(); loadAllPlacements(); loadAllSections(); loadAllSubSections() }
    else if (activeTab === 3) loadPricingSettings()
    else if (activeTab === 4) { loadDiscounts(); loadProducts(); loadAllPlacements(); loadAllSections() }
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
  
  const loadDiscounts = async () => {
    setIsLoading(true)
    try {
      const result = await client.graphql({
        query: listDiscountsQuery,
        authMode: 'userPool'
      }) as { data: { listDiscounts: { items: Discount[] } } }
      setDiscounts(result.data.listDiscounts.items || [])
    } catch (error) {
      console.error('Error loading discounts:', error)
      setSnackbar({ open: true, message: 'Failed to load discounts', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDiscountDialog = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount)
      const conds: DiscountConditions = discount.conditions
        ? JSON.parse(discount.conditions)
        : { productIds: [], placementIds: [], sectionIds: [], minPlacements: 0 }
      setDiscountForm({
        name: discount.name,
        description: discount.description || '',
        isAutomatic: !discount.code,
        code: discount.code || '',
        discountType: discount.discountType,
        value: discount.value.toString(),
        isActive: discount.isActive,
        startDate: discount.startDate || '',
        endDate: discount.endDate || '',
        conditionProductIds: conds.productIds || [],
        conditionPlacementIds: conds.placementIds || [],
        conditionSectionIds: conds.sectionIds || [],
        conditionMinPlacements: conds.minPlacements ? conds.minPlacements.toString() : '',
      })
    } else {
      setEditingDiscount(null)
      setDiscountForm(DEFAULT_DISCOUNT_FORM)
    }
    setDiscountDialogOpen(true)
  }

  const handleSaveDiscount = async () => {
    if (!discountForm.name.trim()) {
      setSnackbar({ open: true, message: 'Name is required', severity: 'warning' })
      return
    }
    const numValue = parseFloat(discountForm.value)
    if (isNaN(numValue) || numValue < 0) {
      setSnackbar({ open: true, message: 'Enter a valid discount value', severity: 'warning' })
      return
    }
    if (discountForm.discountType === 'PERCENTAGE' && numValue > 100) {
      setSnackbar({ open: true, message: 'Percentage cannot exceed 100', severity: 'warning' })
      return
    }
    if (!discountForm.isAutomatic && !discountForm.code.trim()) {
      setSnackbar({ open: true, message: 'Coupon code is required', severity: 'warning' })
      return
    }

    const conditions: DiscountConditions = {
      productIds: discountForm.conditionProductIds,
      placementIds: discountForm.conditionPlacementIds,
      sectionIds: discountForm.conditionSectionIds,
      minPlacements: discountForm.conditionMinPlacements ? parseInt(discountForm.conditionMinPlacements) : 0,
    }

    const input: any = {
      name: discountForm.name.trim(),
      description: discountForm.description.trim() || null,
      code: discountForm.isAutomatic ? null : discountForm.code.trim().toUpperCase(),
      discountType: discountForm.discountType,
      value: numValue,
      isActive: discountForm.isActive,
      startDate: discountForm.startDate || null,
      endDate: discountForm.endDate || null,
      conditions: JSON.stringify(conditions),
    }

    setIsLoading(true)
    try {
      if (editingDiscount) {
        await client.graphql({
          query: updateDiscountMutation,
          variables: { input: { id: editingDiscount.id, ...input } },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Discount updated', severity: 'success' })
      } else {
        await client.graphql({
          query: createDiscountMutation,
          variables: { input },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Discount created', severity: 'success' })
      }
      setDiscountDialogOpen(false)
      await loadDiscounts()
    } catch (error) {
      console.error('Error saving discount:', error)
      setSnackbar({ open: true, message: 'Failed to save discount', severity: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDiscount = async () => {
    if (!deletingDiscountId) return
    setIsLoading(true)
    try {
      await client.graphql({
        query: deleteDiscountMutation,
        variables: { input: { id: deletingDiscountId } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Discount deleted', severity: 'success' })
      setDeleteDiscountDialogOpen(false)
      setDeletingDiscountId(null)
      await loadDiscounts()
    } catch (error) {
      console.error('Error deleting discount:', error)
      setSnackbar({ open: true, message: 'Failed to delete discount', severity: 'error' })
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
    if (productForm.basePrice === undefined || productForm.basePrice === null || productForm.basePrice < 0) {
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

  const loadAllPlacements = async () => {
    try {
      const result = await client.graphql({
        query: listPlacementsQuery,
        authMode: 'userPool'
      }) as { data: { listPlacements: { items: Placement[] } } }
      setPlacements(result.data.listPlacements.items || [])
    } catch (error) {
      console.error('Error loading placements:', error)
    }
  }

  const loadProductPlacements = async (productId: string) => {
    try {
      const result = await client.graphql({
        query: listProductPlacementsQuery,
        variables: { filter: { productId: { eq: productId } } },
        authMode: 'userPool'
      }) as { data: { listProductPlacements: { items: ProductPlacement[] } } }
      setProductPlacements(result.data.listProductPlacements.items || [])
    } catch (error) {
      console.error('Error loading product placements:', error)
    }
  }

  const loadAllSections = async () => {
    try {
      const result = await client.graphql({
        query: listSectionsQuery,
        authMode: 'userPool'
      }) as { data: { listSections: { items: Section[] } } }
      setSections(result.data.listSections.items || [])
    } catch (error) {
      console.error('Error loading sections:', error)
    }
  }

  const loadAllSubSections = async () => {
    try {
      const result = await client.graphql({
        query: listSubSectionsQuery,
        authMode: 'userPool'
      }) as { data: { listSubSections: { items: SubSection[] } } }
      setSubSections(result.data.listSubSections.items || [])
    } catch (error) {
      console.error('Error loading sub-sections:', error)
    }
  }

  const loadProductSections = async (productId: string) => {
    try {
      const result = await client.graphql({
        query: listProductSectionsQuery,
        variables: { filter: { productId: { eq: productId }, isArchived: { ne: true } } },
        authMode: 'userPool'
      }) as { data: { listProductSections: { items: ProductSection[] } } }
      const sorted = [...(result.data.listProductSections.items || [])].sort((a, b) => a.sortOrder - b.sortOrder)
      setProductSections(sorted)
    } catch (error) {
      console.error('Error loading product sections:', error)
    }
  }

  const loadSectionSubSections = async (sectionId: string) => {
    try {
      const result = await client.graphql({
        query: listSectionSubSectionsQuery,
        variables: { filter: { sectionId: { eq: sectionId }, isArchived: { ne: true } } },
        authMode: 'userPool'
      }) as { data: { listSectionSubSections: { items: SectionSubSection[] } } }
      const sorted = [...(result.data.listSectionSubSections.items || [])].sort((a, b) => a.sortOrder - b.sortOrder)
      setSectionSubSections(sorted)
    } catch (error) {
      console.error('Error loading section sub-sections:', error)
    }
  }

  const handleToggleProductExpand = (productId: string) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null)
      setProductPlacements([])
      setProductSections([])
    } else {
      setExpandedProductId(productId)
      loadProductPlacements(productId)
      loadProductSections(productId)
      setAddingPlacementToProductId(null)
      setAddPlacementToProductForm({ placementId: '', addonFeeOverride: '' })
    }
  }

  const handleSavePlacement = async () => {
    try {
      if (editingPlacement) {
        await client.graphql({
          query: updatePlacementMutation,
          variables: {
            input: {
              id: editingPlacement.id,
              name: placementForm.name,
              description: placementForm.description || undefined,
              defaultAddonFee: placementForm.defaultAddonFee,
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
              name: placementForm.name,
              description: placementForm.description || undefined,
              defaultAddonFee: placementForm.defaultAddonFee,
              isArchived: false,
            }
          },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Placement created', severity: 'success' })
      }
      setEditingPlacement(null)
      setPlacementDialogOpen(false)
      setPlacementForm({ name: '', description: '', defaultAddonFee: 0 })
      loadAllPlacements()
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
      loadAllPlacements()
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
      loadAllPlacements()
    } catch (error) {
      console.error('Error archiving placement:', error)
      setSnackbar({ open: true, message: 'Failed to update placement', severity: 'error' })
    }
  }

  const handleAddPlacementToProduct = async (productId: string) => {
    if (!addPlacementToProductForm.placementId) return
    try {
      const override = addPlacementToProductForm.addonFeeOverride !== ''
        ? parseFloat(addPlacementToProductForm.addonFeeOverride)
        : undefined
      await client.graphql({
        query: createProductPlacementMutation,
        variables: {
          input: {
            productId,
            placementId: addPlacementToProductForm.placementId,
            addonFeeOverride: override,
            isArchived: false,
          }
        },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Placement added to product', severity: 'success' })
      setAddingPlacementToProductId(null)
      setAddPlacementToProductForm({ placementId: '', addonFeeOverride: '' })
      loadProductPlacements(productId)
    } catch (error) {
      console.error('Error adding placement to product:', error)
      setSnackbar({ open: true, message: 'Failed to add placement', severity: 'error' })
    }
  }

  const handleRemoveProductPlacement = async (pp: ProductPlacement) => {
    if (!confirm('Remove this placement from the product?')) return
    try {
      await client.graphql({
        query: deleteProductPlacementMutation,
        variables: { input: { id: pp.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Placement removed', severity: 'success' })
      loadProductPlacements(pp.productId)
    } catch (error) {
      console.error('Error removing product placement:', error)
      setSnackbar({ open: true, message: 'Failed to remove placement', severity: 'error' })
    }
  }

  const handleUpdateProductPlacementFee = async (pp: ProductPlacement, feeStr: string) => {
    try {
      const override = feeStr !== '' ? parseFloat(feeStr) : null
      await client.graphql({
        query: updateProductPlacementMutation,
        variables: { input: { id: pp.id, addonFeeOverride: override } },
        authMode: 'userPool'
      })
      setProductPlacementDialogOpen(false)
      setEditingProductPlacement(null)
      setProductPlacementFeeOverride('')
      loadProductPlacements(pp.productId)
    } catch (error) {
      console.error('Error updating fee override:', error)
      setSnackbar({ open: true, message: 'Failed to update fee override', severity: 'error' })
    }
  }

  // ── Section CRUD ──────────────────────────────────────────────────────────

  const handleSaveSection = async () => {
    if (!sectionForm.name.trim()) return
    try {
      if (editingSection) {
        await client.graphql({
          query: updateSectionMutation,
          variables: { input: { id: editingSection.id, name: sectionForm.name.trim(), description: sectionForm.description || undefined, defaultAddonFee: sectionForm.defaultAddonFee } },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Section updated', severity: 'success' })
      } else {
        await client.graphql({
          query: createSectionMutation,
          variables: { input: { name: sectionForm.name.trim(), description: sectionForm.description || undefined, defaultAddonFee: sectionForm.defaultAddonFee, isArchived: false } },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Section created', severity: 'success' })
      }
      setSectionDialogOpen(false)
      setEditingSection(null)
      setSectionForm({ name: '', description: '', defaultAddonFee: 0 })
      loadAllSections()
    } catch (error) {
      console.error('Error saving section:', error)
      setSnackbar({ open: true, message: 'Failed to save section', severity: 'error' })
    }
  }

  const handleArchiveSection = async (s: Section) => {
    try {
      await client.graphql({
        query: updateSectionMutation,
        variables: { input: { id: s.id, isArchived: !s.isArchived } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: s.isArchived ? 'Section restored' : 'Section archived', severity: 'success' })
      loadAllSections()
    } catch (error) {
      console.error('Error archiving section:', error)
      setSnackbar({ open: true, message: 'Failed to update section', severity: 'error' })
    }
  }

  const handleDeleteSection = async (s: Section) => {
    if (!confirm(`Delete section "${s.name}" permanently?`)) return
    try {
      await client.graphql({
        query: deleteSectionMutation,
        variables: { input: { id: s.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Section deleted', severity: 'success' })
      loadAllSections()
    } catch (error) {
      console.error('Error deleting section:', error)
      setSnackbar({ open: true, message: 'Failed to delete section', severity: 'error' })
    }
  }

  // ── SubSection CRUD ───────────────────────────────────────────────────────

  const handleSaveSubSection = async () => {
    if (!subSectionForm.name.trim()) return
    try {
      if (editingSubSection) {
        await client.graphql({
          query: updateSubSectionMutation,
          variables: { input: { id: editingSubSection.id, name: subSectionForm.name.trim(), description: subSectionForm.description || undefined, defaultAddonFee: subSectionForm.defaultAddonFee } },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Sub-Section updated', severity: 'success' })
      } else {
        await client.graphql({
          query: createSubSectionMutation,
          variables: { input: { name: subSectionForm.name.trim(), description: subSectionForm.description || undefined, defaultAddonFee: subSectionForm.defaultAddonFee, isArchived: false } },
          authMode: 'userPool'
        })
        setSnackbar({ open: true, message: 'Sub-Section created', severity: 'success' })
      }
      setSubSectionDialogOpen(false)
      setEditingSubSection(null)
      setSubSectionForm({ name: '', description: '', defaultAddonFee: 0 })
      loadAllSubSections()
    } catch (error) {
      console.error('Error saving sub-section:', error)
      setSnackbar({ open: true, message: 'Failed to save sub-section', severity: 'error' })
    }
  }

  const handleArchiveSubSection = async (ss: SubSection) => {
    try {
      await client.graphql({
        query: updateSubSectionMutation,
        variables: { input: { id: ss.id, isArchived: !ss.isArchived } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: ss.isArchived ? 'Sub-Section restored' : 'Sub-Section archived', severity: 'success' })
      loadAllSubSections()
    } catch (error) {
      console.error('Error archiving sub-section:', error)
      setSnackbar({ open: true, message: 'Failed to update sub-section', severity: 'error' })
    }
  }

  const handleDeleteSubSection = async (ss: SubSection) => {
    if (!confirm(`Delete sub-section "${ss.name}" permanently?`)) return
    try {
      await client.graphql({
        query: deleteSubSectionMutation,
        variables: { input: { id: ss.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Sub-Section deleted', severity: 'success' })
      loadAllSubSections()
    } catch (error) {
      console.error('Error deleting sub-section:', error)
      setSnackbar({ open: true, message: 'Failed to delete sub-section', severity: 'error' })
    }
  }

  // ── ProductSection handlers ───────────────────────────────────────────────

  const handleAddSectionsToProduct = async (productId: string, sectionIds: string[]) => {
    try {
      const maxOrder = productSections.length > 0 ? Math.max(...productSections.map(ps => ps.sortOrder)) : -1
      await Promise.all(sectionIds.map((sid, i) =>
        client.graphql({
          query: createProductSectionMutation,
          variables: { input: { productId, sectionId: sid, sortOrder: maxOrder + 1 + i, isArchived: false } },
          authMode: 'userPool'
        })
      ))
      setSnackbar({ open: true, message: 'Sections added', severity: 'success' })
      setAddSectionsToProductOpen(false)
      setSelectedSectionIds([])
      loadProductSections(productId)
    } catch (error) {
      console.error('Error adding sections:', error)
      setSnackbar({ open: true, message: 'Failed to add sections', severity: 'error' })
    }
  }

  const handleRemoveProductSection = async (ps: ProductSection) => {
    if (!confirm('Remove this section from the product?')) return
    try {
      await client.graphql({
        query: deleteProductSectionMutation,
        variables: { input: { id: ps.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Section removed', severity: 'success' })
      loadProductSections(ps.productId)
    } catch (error) {
      console.error('Error removing product section:', error)
      setSnackbar({ open: true, message: 'Failed to remove section', severity: 'error' })
    }
  }

  const handleUpdateProductSectionFee = async (ps: ProductSection, feeStr: string) => {
    try {
      const override = feeStr !== '' ? parseFloat(feeStr) : null
      await client.graphql({
        query: updateProductSectionMutation,
        variables: { input: { id: ps.id, addonFeeOverride: override } },
        authMode: 'userPool'
      })
      setProductSectionDialogOpen(false)
      setEditingProductSection(null)
      setProductSectionFeeOverride('')
      loadProductSections(ps.productId)
    } catch (error) {
      console.error('Error updating section fee override:', error)
      setSnackbar({ open: true, message: 'Failed to update fee override', severity: 'error' })
    }
  }

  const handleSortProductSectionsAlpha = async (productId: string) => {
    const sorted = [...productSections].sort((a, b) => {
      const na = sections.find(s => s.id === a.sectionId)?.name ?? ''
      const nb = sections.find(s => s.id === b.sectionId)?.name ?? ''
      return na.localeCompare(nb)
    })
    setProductSections(sorted)
    try {
      await Promise.all(sorted.map((ps, i) =>
        client.graphql({
          query: updateProductSectionMutation,
          variables: { input: { id: ps.id, sortOrder: i } },
          authMode: 'userPool'
        })
      ))
      setSnackbar({ open: true, message: 'Sections sorted alphabetically', severity: 'success' })
    } catch (error) {
      console.error('Error sorting product sections:', error)
      loadProductSections(productId)
    }
  }

  const handleDragEndProductSections = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = productSections.findIndex(ps => ps.id === active.id)
    const newIndex = productSections.findIndex(ps => ps.id === over.id)
    const reordered = arrayMove(productSections, oldIndex, newIndex)
    setProductSections(reordered)
    try {
      await Promise.all(reordered.map((ps, i) =>
        client.graphql({
          query: updateProductSectionMutation,
          variables: { input: { id: ps.id, sortOrder: i } },
          authMode: 'userPool'
        })
      ))
    } catch (error) {
      console.error('Error updating sort order:', error)
      if (expandedProductId) loadProductSections(expandedProductId)
    }
  }

  // ── SectionSubSection handlers ────────────────────────────────────────────

  const handleAddSubSectionsToSection = async (sectionId: string, subSectionIds: string[]) => {
    try {
      const maxOrder = sectionSubSections.length > 0 ? Math.max(...sectionSubSections.map(ss => ss.sortOrder)) : -1
      await Promise.all(subSectionIds.map((sid, i) =>
        client.graphql({
          query: createSectionSubSectionMutation,
          variables: { input: { sectionId, subSectionId: sid, sortOrder: maxOrder + 1 + i, isArchived: false } },
          authMode: 'userPool'
        })
      ))
      setSnackbar({ open: true, message: 'Sub-Sections added', severity: 'success' })
      setAddSubSectionsToSectionOpen(false)
      setSelectedSubSectionIds([])
      loadSectionSubSections(sectionId)
    } catch (error) {
      console.error('Error adding sub-sections:', error)
      setSnackbar({ open: true, message: 'Failed to add sub-sections', severity: 'error' })
    }
  }

  const handleRemoveSectionSubSection = async (ss: SectionSubSection) => {
    if (!confirm('Remove this sub-section from the section?')) return
    try {
      await client.graphql({
        query: deleteSectionSubSectionMutation,
        variables: { input: { id: ss.id } },
        authMode: 'userPool'
      })
      setSnackbar({ open: true, message: 'Sub-Section removed', severity: 'success' })
      loadSectionSubSections(ss.sectionId)
    } catch (error) {
      console.error('Error removing section sub-section:', error)
      setSnackbar({ open: true, message: 'Failed to remove sub-section', severity: 'error' })
    }
  }

  const handleUpdateSectionSubSectionFee = async (ss: SectionSubSection, feeStr: string) => {
    try {
      const override = feeStr !== '' ? parseFloat(feeStr) : null
      await client.graphql({
        query: updateSectionSubSectionMutation,
        variables: { input: { id: ss.id, addonFeeOverride: override } },
        authMode: 'userPool'
      })
      setSectionSubSectionDialogOpen(false)
      setEditingSectionSubSection(null)
      setSectionSubSectionFeeOverride('')
      loadSectionSubSections(ss.sectionId)
    } catch (error) {
      console.error('Error updating sub-section fee override:', error)
      setSnackbar({ open: true, message: 'Failed to update fee override', severity: 'error' })
    }
  }

  const handleSortSectionSubSectionsAlpha = async (sectionId: string) => {
    const sorted = [...sectionSubSections].sort((a, b) => {
      const na = subSections.find(s => s.id === a.subSectionId)?.name ?? ''
      const nb = subSections.find(s => s.id === b.subSectionId)?.name ?? ''
      return na.localeCompare(nb)
    })
    setSectionSubSections(sorted)
    try {
      await Promise.all(sorted.map((ss, i) =>
        client.graphql({
          query: updateSectionSubSectionMutation,
          variables: { input: { id: ss.id, sortOrder: i } },
          authMode: 'userPool'
        })
      ))
      setSnackbar({ open: true, message: 'Sub-Sections sorted alphabetically', severity: 'success' })
    } catch (error) {
      console.error('Error sorting section sub-sections:', error)
      loadSectionSubSections(sectionId)
    }
  }

  const handleDragEndSectionSubSections = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sectionSubSections.findIndex(ss => ss.id === active.id)
    const newIndex = sectionSubSections.findIndex(ss => ss.id === over.id)
    const reordered = arrayMove(sectionSubSections, oldIndex, newIndex)
    setSectionSubSections(reordered)
    try {
      await Promise.all(reordered.map((ss, i) =>
        client.graphql({
          query: updateSectionSubSectionMutation,
          variables: { input: { id: ss.id, sortOrder: i } },
          authMode: 'userPool'
        })
      ))
    } catch (error) {
      console.error('Error updating sort order:', error)
      if (expandedSectionId) loadSectionSubSections(expandedSectionId)
    }
  }


  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
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
      
      <Box sx={{ flex: 1, overflowY: 'auto', pt: 10, px: 3, pb: 3 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
            <Tab label="Ads" />
            <Tab label="Users" />
            <Tab label="Products" />
            <Tab label="Pricing" />
            <Tab label="Discounts" />
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
                <Tabs value={productsSubTab} onChange={(_, v) => setProductsSubTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                  <Tab label="Products" />
                  <Tab label="Placements" />
                  <Tab label="Sections" />
                  <Tab label="Sub-Sections" />
                </Tabs>

                {/* Placements sub-tab */}
                {productsSubTab === 1 && <Paper elevation={0}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Placements Library</Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingPlacement(null)
                        setPlacementForm({ name: '', description: '', defaultAddonFee: 0 })
                        setPlacementDialogOpen(true)
                      }}
                    >
                      Add Placement
                    </Button>
                  </Box>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Default Fee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {placements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">No placements in library</TableCell>
                        </TableRow>
                      ) : (
                        placements.map(placement => (
                          <TableRow key={placement.id} sx={{ opacity: placement.isArchived ? 0.5 : 1 }}>
                            <TableCell>{placement.name}</TableCell>
                            <TableCell>{placement.description || '-'}</TableCell>
                            <TableCell>${(placement.defaultAddonFee || 0).toFixed(2)}</TableCell>
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
                                      defaultAddonFee: placement.defaultAddonFee,
                                    })
                                    setPlacementDialogOpen(true)
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>}

                {/* Sections sub-tab */}
                {productsSubTab === 2 && <Paper elevation={0}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Section Library</Typography>
                    <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => {
                      setEditingSection(null)
                      setSectionForm({ name: '', description: '', defaultAddonFee: 0 })
                      setSectionDialogOpen(true)
                    }}>
                      Add Section
                    </Button>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 40 }} />
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Default Fee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sections.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">No sections in library</TableCell>
                        </TableRow>
                      ) : (
                        sections.map(section => {
                          const isSectionExpanded = expandedSectionId === section.id
                          const assignedSubSectionIds = isSectionExpanded ? sectionSubSections.map(ss => ss.subSectionId) : []
                          const availableSubSections = subSections.filter(ss => !ss.isArchived && !assignedSubSectionIds.includes(ss.id))
                          return (
                            <>
                              <TableRow key={section.id} sx={{ opacity: section.isArchived ? 0.5 : 1 }}>
                                <TableCell sx={{ width: 40, p: 0.5 }}>
                                  <IconButton size="small" onClick={() => {
                                    if (isSectionExpanded) {
                                      setExpandedSectionId(null)
                                      setSectionSubSections([])
                                    } else {
                                      setExpandedSectionId(section.id)
                                      loadSectionSubSections(section.id)
                                    }
                                  }}>
                                    {isSectionExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                                  </IconButton>
                                </TableCell>
                                <TableCell>{section.name}</TableCell>
                                <TableCell>{section.description || '-'}</TableCell>
                                <TableCell>${(section.defaultAddonFee || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                  {section.isArchived ? <Chip size="small" label="Archived" /> : <Chip size="small" label="Active" color="success" />}
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                    <Tooltip title="Edit">
                                      <IconButton size="small" onClick={() => {
                                        setEditingSection(section)
                                        setSectionForm({ name: section.name, description: section.description || '', defaultAddonFee: section.defaultAddonFee })
                                        setSectionDialogOpen(true)
                                      }}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title={section.isArchived ? 'Restore' : 'Archive'}>
                                      <IconButton size="small" onClick={() => handleArchiveSection(section)}>
                                        <ArchiveIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete permanently">
                                      <IconButton size="small" color="error" onClick={() => handleDeleteSection(section)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                              <TableRow key={`${section.id}-subsections`}>
                                <TableCell colSpan={6} sx={{ p: 0, borderBottom: isSectionExpanded ? undefined : 'none' }}>
                                  <Collapse in={isSectionExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ bgcolor: 'grey.50', px: 4, py: 2 }}>
                                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                        <Typography variant="subtitle2" fontWeight={600}>Sub-Sections in this section</Typography>
                                        <Stack direction="row" spacing={1}>
                                          <Tooltip title="Sort A-Z">
                                            <IconButton size="small" onClick={() => handleSortSectionSubSectionsAlpha(section.id)}>
                                              <SortByAlphaIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            disabled={availableSubSections.length === 0}
                                            onClick={() => {
                                              setAddSubSectionsToSectionId(section.id)
                                              setSelectedSubSectionIds([])
                                              setAddSubSectionsToSectionOpen(true)
                                            }}
                                          >
                                            + Add Sub-Sections
                                          </Button>
                                        </Stack>
                                      </Stack>
                                      {sectionSubSections.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">No sub-sections assigned</Typography>
                                      ) : (
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell sx={{ width: 32 }} />
                                              <TableCell>Name</TableCell>
                                              <TableCell>Default Fee</TableCell>
                                              <TableCell>Override</TableCell>
                                              <TableCell>Effective</TableCell>
                                              <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSectionSubSections}>
                                              <SortableContext items={sectionSubSections.map(ss => ss.id)} strategy={verticalListSortingStrategy}>
                                                {sectionSubSections.map(ss => (
                                                  <SortableSSRow
                                                    key={ss.id}
                                                    ss={ss}
                                                    subSections={subSections}
                                                    onEdit={() => {
                                                      setEditingSectionSubSection(ss)
                                                      setSectionSubSectionFeeOverride(ss.addonFeeOverride != null ? String(ss.addonFeeOverride) : '')
                                                      setSectionSubSectionDialogOpen(true)
                                                    }}
                                                    onRemove={() => handleRemoveSectionSubSection(ss)}
                                                  />
                                                ))}
                                              </SortableContext>
                                            </DndContext>
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
                </Paper>}

                {/* Sub-Sections sub-tab */}
                {productsSubTab === 3 && <Paper elevation={0}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Sub-Section Library</Typography>
                    <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => {
                      setEditingSubSection(null)
                      setSubSectionForm({ name: '', description: '', defaultAddonFee: 0 })
                      setSubSectionDialogOpen(true)
                    }}>
                      Add Sub-Section
                    </Button>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Default Fee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subSections.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">No sub-sections in library</TableCell>
                        </TableRow>
                      ) : (
                        subSections.map(ss => (
                          <TableRow key={ss.id} sx={{ opacity: ss.isArchived ? 0.5 : 1 }}>
                            <TableCell>{ss.name}</TableCell>
                            <TableCell>{ss.description || '-'}</TableCell>
                            <TableCell>${(ss.defaultAddonFee || 0).toFixed(2)}</TableCell>
                            <TableCell>
                              {ss.isArchived ? <Chip size="small" label="Archived" /> : <Chip size="small" label="Active" color="success" />}
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => {
                                    setEditingSubSection(ss)
                                    setSubSectionForm({ name: ss.name, description: ss.description || '', defaultAddonFee: ss.defaultAddonFee })
                                    setSubSectionDialogOpen(true)
                                  }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={ss.isArchived ? 'Restore' : 'Archive'}>
                                  <IconButton size="small" onClick={() => handleArchiveSubSection(ss)}>
                                    <ArchiveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete permanently">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteSubSection(ss)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>}

                {/* Products sub-tab */}
                {productsSubTab === 0 && <Paper elevation={0}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Product Library</Typography>
                    <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingProduct(null); setProductForm({ name: '', widthInches: 3, basePrice: 25 }); setProductDialogOpen(true) }}>
                      Add Product
                    </Button>
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
                          // Placements assigned to this product (only when expanded)
                          const assignedPlacements = isExpanded ? productPlacements : []
                          // Placement IDs already assigned (for filtering the add dropdown)
                          const assignedPlacementIds = assignedPlacements.map(pp => pp.placementId)
                          const availableToAdd = placements.filter(p => !p.isArchived && !assignedPlacementIds.includes(p.id))
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
                                    {/* Sections panel */}
                                    <Box sx={{ bgcolor: 'grey.50', px: 4, py: 2, borderBottom: 1, borderColor: 'divider' }}>
                                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                        <Typography variant="subtitle2" fontWeight={600}>Sections for this product</Typography>
                                        <Stack direction="row" spacing={1}>
                                          <Tooltip title="Sort A-Z">
                                            <IconButton size="small" onClick={() => handleSortProductSectionsAlpha(product.id)}>
                                              <SortByAlphaIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            disabled={sections.filter(s => !s.isArchived && !productSections.map(ps => ps.sectionId).includes(s.id)).length === 0}
                                            onClick={() => {
                                              setAddSectionsToProductId(product.id)
                                              setSelectedSectionIds([])
                                              setAddSectionsToProductOpen(true)
                                            }}
                                          >
                                            + Add Sections
                                          </Button>
                                        </Stack>
                                      </Stack>
                                      {productSections.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">No sections assigned to this product</Typography>
                                      ) : (
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell sx={{ width: 32 }} />
                                              <TableCell>Name</TableCell>
                                              <TableCell>Default Fee</TableCell>
                                              <TableCell>Override</TableCell>
                                              <TableCell>Effective</TableCell>
                                              <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProductSections}>
                                              <SortableContext items={productSections.map(ps => ps.id)} strategy={verticalListSortingStrategy}>
                                                {productSections.map(ps => (
                                                  <SortablePSRow
                                                    key={ps.id}
                                                    ps={ps}
                                                    sections={sections}
                                                    onEdit={() => {
                                                      setEditingProductSection(ps)
                                                      setProductSectionFeeOverride(ps.addonFeeOverride != null ? String(ps.addonFeeOverride) : '')
                                                      setProductSectionDialogOpen(true)
                                                    }}
                                                    onRemove={() => handleRemoveProductSection(ps)}
                                                  />
                                                ))}
                                              </SortableContext>
                                            </DndContext>
                                          </TableBody>
                                        </Table>
                                      )}
                                    </Box>
                                    {/* Placements panel */}
                                    <Box sx={{ bgcolor: 'grey.50', px: 4, py: 2 }}>
                                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                        <Typography variant="subtitle2" fontWeight={600}>Placements for this product</Typography>
                                        {addingPlacementToProductId !== product.id && (
                                          <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            disabled={availableToAdd.length === 0}
                                            onClick={() => {
                                              setAddingPlacementToProductId(product.id)
                                              setAddPlacementToProductForm({ placementId: '', addonFeeOverride: '' })
                                            }}
                                          >
                                            Add Placement to Product
                                          </Button>
                                        )}
                                      </Stack>

                                      {/* Add placement to product form */}
                                      {addingPlacementToProductId === product.id && (
                                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                          <Stack spacing={1.5}>
                                            <FormControl size="small" fullWidth>
                                              <InputLabel>Select Placement</InputLabel>
                                              <Select
                                                value={addPlacementToProductForm.placementId}
                                                label="Select Placement"
                                                onChange={e => setAddPlacementToProductForm(f => ({ ...f, placementId: e.target.value }))}
                                              >
                                                {availableToAdd.map(p => (
                                                  <MenuItem key={p.id} value={p.id}>
                                                    {p.name} (default ${(p.defaultAddonFee || 0).toFixed(2)})
                                                  </MenuItem>
                                                ))}
                                              </Select>
                                            </FormControl>
                                            <TextField
                                              size="small"
                                              label="Fee Override (leave blank to use default)"
                                              type="number"
                                              value={addPlacementToProductForm.addonFeeOverride}
                                              onChange={e => setAddPlacementToProductForm(f => ({ ...f, addonFeeOverride: e.target.value }))}
                                              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                            />
                                            <Stack direction="row" spacing={1}>
                                              <Button
                                                size="small"
                                                variant="contained"
                                                disabled={!addPlacementToProductForm.placementId}
                                                onClick={() => handleAddPlacementToProduct(product.id)}
                                              >
                                                Add
                                              </Button>
                                              <Button
                                                size="small"
                                                onClick={() => {
                                                  setAddingPlacementToProductId(null)
                                                  setAddPlacementToProductForm({ placementId: '', addonFeeOverride: '' })
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                            </Stack>
                                          </Stack>
                                        </Paper>
                                      )}

                                      {/* ProductPlacements sub-table */}
                                      {assignedPlacements.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">No placements assigned to this product</Typography>
                                      ) : (
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Name</TableCell>
                                              <TableCell>Default Fee</TableCell>
                                              <TableCell>Override</TableCell>
                                              <TableCell>Effective Fee</TableCell>
                                              <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {assignedPlacements.map(pp => {
                                              const globalPlacement = placements.find(p => p.id === pp.placementId)
                                              const defaultFee = globalPlacement?.defaultAddonFee ?? 0
                                              const effectiveFee = pp.addonFeeOverride ?? defaultFee
                                              return (
                                                <TableRow key={pp.id}>
                                                  <TableCell>{globalPlacement?.name || pp.placementId}</TableCell>
                                                  <TableCell>${defaultFee.toFixed(2)}</TableCell>
                                                  <TableCell>{pp.addonFeeOverride != null ? `$${pp.addonFeeOverride.toFixed(2)}` : <Typography variant="body2" color="text.secondary">(default)</Typography>}</TableCell>
                                                  <TableCell>${effectiveFee.toFixed(2)}</TableCell>
                                                  <TableCell align="right">
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                      <Tooltip title="Edit fee override">
                                                        <IconButton size="small" onClick={() => {
                                                          setEditingProductPlacement(pp)
                                                          setProductPlacementFeeOverride(pp.addonFeeOverride != null ? String(pp.addonFeeOverride) : '')
                                                          setProductPlacementDialogOpen(true)
                                                        }}>
                                                          <EditIcon fontSize="small" />
                                                        </IconButton>
                                                      </Tooltip>
                                                      <Tooltip title="Remove from product">
                                                        <IconButton size="small" color="error" onClick={() => handleRemoveProductPlacement(pp)}>
                                                          <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                      </Tooltip>
                                                    </Stack>
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            })}
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
                </Paper>}
              </Paper>
            )}

            {/* Pricing Tab */}
            {activeTab === 3 && (
              <Paper sx={{ p: 3 }}>
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
                
                <Stack spacing={2}>
                  {/* Base Price */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Base Price</Typography>
                      <Typography variant="caption" color="text.secondary">Base price for this product</Typography>
                    </Box>
                    <Box>
                      <TextField
                        type="text"
                        size="small"
                        label="Base price ($)"
                        value={localBasePrice}
                        onChange={(e) => {
                          const validated = validateCurrencyInput(e.target.value)
                          setLocalBasePrice(validated)
                        }}
                        disabled={!selectedPricingProduct}
                      />
                    </Box>
                  </Paper>

                  {/* Price Per Day */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Price Per Day</Typography>
                      <Typography variant="caption" color="text.secondary">Additional price charged per day the ad runs</Typography>
                    </Box>
                    <Box>
                      <TextField
                        type="text"
                        size="small"
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
                    </Box>
                  </Paper>

                  {/* Line Count */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Line Count</Typography>
                      <Typography variant="caption" color="text.secondary">Price charged for each line of text</Typography>
                    </Box>
                    <Box>
                      <TextField
                        type="text"
                        size="small"
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
                    </Box>
                  </Paper>

                  {/* Word Count */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Word Count</Typography>
                      <Typography variant="caption" color="text.secondary">Price charged for each word in text blocks</Typography>
                    </Box>
                    <Box>
                      <TextField
                        type="text"
                        size="small"
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
                    </Box>
                  </Paper>

                  {/* Images */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Images</Typography>
                      <Typography variant="caption" color="text.secondary">Price charged for each image in the ad</Typography>
                    </Box>
                    <Box>
                      <TextField
                        type="text"
                        size="small"
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
                    </Box>
                  </Paper>

                  {/* Border Selection */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Border Selection</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {['none', 'thin', 'thick', 'dashed'].map(borderType => (
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
                      ))}
                    </Stack>
                  </Paper>

                  {/* Corner Options */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Corners</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {['flat', 'rounded'].map(cornerType => (
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
                      ))}
                    </Stack>
                  </Paper>

                  {/* Padding Options */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Padding</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {['none', 'medium', 'large'].map(paddingType => (
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
                      ))}
                    </Stack>
                  </Paper>

                  {/* Text Formatting */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Text Formatting</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {[
                        { key: 'pricePerBold', label: 'Bold Sections' },
                        { key: 'pricePerItalic', label: 'Italic Sections' },
                        { key: 'pricePerUnderline', label: 'Underline Sections' },
                      ].map(item => (
                        <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                      ))}
                    </Stack>
                  </Paper>

                  {/* Text Alignment */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Text Alignment</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {['left', 'center', 'right', 'justify'].map(alignType => (
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
                      ))}
                    </Stack>
                  </Paper>

                  {/* Text Size */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Text Size</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {['small', 'medium', 'large'].map(sizeType => (
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
                      ))}
                    </Stack>
                  </Paper>

                  {/* Font */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Font</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {['serif', 'sans-serif'].map(fontType => (
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
                      ))}
                    </Stack>
                  </Paper>

                  {/* Text Highlight */}
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Text Highlight</Typography>
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      {['none', 'black', 'gray'].map(highlightType => (
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
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
                
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

            {/* Discounts Tab */}
            {activeTab === 4 && (
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Discounts</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDiscountDialog()}>
                    Add Discount
                  </Button>
                </Box>

                {discounts.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No discounts configured. Click "Add Discount" to create one.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Trigger</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>Validity</TableCell>
                        <TableCell>Conditions</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {discounts.map(discount => {
                        const conds: DiscountConditions = discount.conditions
                          ? JSON.parse(discount.conditions)
                          : { productIds: [], placementIds: [], sectionIds: [], minPlacements: 0 }
                        const condSummary = [
                          conds.productIds?.length ? `${conds.productIds.length} product(s)` : null,
                          conds.placementIds?.length ? `${conds.placementIds.length} placement(s)` : null,
                          conds.sectionIds?.length ? `${conds.sectionIds.length} section(s)` : null,
                          conds.minPlacements > 0 ? `min ${conds.minPlacements} placements` : null,
                        ].filter(Boolean).join(', ') || 'No restrictions'
                        return (
                          <TableRow key={discount.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>{discount.name}</Typography>
                              {discount.description && (
                                <Typography variant="caption" color="text.secondary">{discount.description}</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {discount.code
                                ? <Chip size="small" label={`Code: ${discount.code}`} variant="outlined" />
                                : <Chip size="small" label="Automatic" color="primary" variant="outlined" />}
                            </TableCell>
                            <TableCell>
                              {discount.discountType === 'FLAT'
                                ? `-$${discount.value.toFixed(2)}`
                                : `-${discount.value}%`}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={discount.isActive ? 'Active' : 'Inactive'}
                                color={discount.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {discount.startDate || discount.endDate
                                  ? `${discount.startDate || '∞'} – ${discount.endDate || '∞'}`
                                  : 'Always'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">{condSummary}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleOpenDiscountDialog(discount)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => { setDeletingDiscountId(discount.id); setDeleteDiscountDialogOpen(true) }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            )}

          </>
        )}
      </Box>

      {/* Discount Create/Edit Dialog */}
      <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Add Discount'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              required
              value={discountForm.name}
              onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={discountForm.description}
              onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
            />

            {/* Trigger type */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Trigger Type</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={discountForm.isAutomatic ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setDiscountForm({ ...discountForm, isAutomatic: true, code: '' })}
                >
                  Automatic
                </Button>
                <Button
                  variant={!discountForm.isAutomatic ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setDiscountForm({ ...discountForm, isAutomatic: false })}
                >
                  Coupon Code
                </Button>
              </Stack>
            </Box>

            {!discountForm.isAutomatic && (
              <TextField
                label="Coupon Code"
                fullWidth
                required
                value={discountForm.code}
                onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                helperText="Users enter this code at checkout"
              />
            )}

            {/* Discount type and value */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Discount Type</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={discountForm.discountType === 'FLAT' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setDiscountForm({ ...discountForm, discountType: 'FLAT' })}
                  >
                    Flat ($)
                  </Button>
                  <Button
                    variant={discountForm.discountType === 'PERCENTAGE' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setDiscountForm({ ...discountForm, discountType: 'PERCENTAGE' })}
                  >
                    Percentage (%)
                  </Button>
                </Stack>
              </Box>
              <TextField
                label={discountForm.discountType === 'FLAT' ? 'Amount ($)' : 'Percentage (%)'}
                type="number"
                size="small"
                value={discountForm.value}
                onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                inputProps={{ min: 0, max: discountForm.discountType === 'PERCENTAGE' ? 100 : undefined, step: '0.01' }}
                sx={{ width: 140, mt: 'auto' }}
              />
            </Box>

            {/* Active / validity */}
            <FormControlLabel
              control={
                <Switch
                  checked={discountForm.isActive}
                  onChange={(e) => setDiscountForm({ ...discountForm, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={discountForm.startDate}
                onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                value={discountForm.endDate}
                onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Optional"
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Conditions (automatic only) */}
            {discountForm.isAutomatic && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Conditions</Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  All set conditions must be met. Leave empty for no restriction.
                </Typography>
                <Stack spacing={2}>
                  {products.filter(p => !p.isArchived).length > 0 && (
                    <Box>
                      <Typography variant="caption" fontWeight={600}>Products (ad must use one of these)</Typography>
                      <Stack>
                        {products.filter(p => !p.isArchived).map(p => (
                          <FormControlLabel
                            key={p.id}
                            control={
                              <Checkbox
                                size="small"
                                checked={discountForm.conditionProductIds.includes(p.id)}
                                onChange={(e) => {
                                  const ids = e.target.checked
                                    ? [...discountForm.conditionProductIds, p.id]
                                    : discountForm.conditionProductIds.filter(id => id !== p.id)
                                  setDiscountForm({ ...discountForm, conditionProductIds: ids })
                                }}
                              />
                            }
                            label={<Typography variant="body2">{p.name}</Typography>}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {placements.filter(p => !p.isArchived).length > 0 && (
                    <Box>
                      <Typography variant="caption" fontWeight={600}>Placements (at least one must be selected)</Typography>
                      <Stack>
                        {placements.filter(p => !p.isArchived).map(p => (
                          <FormControlLabel
                            key={p.id}
                            control={
                              <Checkbox
                                size="small"
                                checked={discountForm.conditionPlacementIds.includes(p.id)}
                                onChange={(e) => {
                                  const ids = e.target.checked
                                    ? [...discountForm.conditionPlacementIds, p.id]
                                    : discountForm.conditionPlacementIds.filter(id => id !== p.id)
                                  setDiscountForm({ ...discountForm, conditionPlacementIds: ids })
                                }}
                              />
                            }
                            label={<Typography variant="body2">{p.name}</Typography>}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {sections.filter(s => !s.isArchived).length > 0 && (
                    <Box>
                      <Typography variant="caption" fontWeight={600}>Sections (at least one must be selected)</Typography>
                      <Stack>
                        {sections.filter(s => !s.isArchived).map(s => (
                          <FormControlLabel
                            key={s.id}
                            control={
                              <Checkbox
                                size="small"
                                checked={discountForm.conditionSectionIds.includes(s.id)}
                                onChange={(e) => {
                                  const ids = e.target.checked
                                    ? [...discountForm.conditionSectionIds, s.id]
                                    : discountForm.conditionSectionIds.filter(id => id !== s.id)
                                  setDiscountForm({ ...discountForm, conditionSectionIds: ids })
                                }}
                              />
                            }
                            label={<Typography variant="body2">{s.name}</Typography>}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <TextField
                    label="Minimum Placements"
                    type="number"
                    size="small"
                    value={discountForm.conditionMinPlacements}
                    onChange={(e) => setDiscountForm({ ...discountForm, conditionMinPlacements: e.target.value })}
                    inputProps={{ min: 0, step: 1 }}
                    helperText="Discount applies when user selects this many placements (0 = no minimum)"
                    sx={{ maxWidth: 260 }}
                  />
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDiscount} disabled={isLoading}>
            {editingDiscount ? 'Save Changes' : 'Create Discount'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Discount Confirm Dialog */}
      <Dialog open={deleteDiscountDialogOpen} onClose={() => setDeleteDiscountDialogOpen(false)}>
        <DialogTitle>Delete Discount</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this discount? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDiscountDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteDiscount} disabled={isLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Product Placement Edit Dialog */}
      {editingProductPlacement && (
        <Dialog open={productPlacementDialogOpen} onClose={() => { setProductPlacementDialogOpen(false); setEditingProductPlacement(null) }} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Fee Override</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {placements.find(p => p.id === editingProductPlacement.placementId)?.name}
                {' — default $'}{(placements.find(p => p.id === editingProductPlacement.placementId)?.defaultAddonFee ?? 0).toFixed(2)}
              </Typography>
              <TextField
                label="Fee Override (leave blank to use default)"
                type="number"
                fullWidth
                autoFocus
                value={productPlacementFeeOverride}
                onChange={e => setProductPlacementFeeOverride(e.target.value)}
                inputProps={{ step: 0.01, min: 0 }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setProductPlacementDialogOpen(false); setEditingProductPlacement(null) }}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateProductPlacementFee(editingProductPlacement, productPlacementFeeOverride)}>Save</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Placement Dialog */}
      <Dialog open={placementDialogOpen} onClose={() => { setPlacementDialogOpen(false); setEditingPlacement(null); setPlacementForm({ name: '', description: '', defaultAddonFee: 0 }) }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlacement ? 'Edit Placement' : 'Add Placement'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={placementForm.name}
              onChange={e => setPlacementForm(f => ({ ...f, name: e.target.value }))}
              required
              autoFocus
            />
            <TextField
              label="Description (optional)"
              fullWidth
              value={placementForm.description}
              onChange={e => setPlacementForm(f => ({ ...f, description: e.target.value }))}
            />
            <TextField
              label="Default Addon Fee ($)"
              type="number"
              fullWidth
              value={placementForm.defaultAddonFee === 0 ? 0 : placementForm.defaultAddonFee || ''}
              onChange={e => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                setPlacementForm(f => ({ ...f, defaultAddonFee: isNaN(val) ? 0 : val }))
              }}
              inputProps={{ step: 0.01, min: 0 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPlacementDialogOpen(false); setEditingPlacement(null); setPlacementForm({ name: '', description: '', defaultAddonFee: 0 }) }}>Cancel</Button>
          <Button variant="contained" disabled={!placementForm.name.trim()} onClick={handleSavePlacement}>Save</Button>
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
              value={productForm.basePrice === 0 ? 0 : productForm.basePrice || ''}
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
                disabled={!productForm.name.trim() || !productForm.widthInches || productForm.widthInches <= 0 || productForm.basePrice < 0}
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onClose={() => { setSectionDialogOpen(false); setEditingSection(null); setSectionForm({ name: '', description: '', defaultAddonFee: 0 }) }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSection ? 'Edit Section' : 'Add Section'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth value={sectionForm.name} onChange={e => setSectionForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
            <TextField label="Description (optional)" fullWidth value={sectionForm.description} onChange={e => setSectionForm(f => ({ ...f, description: e.target.value }))} />
            <TextField
              label="Default Addon Fee ($)" type="number" fullWidth
              value={sectionForm.defaultAddonFee === 0 ? 0 : sectionForm.defaultAddonFee || ''}
              onChange={e => { const val = e.target.value === '' ? 0 : parseFloat(e.target.value); setSectionForm(f => ({ ...f, defaultAddonFee: isNaN(val) ? 0 : val })) }}
              inputProps={{ step: 0.01, min: 0 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSectionDialogOpen(false); setEditingSection(null); setSectionForm({ name: '', description: '', defaultAddonFee: 0 }) }}>Cancel</Button>
          <Button variant="contained" disabled={!sectionForm.name.trim()} onClick={handleSaveSection}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* SubSection Dialog */}
      <Dialog open={subSectionDialogOpen} onClose={() => { setSubSectionDialogOpen(false); setEditingSubSection(null); setSubSectionForm({ name: '', description: '', defaultAddonFee: 0 }) }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubSection ? 'Edit Sub-Section' : 'Add Sub-Section'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth value={subSectionForm.name} onChange={e => setSubSectionForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
            <TextField label="Description (optional)" fullWidth value={subSectionForm.description} onChange={e => setSubSectionForm(f => ({ ...f, description: e.target.value }))} />
            <TextField
              label="Default Addon Fee ($)" type="number" fullWidth
              value={subSectionForm.defaultAddonFee === 0 ? 0 : subSectionForm.defaultAddonFee || ''}
              onChange={e => { const val = e.target.value === '' ? 0 : parseFloat(e.target.value); setSubSectionForm(f => ({ ...f, defaultAddonFee: isNaN(val) ? 0 : val })) }}
              inputProps={{ step: 0.01, min: 0 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSubSectionDialogOpen(false); setEditingSubSection(null); setSubSectionForm({ name: '', description: '', defaultAddonFee: 0 }) }}>Cancel</Button>
          <Button variant="contained" disabled={!subSectionForm.name.trim()} onClick={handleSaveSubSection}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ProductSection fee override dialog */}
      {editingProductSection && (
        <Dialog open={productSectionDialogOpen} onClose={() => { setProductSectionDialogOpen(false); setEditingProductSection(null) }} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Section Fee Override</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {sections.find(s => s.id === editingProductSection.sectionId)?.name}
                {' — default $'}{(sections.find(s => s.id === editingProductSection.sectionId)?.defaultAddonFee ?? 0).toFixed(2)}
              </Typography>
              <TextField
                label="Fee Override (leave blank to use default)" type="number" fullWidth autoFocus
                value={productSectionFeeOverride}
                onChange={e => setProductSectionFeeOverride(e.target.value)}
                inputProps={{ step: 0.01, min: 0 }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setProductSectionDialogOpen(false); setEditingProductSection(null) }}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateProductSectionFee(editingProductSection, productSectionFeeOverride)}>Save</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* SectionSubSection fee override dialog */}
      {editingSectionSubSection && (
        <Dialog open={sectionSubSectionDialogOpen} onClose={() => { setSectionSubSectionDialogOpen(false); setEditingSectionSubSection(null) }} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Sub-Section Fee Override</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {subSections.find(s => s.id === editingSectionSubSection.subSectionId)?.name}
                {' — default $'}{(subSections.find(s => s.id === editingSectionSubSection.subSectionId)?.defaultAddonFee ?? 0).toFixed(2)}
              </Typography>
              <TextField
                label="Fee Override (leave blank to use default)" type="number" fullWidth autoFocus
                value={sectionSubSectionFeeOverride}
                onChange={e => setSectionSubSectionFeeOverride(e.target.value)}
                inputProps={{ step: 0.01, min: 0 }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setSectionSubSectionDialogOpen(false); setEditingSectionSubSection(null) }}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateSectionSubSectionFee(editingSectionSubSection, sectionSubSectionFeeOverride)}>Save</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add Sections to Product checklist dialog */}
      {addSectionsToProductId && (
        <Dialog open={addSectionsToProductOpen} onClose={() => { setAddSectionsToProductOpen(false); setSelectedSectionIds([]) }} maxWidth="sm" fullWidth>
          <DialogTitle>Add Sections to {products.find(p => p.id === addSectionsToProductId)?.name}</DialogTitle>
          <DialogContent>
            {(() => {
              const assignedIds = productSections.map(ps => ps.sectionId)
              const available = sections.filter(s => !s.isArchived && !assignedIds.includes(s.id))
              return available.length === 0 ? (
                <Typography color="text.secondary">All sections are already assigned.</Typography>
              ) : (
                <List dense>
                  {available.map(s => (
                    <ListItem key={s.id} disablePadding>
                      <FormControlLabel
                        sx={{ width: '100%', mx: 0 }}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedSectionIds.includes(s.id)}
                            onChange={e => setSelectedSectionIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                          />
                        }
                        label={
                          <Stack direction="row" justifyContent="space-between" sx={{ width: '100%', pr: 2 }}>
                            <Typography variant="body2">{s.name}</Typography>
                            <Typography variant="body2" color="text.secondary">${(s.defaultAddonFee || 0).toFixed(2)}</Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setAddSectionsToProductOpen(false); setSelectedSectionIds([]) }}>Cancel</Button>
            <Button onClick={() => {
              const assignedIds = productSections.map(ps => ps.sectionId)
              const allIds = sections.filter(s => !s.isArchived && !assignedIds.includes(s.id)).map(s => s.id)
              handleAddSectionsToProduct(addSectionsToProductId!, allIds)
            }}>Add All</Button>
            <Button variant="contained" disabled={selectedSectionIds.length === 0} onClick={() => handleAddSectionsToProduct(addSectionsToProductId!, selectedSectionIds)}>
              Add Selected
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add Sub-Sections to Section checklist dialog */}
      {addSubSectionsToSectionId && (
        <Dialog open={addSubSectionsToSectionOpen} onClose={() => { setAddSubSectionsToSectionOpen(false); setSelectedSubSectionIds([]) }} maxWidth="sm" fullWidth>
          <DialogTitle>Add Sub-Sections to {sections.find(s => s.id === addSubSectionsToSectionId)?.name}</DialogTitle>
          <DialogContent>
            {(() => {
              const assignedIds = sectionSubSections.map(ss => ss.subSectionId)
              const available = subSections.filter(ss => !ss.isArchived && !assignedIds.includes(ss.id))
              return available.length === 0 ? (
                <Typography color="text.secondary">All sub-sections are already assigned.</Typography>
              ) : (
                <List dense>
                  {available.map(ss => (
                    <ListItem key={ss.id} disablePadding>
                      <FormControlLabel
                        sx={{ width: '100%', mx: 0 }}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedSubSectionIds.includes(ss.id)}
                            onChange={e => setSelectedSubSectionIds(prev => e.target.checked ? [...prev, ss.id] : prev.filter(id => id !== ss.id))}
                          />
                        }
                        label={
                          <Stack direction="row" justifyContent="space-between" sx={{ width: '100%', pr: 2 }}>
                            <Typography variant="body2">{ss.name}</Typography>
                            <Typography variant="body2" color="text.secondary">${(ss.defaultAddonFee || 0).toFixed(2)}</Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setAddSubSectionsToSectionOpen(false); setSelectedSubSectionIds([]) }}>Cancel</Button>
            <Button onClick={() => {
              const assignedIds = sectionSubSections.map(ss => ss.subSectionId)
              const allIds = subSections.filter(ss => !ss.isArchived && !assignedIds.includes(ss.id)).map(ss => ss.id)
              handleAddSubSectionsToSection(addSubSectionsToSectionId!, allIds)
            }}>Add All</Button>
            <Button variant="contained" disabled={selectedSubSectionIds.length === 0} onClick={() => handleAddSubSectionsToSection(addSubSectionsToSectionId!, selectedSubSectionIds)}>
              Add Selected
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

