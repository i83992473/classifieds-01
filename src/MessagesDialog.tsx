import { useState, useEffect } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { generateClient } from 'aws-amplify/api'
import { getUrl } from 'aws-amplify/storage'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Badge,
  Chip,
  Paper,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ReplyIcon from '@mui/icons-material/Reply'
import MailIcon from '@mui/icons-material/Mail'
import DraftsIcon from '@mui/icons-material/Drafts'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

const listMessagesQuery = /* GraphQL */ `
  query ListMessages($filter: ModelMessageFilterInput) {
    listMessages(filter: $filter) {
      items {
        id
        senderId
        senderEmail
        recipientId
        recipientEmail
        subject
        body
        read
        archived
        important
        createdAt
      }
    }
  }
`

const updateMessageMutation = /* GraphQL */ `
  mutation UpdateMessage($input: UpdateMessageInput!) {
    updateMessage(input: $input) {
      id
      read
      archived
      important
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

const getAdQuery = /* GraphQL */ `
  query GetAd($id: ID!) {
    getAd(id: $id) {
      id
      title
      owner
      pdfKey
    }
  }
`


interface Message {
  id: string
  senderId: string
  senderEmail: string
  recipientId: string
  recipientEmail: string
  subject?: string
  body: string
  read: boolean
  archived?: boolean
  important?: boolean
  createdAt: string
}

interface MessagesDialogProps {
  open: boolean
  onClose: () => void
  unreadCount: number
  onUnreadCountChange: (count: number) => void
  onNavigateToAdmin?: (adId: string) => void // Callback to navigate to admin dashboard with ad filter
}

export default function MessagesDialog({ open, onClose, unreadCount, onUnreadCountChange, onNavigateToAdmin }: MessagesDialogProps) {
  const client = generateClient()
  const { user } = useAuthenticator()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isReplying, setIsReplying] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)

  useEffect(() => {
    if (open) {
      loadMessages()
    }
  }, [open])

  const loadMessages = async () => {
    if (!user?.userId) return
    setIsLoading(true)
    try {
      const result = await client.graphql({
        query: listMessagesQuery,
        variables: {
          filter: {
            recipientId: { eq: user.userId }
          }
        },
        authMode: 'userPool'
      }) as { data: { listMessages: { items: Message[] } } }
      
      const msgs = result.data.listMessages.items || []
      // Filter out archived messages
      const activeMessages = msgs.filter(m => !m.archived)
      activeMessages.sort((a, b) => {
        // Sort by important first, then by date
        if (a.important && !b.important) return -1
        if (!a.important && b.important) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setMessages(activeMessages)
      
      const unread = activeMessages.filter(m => !m.read).length
      onUnreadCountChange(unread)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message)
    setIsReplying(false)
    setPdfUrl(null) // Reset PDF URL
    
    // If message is about ad submission, try to load PDF
    if (message.body.includes('Ad ID:') && message.body.includes('submitted for approval')) {
      const adIdMatch = message.body.match(/Ad ID: ([a-zA-Z0-9-]+)/)
      if (adIdMatch && adIdMatch[1]) {
        loadPdfForAd(adIdMatch[1])
      }
    }
    
    if (!message.read) {
      try {
        await client.graphql({
          query: updateMessageMutation,
          variables: { input: { id: message.id, read: true } },
          authMode: 'userPool'
        })
        setMessages(msgs => msgs.map(m => m.id === message.id ? { ...m, read: true } : m))
        onUnreadCountChange(Math.max(0, unreadCount - 1))
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  const loadPdfForAd = async (adId: string) => {
    setIsLoadingPdf(true)
    try {
      const result = await client.graphql({
        query: getAdQuery,
        variables: { id: adId },
        authMode: 'userPool'
      }) as { data: { getAd: { id: string; pdfKey: string | null } | null } }
      
      if (result.data?.getAd?.pdfKey) {
        const urlResult = await getUrl({ path: result.data.getAd.pdfKey })
        setPdfUrl(urlResult.url.toString())
      }
    } catch (error) {
      console.error('Error loading PDF:', error)
    } finally {
      setIsLoadingPdf(false)
    }
  }

  const handleOpenPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyBody.trim()) return
    
    try {
      await client.graphql({
        query: createMessageMutation,
        variables: {
          input: {
            senderId: user?.userId,
            senderEmail: user?.signInDetails?.loginId,
            recipientId: selectedMessage.senderId,
            recipientEmail: selectedMessage.senderEmail,
            subject: `Re: ${selectedMessage.subject || 'No Subject'}`,
            body: replyBody,
            read: false
          }
        },
        authMode: 'userPool'
      })
      
      setReplyBody('')
      setIsReplying(false)
      setSelectedMessage(null)
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {selectedMessage && (
              <IconButton size="small" onClick={() => setSelectedMessage(null)}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6">
              {selectedMessage ? selectedMessage.subject || 'Message' : 'Messages'}
            </Typography>
            {!selectedMessage && unreadCount > 0 && (
              <Chip size="small" label={`${unreadCount} unread`} color="primary" />
            )}
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : selectedMessage ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  From: {selectedMessage.senderEmail}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(selectedMessage.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                {selectedMessage.body}
              </Typography>
              {/* Extract ad ID from message body if it contains "Ad ID:" */}
              {selectedMessage.body.includes('Ad ID:') && onNavigateToAdmin && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      const adIdMatch = selectedMessage.body.match(/Ad ID: ([a-zA-Z0-9-]+)/)
                      if (adIdMatch && adIdMatch[1]) {
                        onNavigateToAdmin(adIdMatch[1])
                        onClose()
                      }
                    }}
                  >
                    View in Admin Dashboard
                  </Button>
                </Box>
              )}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {!isReplying && (
                <>
                  <Button 
                    startIcon={<ReplyIcon />} 
                    variant="outlined" 
                    onClick={() => setIsReplying(true)}
                  >
                    Reply
                  </Button>
                  <Button 
                    startIcon={selectedMessage.important ? <StarIcon /> : <StarBorderIcon />}
                    variant="outlined"
                    color={selectedMessage.important ? 'warning' : 'inherit'}
                    onClick={async () => {
                      try {
                        await client.graphql({
                          query: updateMessageMutation,
                          variables: { 
                            input: { 
                              id: selectedMessage.id, 
                              important: !selectedMessage.important 
                            } 
                          },
                          authMode: 'userPool'
                        })
                        setMessages(msgs => msgs.map(m => 
                          m.id === selectedMessage.id 
                            ? { ...m, important: !selectedMessage.important } 
                            : m
                        ))
                        setSelectedMessage({ ...selectedMessage, important: !selectedMessage.important })
                      } catch (error) {
                        console.error('Error toggling important:', error)
                      }
                    }}
                  >
                    {selectedMessage.important ? 'Unstar' : 'Star'}
                  </Button>
                  <Button 
                    startIcon={<DeleteIcon />}
                    variant="outlined"
                    color="error"
                    onClick={async () => {
                      if (confirm('Archive this message?')) {
                        try {
                          // Mark as archived instead of deleting
                          await client.graphql({
                            query: updateMessageMutation,
                            variables: { 
                              input: { 
                                id: selectedMessage.id, 
                                archived: true 
                              } 
                            },
                            authMode: 'userPool'
                          })
                          setMessages(msgs => msgs.filter(m => m.id !== selectedMessage.id))
                          setSelectedMessage(null)
                          const remainingUnread = messages.filter(m => m.id !== selectedMessage.id && !m.read).length
                          onUnreadCountChange(remainingUnread)
                        } catch (error) {
                          console.error('Error archiving message:', error)
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Stack>
            {isReplying ? (
              <Stack spacing={2}>
                <TextField
                  label="Reply"
                  multiline
                  rows={4}
                  fullWidth
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={handleSendReply}>Send</Button>
                  <Button onClick={() => setIsReplying(false)}>Cancel</Button>
                </Stack>
              </Stack>
            ) : null}
            </Box>
            
            {/* PDF Thumbnail on right side */}
            {selectedMessage.body.includes('Ad ID:') && selectedMessage.body.includes('submitted for approval') && (
              <Box sx={{ width: 300, flexShrink: 0 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: pdfUrl ? 'pointer' : 'default',
                    '&:hover': pdfUrl ? { bgcolor: 'action.hover' } : {}
                  }}
                  onClick={pdfUrl ? handleOpenPdf : undefined}
                >
                  {isLoadingPdf ? (
                    <CircularProgress size={40} />
                  ) : pdfUrl ? (
                    <>
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: 'grey.100',
                        }}
                      >
                        <iframe
                          src={`${pdfUrl}#page=1&zoom=50`}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                          }}
                          title="PDF Preview"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<OpenInNewIcon />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenPdf()
                        }}
                        fullWidth
                      >
                        Open PDF in New Tab
                      </Button>
                    </>
                  ) : (
                    <>
                      <PictureAsPdfIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        PDF not available
                      </Typography>
                    </>
                  )}
                </Paper>
              </Box>
            )}
          </Box>
        ) : messages.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No messages
          </Typography>
        ) : (
          <List>
            {messages.map(message => (
              <ListItem
                key={message.id}
                onClick={() => handleSelectMessage(message)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
              >
                <ListItemIcon>
                  {message.read ? <DraftsIcon color="disabled" /> : <Badge color="primary" variant="dot"><MailIcon color="primary" /></Badge>}
                </ListItemIcon>
                <ListItemText
                  primary={message.subject || 'No Subject'}
                  secondary={`From: ${message.senderEmail} • ${new Date(message.createdAt).toLocaleDateString()}`}
                  primaryTypographyProps={{ fontWeight: message.read ? 'normal' : 'bold' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}



