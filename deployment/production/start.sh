#!/bin/bash
set -x

echo "=== STARTING DEPLOYMENT SCRIPT ==="

# Cleanup old configs
rm -f /etc/nginx/sites-enabled/default || true
rm -f /etc/nginx/conf.d/default.conf || true
rm -f /etc/nginx/conf.d/*.conf || true

# Debug: Check who is listening on ports
echo "Checking active ports..."
command -v netstat && netstat -tulpn || echo "netstat not found"
command -v ss && ss -tulpn || echo "ss not found"

# Ensure Nginx and Data run directories exist and are writable
mkdir -p /var/log/nginx /var/lib/nginx /app/backend/data
chmod -R 777 /var/log/nginx
chmod -R 777 /var/lib/nginx
chmod -R 777 /app/backend/data

# Test Nginx Config
echo "Testing Nginx Config..."
nginx -t

# Start Nginx in background
echo "Starting Nginx..."
nginx
sleep 2

# Verify Nginx is running
if pgrep nginx > /dev/null; then
    echo "Nginx is running (verified by pgrep)."
else
    echo "ERROR: Nginx failed to stay alive. Logs:"
    cat /var/log/nginx/error.log || echo "No error log file"
    exit 1
fi

# Run DB migrations/seed
echo "Running force init..."
python force_init.py || echo "FORCE INIT HAD ERRORS"
echo "Force init finished."

# Start Python Backend
echo "Starting Uvicorn Backend on 127.0.0.1:8000..."
uvicorn main:app --host 127.0.0.1 --port 8000
echo "UVICORN EXITED"
sleep 10
