# Deploy and Fix Build Errors

Automatically push code to GitHub, monitor Amplify build, and download error logs if build fails.

## Usage

This command will:
1. Stage and commit any uncommitted changes
2. Push to the main branch
3. Monitor the Amplify build status
4. Download and display build errors if the build fails
5. Show you the errors so you can share them with me to fix

## How to use

1. Run the PowerShell script: `.\deploy-and-fix.ps1`
2. Or with a custom commit message: `.\deploy-and-fix.ps1 -CommitMessage "Your message here"`
3. If build fails, share the errors with me and I'll fix them
4. Run the script again after fixes are applied

## Parameters

- `-CommitMessage`: Custom commit message (default: auto-generated timestamp)
- `-MaxAttempts`: Maximum polling attempts (default: 5)
- `-PollInterval`: Seconds between status checks (default: 30)
- `-MaxWaitTime`: Maximum seconds to wait for build (default: 1800 = 30 minutes)

## Example

```powershell
.\deploy-and-fix.ps1 -CommitMessage "Fix TypeScript errors"
```

