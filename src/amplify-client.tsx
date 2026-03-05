import { Amplify } from 'aws-amplify'
import { Authenticator, ThemeProvider, createTheme } from '@aws-amplify/ui-react'
import type { ReactNode } from 'react'
import '@aws-amplify/ui-react/styles.css'
import outputs from '../amplify_outputs.json'

const outputKeys = Object.keys(outputs ?? {})
if (outputKeys.length > 1) {
  Amplify.configure(outputs)
} else {
  console.warn('Amplify outputs not configured. Skipping Amplify.configure.')
}

const greyscaleTheme = createTheme({
  name: 'greyscale',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: '#f0f1f2' },
          20: { value: '#d3d6da' },
          40: { value: '#a5abb2' },
          60: { value: '#6b7077' },
          80: { value: '#4b4f55' },
          90: { value: '#3b3f44' },
          100: { value: '#24282d' },
        },
      },
    },
    components: {
      authenticator: {
        router: {
          borderColor: { value: '#c3c7cc' },
          boxShadow: { value: '0 14px 40px rgba(29, 31, 34, 0.08)' },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: '#4b4f55' },
          _hover: { backgroundColor: { value: '#3b3f44' } },
          _focus: { backgroundColor: { value: '#3b3f44' } },
          _active: { backgroundColor: { value: '#2f3338' } },
        },
        link: {
          color: { value: '#4b4f55' },
          _hover: { color: { value: '#3b3f44' } },
        },
      },
    },
  },
})

export function withAuthenticator(children: ReactNode) {
  return (
    <ThemeProvider theme={greyscaleTheme}>
      <Authenticator
        className="greyscale-auth"
        formFields={{
          signIn: {
            username: { label: 'Email', placeholder: 'Enter your email', isRequired: true },
          },
          signUp: {
            email: { label: 'Email', placeholder: 'Enter your email', isRequired: true },
            password: { label: 'Password', placeholder: 'Create a strong password', isRequired: true },
            confirm_password: { label: 'Confirm Password', placeholder: 'Re-enter your password', isRequired: true },
          },
          confirmSignUp: {
            confirmation_code: { label: 'Verification Code', placeholder: 'Enter the code', isRequired: true },
          },
        }}
        hideSignUp={false}
        variation="modal"
      >
        {children}
      </Authenticator>
    </ThemeProvider>
  )
}
