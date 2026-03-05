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
      previewUrl
      owner
      createdAt
      updatedAt
      placementIds
      sectionIds
      subSectionIds
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
      previewUrl
      owner
      createdAt
      updatedAt
      placementIds
      sectionIds
      subSectionIds
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
      previewUrl
      owner
      createdAt
      updatedAt
      placementIds
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
      adCount
      archivedAdCount
      totalSpending
      lastActive
      paymentMethod
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
      adCount
      archivedAdCount
      totalSpending
      lastActive
      paymentMethod
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
      adCount
      archivedAdCount
      totalSpending
      lastActive
      paymentMethod
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
      sentAt
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
      sentAt
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
      sentAt
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
      createdAt
      updatedAt
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
      createdAt
      updatedAt
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPlacement = /* GraphQL */ `
  mutation CreatePlacement($input: CreatePlacementInput!, $condition: ModelPlacementConditionInput) {
    createPlacement(input: $input, condition: $condition) {
      id
      name
      description
      defaultAddonFee
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePlacement = /* GraphQL */ `
  mutation UpdatePlacement($input: UpdatePlacementInput!, $condition: ModelPlacementConditionInput) {
    updatePlacement(input: $input, condition: $condition) {
      id
      name
      description
      defaultAddonFee
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePlacement = /* GraphQL */ `
  mutation DeletePlacement($input: DeletePlacementInput!, $condition: ModelPlacementConditionInput) {
    deletePlacement(input: $input, condition: $condition) {
      id
      name
      description
      defaultAddonFee
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createProductPlacement = /* GraphQL */ `
  mutation CreateProductPlacement($input: CreateProductPlacementInput!, $condition: ModelProductPlacementConditionInput) {
    createProductPlacement(input: $input, condition: $condition) {
      id
      productId
      placementId
      addonFeeOverride
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateProductPlacement = /* GraphQL */ `
  mutation UpdateProductPlacement($input: UpdateProductPlacementInput!, $condition: ModelProductPlacementConditionInput) {
    updateProductPlacement(input: $input, condition: $condition) {
      id
      productId
      placementId
      addonFeeOverride
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteProductPlacement = /* GraphQL */ `
  mutation DeleteProductPlacement($input: DeleteProductPlacementInput!, $condition: ModelProductPlacementConditionInput) {
    deleteProductPlacement(input: $input, condition: $condition) {
      id
      productId
      placementId
      addonFeeOverride
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSection = /* GraphQL */ `
  mutation CreateSection($input: CreateSectionInput!, $condition: ModelSectionConditionInput) {
    createSection(input: $input, condition: $condition) {
      id
      name
      description
      defaultAddonFee
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSection = /* GraphQL */ `
  mutation UpdateSection($input: UpdateSectionInput!, $condition: ModelSectionConditionInput) {
    updateSection(input: $input, condition: $condition) {
      id
      name
      description
      defaultAddonFee
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSection = /* GraphQL */ `
  mutation DeleteSection($input: DeleteSectionInput!, $condition: ModelSectionConditionInput) {
    deleteSection(input: $input, condition: $condition) {
      id
      __typename
    }
  }
`;
export const createSubSection = /* GraphQL */ `
  mutation CreateSubSection($input: CreateSubSectionInput!, $condition: ModelSubSectionConditionInput) {
    createSubSection(input: $input, condition: $condition) {
      id
      name
      description
      defaultAddonFee
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSubSection = /* GraphQL */ `
  mutation UpdateSubSection($input: UpdateSubSectionInput!, $condition: ModelSubSectionConditionInput) {
    updateSubSection(input: $input, condition: $condition) {
      id
      name
      description
      defaultAddonFee
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSubSection = /* GraphQL */ `
  mutation DeleteSubSection($input: DeleteSubSectionInput!, $condition: ModelSubSectionConditionInput) {
    deleteSubSection(input: $input, condition: $condition) {
      id
      __typename
    }
  }
`;
export const createProductSection = /* GraphQL */ `
  mutation CreateProductSection($input: CreateProductSectionInput!, $condition: ModelProductSectionConditionInput) {
    createProductSection(input: $input, condition: $condition) {
      id
      productId
      sectionId
      sortOrder
      addonFeeOverride
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateProductSection = /* GraphQL */ `
  mutation UpdateProductSection($input: UpdateProductSectionInput!, $condition: ModelProductSectionConditionInput) {
    updateProductSection(input: $input, condition: $condition) {
      id
      productId
      sectionId
      sortOrder
      addonFeeOverride
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteProductSection = /* GraphQL */ `
  mutation DeleteProductSection($input: DeleteProductSectionInput!, $condition: ModelProductSectionConditionInput) {
    deleteProductSection(input: $input, condition: $condition) {
      id
      __typename
    }
  }
`;
export const createSectionSubSection = /* GraphQL */ `
  mutation CreateSectionSubSection($input: CreateSectionSubSectionInput!, $condition: ModelSectionSubSectionConditionInput) {
    createSectionSubSection(input: $input, condition: $condition) {
      id
      sectionId
      subSectionId
      sortOrder
      addonFeeOverride
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSectionSubSection = /* GraphQL */ `
  mutation UpdateSectionSubSection($input: UpdateSectionSubSectionInput!, $condition: ModelSectionSubSectionConditionInput) {
    updateSectionSubSection(input: $input, condition: $condition) {
      id
      sectionId
      subSectionId
      sortOrder
      addonFeeOverride
      isArchived
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSectionSubSection = /* GraphQL */ `
  mutation DeleteSectionSubSection($input: DeleteSectionSubSectionInput!, $condition: ModelSectionSubSectionConditionInput) {
    deleteSectionSubSection(input: $input, condition: $condition) {
      id
      __typename
    }
  }
`;
