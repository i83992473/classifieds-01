import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'classified-files',
  access: (allow) => ({
    'public/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    'protected/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    'private/*': [allow.authenticated.to(['read', 'write', 'delete'])],
  }),
})
