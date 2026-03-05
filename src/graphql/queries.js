/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAd = /* GraphQL */ `
  query GetAd($id: ID!) {
    getAd(id: $id) {
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
export const listAds = /* GraphQL */ `
  query ListAds($filter: ModelAdFilterInput, $limit: Int, $nextToken: String) {
    listAds(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
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
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
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
export const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        widthInches
        basePrice
        isArchived
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPricingSetting = /* GraphQL */ `
  query GetPricingSetting($id: ID!) {
    getPricingSetting(id: $id) {
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
export const listPricingSettings = /* GraphQL */ `
  query ListPricingSettings(
    $filter: ModelPricingSettingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPricingSettings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        key
        value
        label
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPlacement = /* GraphQL */ `
  query GetPlacement($id: ID!) {
    getPlacement(id: $id) {
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
export const listPlacements = /* GraphQL */ `
  query ListPlacements($filter: ModelPlacementFilterInput, $limit: Int, $nextToken: String) {
    listPlacements(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        defaultAddonFee
        isArchived
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getProductPlacement = /* GraphQL */ `
  query GetProductPlacement($id: ID!) {
    getProductPlacement(id: $id) {
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
export const listProductPlacements = /* GraphQL */ `
  query ListProductPlacements($filter: ModelProductPlacementFilterInput, $limit: Int, $nextToken: String) {
    listProductPlacements(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        productId
        placementId
        addonFeeOverride
        isArchived
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSection = /* GraphQL */ `
  query GetSection($id: ID!) {
    getSection(id: $id) {
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
export const listSections = /* GraphQL */ `
  query ListSections($filter: ModelSectionFilterInput, $limit: Int, $nextToken: String) {
    listSections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        defaultAddonFee
        isArchived
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSubSection = /* GraphQL */ `
  query GetSubSection($id: ID!) {
    getSubSection(id: $id) {
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
export const listSubSections = /* GraphQL */ `
  query ListSubSections($filter: ModelSubSectionFilterInput, $limit: Int, $nextToken: String) {
    listSubSections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        defaultAddonFee
        isArchived
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getProductSection = /* GraphQL */ `
  query GetProductSection($id: ID!) {
    getProductSection(id: $id) {
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
export const listProductSections = /* GraphQL */ `
  query ListProductSections($filter: ModelProductSectionFilterInput, $limit: Int, $nextToken: String) {
    listProductSections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSectionSubSection = /* GraphQL */ `
  query GetSectionSubSection($id: ID!) {
    getSectionSubSection(id: $id) {
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
export const listSectionSubSections = /* GraphQL */ `
  query ListSectionSubSections($filter: ModelSectionSubSectionFilterInput, $limit: Int, $nextToken: String) {
    listSectionSubSections(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
