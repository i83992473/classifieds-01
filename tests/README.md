# Playwright Test Suite

This directory contains end-to-end tests for the Classified Ad Builder application using Playwright.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test tests/landing-page.spec.ts
```

## Test Files

- `landing-page.spec.ts` - Tests for the landing page
- `app-navigation.spec.ts` - Tests for application navigation
- `admin-dashboard.spec.ts` - Tests for admin dashboard functionality
- `pricing-matrix.spec.ts` - Tests for pricing matrix
- `ad-creation.spec.ts` - Tests for ad creation flow
- `ui-components.spec.ts` - Tests for UI components and responsiveness
- `application-flow.spec.ts` - Comprehensive application flow tests

## Configuration

Tests are configured in `playwright.config.ts`. The configuration:
- Uses Chromium, Firefox, and WebKit browsers
- Automatically starts the dev server before tests
- Runs tests on `http://localhost:5173`
- Generates HTML reports on failure

## Authentication

Note: The current tests don't include authentication flows as they require AWS Cognito credentials. To test authenticated features:

1. Set up test credentials in environment variables
2. Use Playwright's authentication state storage
3. Create authenticated test fixtures

## Viewing Test Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```



