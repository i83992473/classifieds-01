# Script to connect to new Amplify backend
# Run this script to connect your project to the new Amplify app (d39cdk72pisvhf)

Write-Host "Connecting to new Amplify backend..." -ForegroundColor Cyan
Write-Host ""

# Backup current schema
if (Test-Path "amplify\backend\api\classified01\schema.graphql") {
    Copy-Item -Path "amplify\backend\api\classified01\schema.graphql" -Destination "schema.graphql.backup" -Force
    Write-Host "✓ Backed up current schema" -ForegroundColor Green
}

# Remove old metadata files
if (Test-Path "amplify\backend\amplify-meta.json") {
    Remove-Item -Path "amplify\backend\amplify-meta.json" -Force
    Write-Host "✓ Removed amplify\backend\amplify-meta.json" -ForegroundColor Yellow
}

if (Test-Path "amplify\#current-cloud-backend\amplify-meta.json") {
    Remove-Item -Path "amplify\#current-cloud-backend\amplify-meta.json" -Force
    Write-Host "✓ Removed amplify\#current-cloud-backend\amplify-meta.json" -ForegroundColor Yellow
}

if (Test-Path "amplify\team-provider-info.json") {
    Remove-Item -Path "amplify\team-provider-info.json" -Force
    Write-Host "✓ Removed amplify\team-provider-info.json" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Now run the following command manually:" -ForegroundColor Cyan
Write-Host "  amplify pull --appId d39cdk72pisvhf --envName main" -ForegroundColor White
Write-Host ""
Write-Host "When prompted:" -ForegroundColor Cyan
Write-Host "  1. Select 'AWS profile' (or your preferred auth method)" -ForegroundColor White
Write-Host "  2. Select your AWS profile" -ForegroundColor White
Write-Host "  3. Choose 'Yes' to use the existing backend" -ForegroundColor White
Write-Host ""
Write-Host "After pulling, restore your schema with the updated User type:" -ForegroundColor Cyan
Write-Host "  Copy-Item -Path schema.graphql.backup -Destination amplify\backend\api\classified01\schema.graphql -Force" -ForegroundColor White
Write-Host ""
