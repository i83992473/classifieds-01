import { useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  useTheme,
  alpha,
} from '@mui/material'
import NewspaperIcon from '@mui/icons-material/Newspaper'
import PeopleIcon from '@mui/icons-material/People'
import InventoryIcon from '@mui/icons-material/Inventory'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import ArchiveIcon from '@mui/icons-material/Archive'
import PublishIcon from '@mui/icons-material/Publish'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

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
  updatedAt?: string
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

interface Discount {
  id: string
  name: string
  code?: string
  discountType: 'FLAT' | 'PERCENTAGE'
  value: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

interface AdminOverviewProps {
  ads: Ad[]
  users: User[]
  products: Product[]
  discounts: Discount[]
  unreadMessageCount: number
  onNavigate: (section: number) => void
}

// Stat card component
function StatCard({ title, value, subtitle, icon, color, onClick }: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  onClick?: () => void
}) {
  const theme = useTheme()
  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.15s',
        '&:hover': onClick ? {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        } : {},
        border: `1px solid ${theme.palette.divider}`,
      }}
      onClick={onClick}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          color: color,
          display: 'flex',
          alignItems: 'center',
        }}>
          {icon}
        </Box>
      </Stack>
    </Paper>
  )
}

export default function AdminOverview({ ads, users, products, discounts, unreadMessageCount, onNavigate }: AdminOverviewProps) {
  const theme = useTheme()

  // Compute stats
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const pendingAds = ads.filter(a => a.status === 'PENDING_APPROVAL')
    const publishedAds = ads.filter(a => a.status === 'PUBLISHED')
    const approvedAds = ads.filter(a => a.status === 'APPROVED')
    const archivedAds = ads.filter(a => a.status === 'ARCHIVED')
    const notApprovedAds = ads.filter(a => a.status === 'NOT_APPROVED')

    const adsThisWeek = ads.filter(a => a.createdAt && new Date(a.createdAt) >= weekAgo)
    const adsToday = ads.filter(a => a.createdAt && new Date(a.createdAt) >= today)
    const usersThisWeek = users.filter(u => u.createdAt && new Date(u.createdAt) >= weekAgo)

    const totalRevenue = ads.reduce((sum, a) => sum + (a.totalPrice || 0), 0)
    const activeProducts = products.filter(p => !p.isArchived)
    const activeDiscounts = discounts.filter(d => d.isActive)
    const adminUsers = users.filter(u => u.isAdmin)
    const blockedUsers = users.filter(u => u.isBlocked)

    return {
      totalAds: ads.length,
      pendingAds: pendingAds.length,
      publishedAds: publishedAds.length,
      approvedAds: approvedAds.length,
      archivedAds: archivedAds.length,
      notApprovedAds: notApprovedAds.length,
      adsThisWeek: adsThisWeek.length,
      adsToday: adsToday.length,
      totalUsers: users.length,
      usersThisWeek: usersThisWeek.length,
      adminUsers: adminUsers.length,
      blockedUsers: blockedUsers.length,
      totalRevenue,
      activeProducts: activeProducts.length,
      totalProducts: products.length,
      activeDiscounts: activeDiscounts.length,
      totalDiscounts: discounts.length,
    }
  }, [ads, users, products, discounts])

  // Pie chart data for ad statuses
  const statusChartData = useMemo(() => {
    const data = [
      { name: 'Pending', value: stats.pendingAds, color: '#ed6c02' },
      { name: 'Approved', value: stats.approvedAds, color: '#2e7d32' },
      { name: 'Published', value: stats.publishedAds, color: '#1976d2' },
      { name: 'Not Approved', value: stats.notApprovedAds, color: '#d32f2f' },
      { name: 'Archived', value: stats.archivedAds, color: '#757575' },
    ].filter(d => d.value > 0)
    return data
  }, [stats])

  // Bar chart: ads created per day over last 14 days
  const adsOverTimeData = useMemo(() => {
    const days = 14
    const now = new Date()
    const data: { date: string; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const nextD = new Date(d.getTime() + 24 * 60 * 60 * 1000)
      const count = ads.filter(a => {
        if (!a.createdAt) return false
        const created = new Date(a.createdAt)
        return created >= d && created < nextD
      }).length
      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        count,
      })
    }
    return data
  }, [ads])

  // Recent ads (last 10)
  const recentAds = useMemo(() => {
    return [...ads]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 8)
  }, [ads])

  // Recent users (last 5)
  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5)
  }, [users])

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'warning'
      case 'APPROVED': return 'success'
      case 'PUBLISHED': return 'info'
      case 'NOT_APPROVED': return 'error'
      case 'ARCHIVED': return 'default'
      default: return 'default'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'Pending'
      case 'NOT_APPROVED': return 'Rejected'
      default: return status.charAt(0) + status.slice(1).toLowerCase()
    }
  }

  return (
    <Box>
      {/* Stat Cards Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            title="Total Ads"
            value={stats.totalAds}
            subtitle={`${stats.adsToday} today, ${stats.adsThisWeek} this week`}
            icon={<NewspaperIcon />}
            color={theme.palette.primary.main}
            onClick={() => onNavigate(1)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            title="Pending Approval"
            value={stats.pendingAds}
            subtitle="Awaiting review"
            icon={<PendingActionsIcon />}
            color="#ed6c02"
            onClick={() => onNavigate(1)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            title="Users"
            value={stats.totalUsers}
            subtitle={`${stats.usersThisWeek} new this week`}
            icon={<PeopleIcon />}
            color="#1976d2"
            onClick={() => onNavigate(2)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            title="Products"
            value={`${stats.activeProducts}/${stats.totalProducts}`}
            subtitle="Active / Total"
            icon={<InventoryIcon />}
            color="#7b1fa2"
            onClick={() => onNavigate(3)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle="From all ads"
            icon={<AttachMoneyIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard
            title="Messages"
            value={unreadMessageCount}
            subtitle="Unread"
            icon={<TrendingUpIcon />}
            color="#0288d1"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Ads by Status - Pie Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Ads by Status
            </Typography>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                <Typography color="text.secondary">No ads yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Ads Over Time - Bar Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              New Ads (Last 14 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={adsOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Ads Created"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row: Recent Activity + Quick Links */}
      <Grid container spacing={2}>
        {/* Recent Ads */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recent Ads
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => onNavigate(1)}>
                View All
              </Button>
            </Box>
            <Divider />
            <List dense disablePadding>
              {recentAds.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No ads yet" secondary="Ads will appear here when created" />
                </ListItem>
              ) : (
                recentAds.map((ad, i) => (
                  <Box key={ad.id}>
                    {i > 0 && <Divider component="li" />}
                    <ListItem sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {ad.status === 'PUBLISHED' ? <PublishIcon fontSize="small" color="info" /> :
                         ad.status === 'APPROVED' ? <CheckCircleIcon fontSize="small" color="success" /> :
                         ad.status === 'NOT_APPROVED' ? <BlockIcon fontSize="small" color="error" /> :
                         ad.status === 'ARCHIVED' ? <ArchiveIcon fontSize="small" /> :
                         <PendingActionsIcon fontSize="small" color="warning" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {ad.title || 'Untitled'}
                            </Typography>
                            <Chip label={statusLabel(ad.status)} color={statusColor(ad.status) as 'warning' | 'success' | 'info' | 'error' | 'default'} size="small" variant="outlined" />
                          </Stack>
                        }
                        secondary={`${ad.productName || 'No product'} ${ad.totalPrice ? `- $${ad.totalPrice.toFixed(2)}` : ''} ${ad.createdAt ? `- ${new Date(ad.createdAt).toLocaleDateString()}` : ''}`}
                      />
                    </ListItem>
                  </Box>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Users + Quick Stats */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            {/* Recent Users */}
            <Paper sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Recent Users
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => onNavigate(2)}>
                  View All
                </Button>
              </Box>
              <Divider />
              <List dense disablePadding>
                {recentUsers.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No users yet" />
                  </ListItem>
                ) : (
                  recentUsers.map((u, i) => (
                    <Box key={u.id}>
                      {i > 0 && <Divider component="li" />}
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">{u.email}</Typography>
                              {u.isAdmin && <Chip label="Admin" size="small" color="primary" />}
                              {u.isBlocked && <Chip label="Blocked" size="small" color="error" />}
                            </Stack>
                          }
                          secondary={u.createdAt ? `Joined ${new Date(u.createdAt).toLocaleDateString()}` : ''}
                        />
                      </ListItem>
                    </Box>
                  ))
                )}
              </List>
            </Paper>

            {/* Quick Summary */}
            <Paper sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Published Ads</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.publishedAds}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Admin Users</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.adminUsers}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Active Discounts</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocalOfferIcon fontSize="small" />
                          <span>{stats.activeDiscounts}</span>
                        </Stack>
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Approved (Unpublished)</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.approvedAds}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Blocked Users</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: stats.blockedUsers > 0 ? 'error.main' : 'text.primary' }}>{stats.blockedUsers}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Archived Ads</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.archivedAds}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
