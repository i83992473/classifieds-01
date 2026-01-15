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
      owner
      createdAt
      updatedAt
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
        owner
        createdAt
        updatedAt
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
      updatedAt
      createdAt
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
        updatedAt
        createdAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
