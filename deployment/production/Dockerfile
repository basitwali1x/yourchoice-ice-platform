# Build Stage: Frontend Admin
FROM node:18-alpine as build-admin
WORKDIR /app/frontend-admin
COPY frontend-admin/package*.json ./
RUN npm ci
COPY frontend-admin/ .
RUN npm run build

# Build Stage: Frontend Customer
FROM node:18-alpine as build-customer
WORKDIR /app/frontend-customer
COPY frontend-customer/package*.json ./
RUN npm ci
COPY frontend-customer/ .
RUN npm run build

# Build Stage: Frontend Staff
FROM node:18-alpine as build-staff
WORKDIR /app/frontend-staff
COPY frontend-staff/package*.json ./
RUN npm ci
COPY frontend-staff/ .
RUN npm run build

# Production Stage
FROM python:3.9-slim

# Install Nginx and Backend Dps
RUN apt-get update && apt-get install -y nginx curl procps net-tools iproute2 sqlite3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend

# Backend Dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn uvicorn

# Copy Backend Code
COPY backend/ .

# Copy Frontend Builds
COPY --from=build-admin /app/frontend-admin/dist /var/www/html/admin
COPY --from=build-customer /app/frontend-customer/dist /var/www/html/customer
COPY --from=build-staff /app/frontend-staff/dist /var/www/html/staff

# Configuration
COPY deployment/production/nginx.conf /etc/nginx/nginx.conf
COPY deployment/production/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Environment Variables
ENV PORT=8080
EXPOSE 8080

CMD ["/app/start.sh"]
