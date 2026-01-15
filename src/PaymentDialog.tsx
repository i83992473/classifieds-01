import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  IconButton,
  Divider,
  Alert,
  Stack,
  InputAdornment,
} from '@mui/material'
import {
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'

interface PaymentDialogProps {
  open: boolean
  onClose: () => void
  onPaymentSuccess: (paymentMethod: 'new' | 'saved') => void
  amount: number
  savedCard?: {
    last4: string
    brand: string
    expMonth: string
    expYear: string
  }
  onSaveCard?: (cardData: {
    number: string
    expMonth: string
    expYear: string
    cvv: string
  }) => void
  onUpdateCard?: (cardData: {
    number: string
    expMonth: string
    expYear: string
    cvv: string
  }) => void
  onRemoveCard?: () => void
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  onPaymentSuccess,
  amount,
  savedCard,
  onSaveCard,
  onUpdateCard,
  onRemoveCard,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'new' | 'saved'>(
    savedCard ? 'saved' : 'new'
  )
  const [cardNumber, setCardNumber] = useState('')
  const [expDate, setExpDate] = useState('') // MM/YY format
  const [cvv, setCvv] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (open) {
      setPaymentMethod(savedCard ? 'saved' : 'new')
      setCardNumber('')
      setExpDate('')
      setCvv('')
      setSaveCard(false)
      setError('')
      setIsEditing(false)
    }
  }, [open, savedCard])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const getCardBrand = (number: string): string => {
    const num = number.replace(/\s/g, '')
    if (/^4/.test(num)) return 'Visa'
    if (/^5[1-5]/.test(num)) return 'Mastercard'
    if (/^3[47]/.test(num)) return 'American Express'
    if (/^6(?:011|5)/.test(num)) return 'Discover'
    return 'Card'
  }

  const validateCard = (number: string): boolean => {
    const num = number.replace(/\s/g, '')
    // For mock payment processor: reject only 0000000000000000
    // All other card numbers are accepted (13-19 digits)
    if (num === '0000000000000000') {
      return false
    }
    // Accept any card number with 13-19 digits (except the declined one above)
    return num.length >= 13 && num.length <= 19 && /^\d+$/.test(num)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    setError('')
  }

  const formatExpDate = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Limit to 4 digits (MMYY)
    const limited = digits.slice(0, 4)
    
    // Format as MM/YY
    if (limited.length === 0) {
      return ''
    } else if (limited.length <= 2) {
      return limited
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}`
    }
  }

  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpDate(e.target.value)
    setExpDate(formatted)
    setError('')
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCvv(value)
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    
    if (paymentMethod === 'saved') {
      if (!cvv || cvv.length < 3) {
        setError('Please enter your CVV')
        return
      }
      setIsProcessing(true)
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsProcessing(false)
      onPaymentSuccess('saved')
      return
    }

    // Validate new card
    const cardNumberClean = cardNumber.replace(/\s/g, '')
    if (!cardNumberClean || cardNumberClean.length < 13) {
      setError('Please enter a valid card number')
      return
    }

    if (!validateCard(cardNumberClean)) {
      setError('Invalid card number. Please check and try again.')
      return
    }

    // Validate expiration date format (MM/YY)
    if (!expDate || expDate.length !== 5 || !expDate.includes('/')) {
      setError('Please enter a valid expiration date (MM/YY)')
      return
    }

    const [monthStr, yearStr] = expDate.split('/')
    const expMonthNum = parseInt(monthStr, 10)
    const expYearNum = parseInt(yearStr, 10)

    // Validate month (01-12)
    if (isNaN(expMonthNum) || expMonthNum < 1 || expMonthNum > 12) {
      setError('Please enter a valid expiration month (01-12)')
      return
    }

    // Validate year (2-digit, convert to full year)
    if (isNaN(expYearNum) || yearStr.length !== 2) {
      setError('Please enter a valid expiration year (YY)')
      return
    }

    // Convert 2-digit year to full year (assume 2000-2099)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentYearShort = currentYear % 100
    const currentMonth = currentDate.getMonth() + 1
    
    // Convert YY to YYYY (e.g., 25 -> 2025, 99 -> 2099)
    const fullYear = expYearNum >= currentYearShort ? 2000 + expYearNum : 2000 + expYearNum

    // Check if card is expired (must be after current month/year)
    if (fullYear < currentYear || (fullYear === currentYear && expMonthNum < currentMonth)) {
      setError('This card has expired. Please enter a future expiration date.')
      return
    }

    // Check if expiration is too far in the future (reasonable limit: 20 years)
    if (fullYear > currentYear + 20) {
      setError('Please enter a valid expiration date')
      return
    }

    if (!cvv || cvv.length < 3) {
      setError('Please enter your CVV')
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Save card if requested
    if (saveCard && onSaveCard) {
      const [monthStr, yearStr] = expDate.split('/')
      const expYearNum = parseInt(yearStr, 10)
      const currentYearShort = new Date().getFullYear() % 100
      const fullYear = expYearNum >= currentYearShort ? 2000 + expYearNum : 2000 + expYearNum
      
      await onSaveCard({
        number: cardNumberClean,
        expMonth: monthStr.padStart(2, '0'),
        expYear: fullYear.toString(),
        cvv,
      })
    }

    setIsProcessing(false)
    onPaymentSuccess('new')
  }

  const handleUpdateCard = async () => {
    setError('')
    
    const cardNumberClean = cardNumber.replace(/\s/g, '')
    if (!cardNumberClean || cardNumberClean.length < 13) {
      setError('Please enter a valid card number')
      return
    }

    if (!validateCard(cardNumberClean)) {
      setError('Invalid card number. Please check and try again.')
      return
    }

    // Validate expiration date format (MM/YY)
    if (!expDate || expDate.length !== 5 || !expDate.includes('/')) {
      setError('Please enter a valid expiration date (MM/YY)')
      return
    }

    const [monthStr, yearStr] = expDate.split('/')
    const expMonthNum = parseInt(monthStr, 10)
    const expYearNum = parseInt(yearStr, 10)

    // Validate month (01-12)
    if (isNaN(expMonthNum) || expMonthNum < 1 || expMonthNum > 12) {
      setError('Please enter a valid expiration month (01-12)')
      return
    }

    // Validate year (2-digit)
    if (isNaN(expYearNum) || yearStr.length !== 2) {
      setError('Please enter a valid expiration year (YY)')
      return
    }

    // Convert 2-digit year to full year
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentYearShort = currentYear % 100
    const currentMonth = currentDate.getMonth() + 1
    
    const fullYear = expYearNum >= currentYearShort ? 2000 + expYearNum : 2000 + expYearNum

    // Check if card is expired
    if (fullYear < currentYear || (fullYear === currentYear && expMonthNum < currentMonth)) {
      setError('This card has expired. Please enter a future expiration date.')
      return
    }

    if (!cvv || cvv.length < 3) {
      setError('Please enter your CVV')
      return
    }

    if (onUpdateCard) {
      setIsProcessing(true)
      await onUpdateCard({
        number: cardNumberClean,
        expMonth: monthStr.padStart(2, '0'),
        expYear: fullYear.toString(),
        cvv,
      })
      setIsProcessing(false)
      setIsEditing(false)
      setError('')
    }
  }

  const handleRemoveCard = async () => {
    if (window.confirm('Are you sure you want to remove your saved card?')) {
      if (onRemoveCard) {
        setIsProcessing(true)
        await onRemoveCard()
        setIsProcessing(false)
        setPaymentMethod('new')
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LockIcon color="primary" />
          <Typography variant="h6">Secure Payment</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Amount Display */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 2,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              ${amount.toFixed(2)}
            </Typography>
            <Typography variant="body2">Total Amount</Typography>
          </Box>

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          {/* Payment Method Selection */}
          {savedCard && !isEditing && (
            <FormControl component="fieldset">
              <FormLabel component="legend">Payment Method</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value as 'new' | 'saved')
                  setError('')
                }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    mb: 2,
                    border: paymentMethod === 'saved' ? 2 : 1,
                    borderColor: paymentMethod === 'saved' ? 'primary.main' : 'divider',
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="saved"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                          <Box display="flex" alignItems="center" gap={1}>
                            <CreditCardIcon />
                            <Typography>
                              {savedCard.brand} •••• {savedCard.last4}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expires {savedCard.expMonth}/{savedCard.expYear.slice(-2)}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsEditing(true)
                                setPaymentMethod('new')
                                // Convert saved card expiration to MM/YY format
                                const month = savedCard.expMonth.padStart(2, '0')
                                const year = savedCard.expYear.slice(-2)
                                setExpDate(`${month}/${year}`)
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveCard()
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
                <Card
                  variant="outlined"
                  sx={{
                    border: paymentMethod === 'new' ? 2 : 1,
                    borderColor: paymentMethod === 'new' ? 'primary.main' : 'divider',
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      value="new"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <CreditCardIcon />
                          <Typography>Use a new card</Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
              </RadioGroup>
            </FormControl>
          )}

          {/* Saved Card CVV Input */}
          {paymentMethod === 'saved' && savedCard && !isEditing && (
            <TextField
              label="CVV"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="123"
              inputProps={{ maxLength: 4 }}
              fullWidth
              required
              helperText="Enter the 3 or 4 digit code on the back of your card"
            />
          )}

          {/* New Card Form */}
          {(paymentMethod === 'new' || isEditing) && (
            <>
              <Divider>Card Information</Divider>
              
              <TextField
                label="Card Number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                inputProps={{ maxLength: 19 }}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                helperText={cardNumber ? `${getCardBrand(cardNumber)}` : 'Enter your card number'}
              />

              <Box display="flex" gap={2}>
                <TextField
                  label="Expiration Date"
                  value={expDate}
                  onChange={handleExpDateChange}
                  placeholder="MM/YY"
                  inputProps={{ maxLength: 5 }}
                  required
                  helperText="MM/YY"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="CVV"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  inputProps={{ maxLength: 4 }}
                  required
                  helperText="Security code"
                  sx={{ flex: 1 }}
                />
              </Box>

              {isEditing ? (
                <Button
                  variant="outlined"
                  onClick={handleUpdateCard}
                  disabled={isProcessing}
                  fullWidth
                >
                  Update Card
                </Button>
              ) : (
                <FormControlLabel
                  control={
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                    />
                  }
                  label="Save this card for future purchases"
                />
              )}
            </>
          )}

          {/* Security Notice */}
          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LockIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Your payment information is encrypted and secure. This is a mock payment system for demonstration purposes.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        {!isEditing && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isProcessing}
            startIcon={isProcessing ? <></> : <LockIcon />}
          >
            {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default PaymentDialog
