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
  return <Authenticator>{children}</Authenticator>
}
