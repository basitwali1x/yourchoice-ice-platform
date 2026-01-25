$ErrorActionPreference = "Stop"
Write-Host "Building YCI Platform for Production..."

# Ensure we are at project root (deployment folder is child)
if (Test-Path "deployment") {
    # We are at root
}
elseif (Test-Path "../deployment") {
    Set-Location ".."
}
else {
    Write-Error "Please run this from project root or deployment folder."
    exit 1
}

$root = Get-Location

# 1. Build Admin
Write-Host "Building Frontend: Admin..."
Set-Location "$root/frontend-admin"
"VITE_API_URL=http://api.yourchoiceice.com" | Out-File ".env" -Encoding utf8
npm run build
Remove-Item ".env" -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) { Write-Error "Admin Build Failed"; exit 1 }

# 2. Build Customer
Write-Host "Building Frontend: Customer..."
Set-Location "$root/frontend-customer"
"VITE_API_URL=http://api.yourchoiceice.com" | Out-File ".env" -Encoding utf8
npm run build
Remove-Item ".env" -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) { Write-Error "Customer Build Failed"; exit 1 }

# 3. Build Staff
Write-Host "Building Frontend: Staff..."
Set-Location "$root/frontend-staff"
"VITE_API_URL=http://api.yourchoiceice.com" | Out-File ".env" -Encoding utf8
npm run build
Remove-Item ".env" -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) { Write-Error "Staff Build Failed"; exit 1 }

Write-Host "All Frontends Built."
Write-Host "Starting Docker services..."

Set-Location "$root/deployment"
# Check for docker
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    docker-compose up -d --build
    Write-Host "Deployment Complete."
    Write-Host "Map your DNS (hosts file) as follows:"
    Write-Host "  yourchoiceice.com       -> 127.0.0.1"
    Write-Host "  admin.yourchoiceice.com -> 127.0.0.1"
    Write-Host "  staff.yourchoiceice.com -> 127.0.0.1"
    Write-Host "  api.yourchoiceice.com   -> 127.0.0.1"
}
else {
    Write-Warning "docker-compose not found. Production builds are in 'dist/' folders ready for manual deployment."
}
