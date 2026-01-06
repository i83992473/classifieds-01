# PowerShell script to check Amplify build status and logs
# Usage: .\check-amplify-build.ps1 [job-id]

param(
    [string]$JobId = "latest"
)

$AppId = "dva3ol6s006s"
$BranchName = "main"
$Region = "us-east-1"

Write-Host "Checking Amplify build status..." -ForegroundColor Cyan

if ($JobId -eq "latest") {
    Write-Host "Getting latest build..." -ForegroundColor Yellow
    $jobs = aws amplify list-jobs --app-id $AppId --branch-name $BranchName --region $Region --max-results 1 --output json | ConvertFrom-Json
    if ($jobs.jobSummaries.Count -gt 0) {
        $JobId = $jobs.jobSummaries[0].jobId
        Write-Host "Latest job ID: $JobId" -ForegroundColor Green
    } else {
        Write-Host "No jobs found" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Getting job details for job ID: $JobId..." -ForegroundColor Yellow
$job = aws amplify get-job --app-id $AppId --branch-name $BranchName --job-id $JobId --region $Region --output json | ConvertFrom-Json

Write-Host "`nJob Status: $($job.job.summary.status)" -ForegroundColor $(if ($job.job.summary.status -eq "SUCCEED") { "Green" } else { "Red" })
Write-Host "Commit: $($job.job.summary.commitMessage)" -ForegroundColor Cyan
Write-Host "Started: $($job.job.summary.startTime)" -ForegroundColor Cyan
Write-Host "Ended: $($job.job.summary.endTime)" -ForegroundColor Cyan

$buildStep = $job.job.steps | Where-Object { $_.stepName -eq "BUILD" }
if ($buildStep) {
    Write-Host "`nBuild Log URL:" -ForegroundColor Yellow
    Write-Host $buildStep.logUrl -ForegroundColor White
    
    if ($buildStep.status -eq "FAILED") {
        Write-Host "`nBuild failed! Downloading log..." -ForegroundColor Red
        $logFile = "amplify-build-log-$JobId.txt"
        Invoke-WebRequest -Uri $buildStep.logUrl -OutFile $logFile
        Write-Host "Log saved to: $logFile" -ForegroundColor Green
        Write-Host "`nLast 50 lines of log:" -ForegroundColor Yellow
        Get-Content $logFile -Tail 50
    }
}

