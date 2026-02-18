import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import type { ReactNode } from 'react'
import '@aws-amplify/ui-react/styles.css'
import outputs from '../amplify_outputs.json'

const outputKeys = Object.keys(outputs ?? {})
if (outputKeys.length > 1) {
  Amplify.configure(outputs)
} else {
  console.warn('Amplify outputs not configured. Skipping Amplify.configure.')
}

export function withAuthenticator(children: ReactNode) {
  return (
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
  )
}
