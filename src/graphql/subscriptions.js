/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateAd = /* GraphQL */ `
  subscription OnCreateAd(
    $filter: ModelSubscriptionAdFilterInput
    $owner: String
  ) {
    onCreateAd(filter: $filter, owner: $owner) {
      id
      title
      content
      blocks
      widthInches
      status
      approved
      approvedAt
      approvedBy
      productName
      totalPrice
      imageKeys
      pdfKey
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateAd = /* GraphQL */ `
  subscription OnUpdateAd(
    $filter: ModelSubscriptionAdFilterInput
    $owner: String
  ) {
    onUpdateAd(filter: $filter, owner: $owner) {
      id
      title
      content
      blocks
      widthInches
      status
      approved
      approvedAt
      approvedBy
      productName
      totalPrice
      imageKeys
      pdfKey
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteAd = /* GraphQL */ `
  subscription OnDeleteAd(
    $filter: ModelSubscriptionAdFilterInput
    $owner: String
  ) {
    onDeleteAd(filter: $filter, owner: $owner) {
      id
      title
      content
      blocks
      widthInches
      status
      approved
      approvedAt
      approvedBy
      productName
      totalPrice
      imageKeys
      pdfKey
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onCreateUser(filter: $filter, id: $id) {
      id
      email
      isAdmin
      isBlocked
      contactName
      contactPhone
      contactEmail
      contactAddress
      contactCity
      contactState
      contactZip
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onUpdateUser(filter: $filter, id: $id) {
      id
      email
      isAdmin
      isBlocked
      contactName
      contactPhone
      contactEmail
      contactAddress
      contactCity
      contactState
      contactZip
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onDeleteUser(filter: $filter, id: $id) {
      id
      email
      isAdmin
      isBlocked
      contactName
      contactPhone
      contactEmail
      contactAddress
      contactCity
      contactState
      contactZip
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $senderId: String
    $recipientId: String
  ) {
    onCreateMessage(
      filter: $filter
      senderId: $senderId
      recipientId: $recipientId
    ) {
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
      updatedAt
      __typename
    }
  }
`;
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $senderId: String
    $recipientId: String
  ) {
    onUpdateMessage(
      filter: $filter
      senderId: $senderId
      recipientId: $recipientId
    ) {
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
      updatedAt
      __typename
    }
  }
`;
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $senderId: String
    $recipientId: String
  ) {
    onDeleteMessage(
      filter: $filter
      senderId: $senderId
      recipientId: $recipientId
    ) {
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
      updatedAt
      __typename
    }
  }
`;
export const onCreateProduct = /* GraphQL */ `
  subscription OnCreateProduct($filter: ModelSubscriptionProductFilterInput) {
    onCreateProduct(filter: $filter) {
      id
      name
      widthInches
      basePrice
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateProduct = /* GraphQL */ `
  subscription OnUpdateProduct($filter: ModelSubscriptionProductFilterInput) {
    onUpdateProduct(filter: $filter) {
      id
      name
      widthInches
      basePrice
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteProduct = /* GraphQL */ `
  subscription OnDeleteProduct($filter: ModelSubscriptionProductFilterInput) {
    onDeleteProduct(filter: $filter) {
      id
      name
      widthInches
      basePrice
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreatePricingSetting = /* GraphQL */ `
  subscription OnCreatePricingSetting(
    $filter: ModelSubscriptionPricingSettingFilterInput
  ) {
    onCreatePricingSetting(filter: $filter) {
      id
      key
      value
      label
      description
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const onUpdatePricingSetting = /* GraphQL */ `
  subscription OnUpdatePricingSetting(
    $filter: ModelSubscriptionPricingSettingFilterInput
  ) {
    onUpdatePricingSetting(filter: $filter) {
      id
      key
      value
      label
      description
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const onDeletePricingSetting = /* GraphQL */ `
  subscription OnDeletePricingSetting(
    $filter: ModelSubscriptionPricingSettingFilterInput
  ) {
    onDeletePricingSetting(filter: $filter) {
      id
      key
      value
      label
      description
      updatedAt
      createdAt
      __typename
    }
  }
`;
