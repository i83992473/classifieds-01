# Automated Deployment Script

## What is this?

This is a **PowerShell script** that you run in your **terminal** (not a Cursor slash command). It automates the process of:
1. Committing and pushing your code
2. Monitoring the Amplify build
3. Downloading error logs if the build fails

## How to Use

### Option 1: Run in Terminal (Recommended)

1. **Open PowerShell terminal** in Cursor (or any terminal)
2. **Navigate to your project directory** (if not already there)
3. **Run the script**:
   ```powershell
   .\deploy-and-fix.ps1
   ```

### Option 2: With Custom Commit Message

```powershell
.\deploy-and-fix.ps1 -CommitMessage "Fixed TypeScript errors"
```

### Option 3: Custom Settings

```powershell
.\deploy-and-fix.ps1 -CommitMessage "My changes" -PollInterval 15 -MaxWaitTime 3600
```

## What Happens

1. ✅ **Checks for changes** - Stages and commits any uncommitted files
2. ✅ **Pushes to GitHub** - Pushes to the `main` branch
3. ✅ **Monitors build** - Watches Amplify build status in real-time
4. ✅ **Downloads logs** - If build fails, downloads and shows errors
5. ✅ **Shows errors** - Displays the first 30 error lines for easy sharing

## After Build Fails

When the build fails, the script will:
- Save the full log to `amplify-build-log-{jobId}.txt`
- Display the first 30 error lines in the terminal
- Tell you what to do next

**Then you can:**
1. Share the errors with me (Cursor AI) by copying them
2. I'll fix the issues
3. Run the script again to deploy the fixes

## Parameters

- `-CommitMessage`: Custom commit message (default: auto-generated)
- `-MaxAttempts`: How many times to check build status (default: 60)
- `-PollInterval`: Seconds between checks (default: 30)
- `-MaxWaitTime`: Maximum seconds to wait (default: 3600 = 1 hour)

## Example Workflow

```powershell
# 1. Make some code changes
# 2. Run the script
.\deploy-and-fix.ps1

# 3. If build fails, share errors with Cursor AI
# 4. After I fix the errors, run again
.\deploy-and-fix.ps1 -CommitMessage "Fixed build errors"
```

## Troubleshooting

**Script won't run?**
- Make sure you're in PowerShell (not CMD)
- Check execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Build taking too long?**
- Increase `-MaxWaitTime`: `.\deploy-and-fix.ps1 -MaxWaitTime 7200` (2 hours)

**Want faster updates?**
- Decrease `-PollInterval`: `.\deploy-and-fix.ps1 -PollInterval 10` (check every 10 seconds)

