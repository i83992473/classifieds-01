/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAd = /* GraphQL */ `
  mutation CreateAd($input: CreateAdInput!, $condition: ModelAdConditionInput) {
    createAd(input: $input, condition: $condition) {
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
export const updateAd = /* GraphQL */ `
  mutation UpdateAd($input: UpdateAdInput!, $condition: ModelAdConditionInput) {
    updateAd(input: $input, condition: $condition) {
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
export const deleteAd = /* GraphQL */ `
  mutation DeleteAd($input: DeleteAdInput!, $condition: ModelAdConditionInput) {
    deleteAd(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
      savedCardLast4
      savedCardBrand
      savedCardExpMonth
      savedCardExpYear
      savedCardCvv
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
      savedCardLast4
      savedCardBrand
      savedCardExpMonth
      savedCardExpYear
      savedCardCvv
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
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
export const createProduct = /* GraphQL */ `
  mutation CreateProduct(
    $input: CreateProductInput!
    $condition: ModelProductConditionInput
  ) {
    createProduct(input: $input, condition: $condition) {
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
export const updateProduct = /* GraphQL */ `
  mutation UpdateProduct(
    $input: UpdateProductInput!
    $condition: ModelProductConditionInput
  ) {
    updateProduct(input: $input, condition: $condition) {
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
export const deleteProduct = /* GraphQL */ `
  mutation DeleteProduct(
    $input: DeleteProductInput!
    $condition: ModelProductConditionInput
  ) {
    deleteProduct(input: $input, condition: $condition) {
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
export const createPricingSetting = /* GraphQL */ `
  mutation CreatePricingSetting(
    $input: CreatePricingSettingInput!
    $condition: ModelPricingSettingConditionInput
  ) {
    createPricingSetting(input: $input, condition: $condition) {
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
export const updatePricingSetting = /* GraphQL */ `
  mutation UpdatePricingSetting(
    $input: UpdatePricingSettingInput!
    $condition: ModelPricingSettingConditionInput
  ) {
    updatePricingSetting(input: $input, condition: $condition) {
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
export const deletePricingSetting = /* GraphQL */ `
  mutation DeletePricingSetting(
    $input: DeletePricingSettingInput!
    $condition: ModelPricingSettingConditionInput
  ) {
    deletePricingSetting(input: $input, condition: $condition) {
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
