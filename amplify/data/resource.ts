import { a, defineData, type ClientSchema } from '@aws-amplify/backend'

const schema = a.schema({
  Ad: a.model({
    title: a.string().required(),
    content: a.string(),
    blocks: a.string(),
    widthInches: a.float(),
    status: a.string().default('DRAFT'),
    approved: a.boolean().default(false),
    approvedAt: a.datetime(),
    approvedBy: a.string(),
    productName: a.string(),
    totalPrice: a.float(),
    imageKeys: a.string().array(),
    pdfKey: a.string(),
    previewUrl: a.string(),
    owner: a.string(),
    createdAt: a.datetime(),
    placementIds: a.string().array(),
    sectionIds: a.string().array(),
    subSectionIds: a.string().array(),
    appliedDiscounts: a.string(), // JSON snapshot: [{id, name, code, discountType, value, computedAmount}]
  }).authorization(allow => [
    allow.owner(),
    allow.group('Admin').to(['read', 'update']),
  ]),

  User: a.model({
    email: a.string().required(),
    isAdmin: a.boolean().default(false),
    isBlocked: a.boolean().default(false),
    contactName: a.string(),
    contactPhone: a.string(),
    contactEmail: a.string(),
    contactAddress: a.string(),
    contactCity: a.string(),
    contactState: a.string(),
    contactZip: a.string(),
    savedCardLast4: a.string(),
    savedCardBrand: a.string(),
    savedCardExpMonth: a.string(),
    savedCardExpYear: a.string(),
    savedCardCvv: a.string(),
    adCount: a.integer().default(0),
    archivedAdCount: a.integer().default(0),
    totalSpending: a.float().default(0),
    lastActive: a.datetime(),
    paymentMethod: a.string(),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
    allow.group('Admin').to(['read', 'update']),
  ]),

  Product: a.model({
    name: a.string().required(),
    widthInches: a.float().required(),
    basePrice: a.float().required(),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  PricingSetting: a.model({
    key: a.string().required(),
    value: a.float().required(),
    label: a.string(),
    description: a.string(),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  Placement: a.model({
    name: a.string().required(),
    description: a.string(),
    defaultAddonFee: a.float().default(0),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  ProductPlacement: a.model({
    productId: a.string().required(),
    placementId: a.string().required(),
    addonFeeOverride: a.float(),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  Section: a.model({
    name: a.string().required(),
    description: a.string(),
    defaultAddonFee: a.float().default(0),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  SubSection: a.model({
    name: a.string().required(),
    description: a.string(),
    defaultAddonFee: a.float().default(0),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  ProductSection: a.model({
    productId: a.string().required(),
    sectionId: a.string().required(),
    sortOrder: a.integer().default(0),
    addonFeeOverride: a.float(),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  SectionSubSection: a.model({
    sectionId: a.string().required(),
    subSectionId: a.string().required(),
    sortOrder: a.integer().default(0),
    addonFeeOverride: a.float(),
    isArchived: a.boolean().default(false),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  Discount: a.model({
    name: a.string().required(),
    description: a.string(),
    code: a.string(),              // null = automatic, non-null = coupon code
    discountType: a.string().required(), // 'FLAT' | 'PERCENTAGE'
    value: a.float().required(),
    isActive: a.boolean().default(true),
    startDate: a.string(),         // ISO date string, optional
    endDate: a.string(),           // ISO date string, optional
    conditions: a.string(),        // JSON: { productIds, placementIds, sectionIds, minPlacements }
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  SiteSettings: a.model({
    settingKey: a.string().required(),  // 'global' — single-record pattern
    colorScheme: a.string().default('greyscale'),
    splashContent: a.string(),  // JSON: { siteName, heroTitle, heroSubtitle, ctaText, cards: [{title, text, icon, imageKey}], heroIcon, heroImageKey }
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.group('Admin'),
  ]),

  Message: a.model({
    senderId: a.string(),
    senderEmail: a.string().required(),
    recipientId: a.string(),
    recipientEmail: a.string().required(),
    subject: a.string().required(),
    body: a.string().required(),
    read: a.boolean().default(false),
    archived: a.boolean().default(false),
    important: a.boolean().default(false),
    sentAt: a.datetime(),
    owners: a.string().array(), // [senderId, recipientId] — both parties can read/update
  }).authorization(allow => [allow.ownersDefinedIn('owners')]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
