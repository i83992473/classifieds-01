import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import type { ReactNode } from 'react'
import '@aws-amplify/ui-react/styles.css'
import outputs from '../amplify_outputs.json'

Amplify.configure(outputs)

export function withAuthenticator(children: ReactNode) {
  return <Authenticator>{children}</Authenticator>
}
