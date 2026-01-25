echo "Building YCI Platform for Production..."

# 1. Build Admin
echo "Building Frontend: Admin..."
cd ../frontend-admin
npm run build
if [ $? -ne 0 ]; then echo "Admin Build Failed"; exit 1; fi

# 2. Build Customer
echo "Building Frontend: Customer..."
cd ../frontend-customer
npm run build
if [ $? -ne 0 ]; then echo "Customer Build Failed"; exit 1; fi

# 3. Build Staff
echo "Building Frontend: Staff..."
cd ../frontend-staff
npm run build
if [ $? -ne 0 ]; then echo "Staff Build Failed"; exit 1; fi

echo "All Frontends Built."
echo "Starting Docker services..."

cd ../deployment
docker-compose up -d --build

echo "Deployment Complete."
echo "Map your DNS as follows:"
echo "  yourchoiceice.com       -> 127.0.0.1"
echo "  admin.yourchoiceice.com -> 127.0.0.1"
echo "  staff.yourchoiceice.com -> 127.0.0.1"
echo "  api.yourchoiceice.com   -> 127.0.0.1"
