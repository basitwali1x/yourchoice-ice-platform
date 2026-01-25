Write-Host "Building YCI Mobile Apps for Play Store..."

# 1. Build Customer App
Write-Host "Building Customer App..."
Set-Location "frontend-customer"
npm run build
npx cap sync
Write-Host "Customer App Ready. To generate AAB:"
Write-Host "  > cd frontend-customer/android"
Write-Host "  > ./gradlew bundleRelease"
Set-Location ".."

# 2. Build Staff App
Write-Host "Building Staff App..."
Set-Location "frontend-staff"
npm run build
npx cap sync
Write-Host "Staff App Ready. To generate AAB:"
Write-Host "  > cd frontend-staff/android"
Write-Host "  > ./gradlew bundleRelease"
Set-Location ".."

Write-Host "Mobile Build Prep Complete."
Write-Host "Open 'frontend-staff/android' and 'frontend-customer/android' in Android Studio to sign and upload."
