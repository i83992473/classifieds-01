import { a, defineData, type ClientSchema } from '@aws-amplify/backend'

const schema = a.schema({
  User: a.model({
    email: a.string().required(),
    name: a.string(),
    phone: a.string(),
    address: a.string(),
    isAdmin: a.boolean().default(false),
    isBlocked: a.boolean().default(false),
    adCount: a.integer().default(0),
    archivedAdCount: a.integer().default(0),
    totalSpending: a.float().default(0),
    lastActive: a.datetime(),
    paymentMethod: a.string(),
  }).authorization(allow => [allow.owner()]),
  Product: a.model({
    name: a.string().required(),
    widthInches: a.float().required(),
    basePrice: a.float().required(),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [allow.owner()]),
  Ad: a.model({
    title: a.string().required(),
    status: a.string().default('DRAFT'),
    owner: a.string(),
    productName: a.string(),
    totalPrice: a.float(),
    createdAt: a.datetime(),
    pdfKey: a.string(),
    previewUrl: a.string(),
  }).authorization(allow => [allow.owner()]),
  Pricing: a.model({
    productId: a.string().required(),
    key: a.string().required(),
    value: a.float().required(),
  }).authorization(allow => [allow.owner()]),
  Message: a.model({
    subject: a.string().required(),
    body: a.string().required(),
    recipientEmail: a.string().required(),
    senderEmail: a.string().required(),
    sentAt: a.datetime(),
  }).authorization(allow => [allow.owner()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
