# Production Deployment & DNS Configuration Guide

## 🚀 Deployment Status
**Success!** The application has been successfully built and deployed to Fly.io.
- **App Name**: `arctic-ice-api`
- **Region**: `iad` (Ashburn, Virginia)
- **Public IP**: `66.241.124.78`

## 🌐 DNS Configuration (Action Required)
You must configure the following DNS records with your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare) to route traffic to your new deployment.

| Type | Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **A** | `@` (root) | `66.241.124.78` | Main Customer Portal |
| **CNAME** | `www` | `arctic-ice-api.fly.dev` | WWW Redirection |
| **CNAME** | `admin` | `arctic-ice-api.fly.dev` | Admin Dashboard |
| **CNAME** | `staff` | `arctic-ice-api.fly.dev` | Staff/Driver App |
| **CNAME** | `api` | `arctic-ice-api.fly.dev` | Backend API |

> **Note:** DNS propagation can take anywhere from a few minutes to 24 hours. The SSL certificates I provisioned will automatically validate and become "Ready" once these DNS records are live.

## 🏗️ Architecture Overview
I have containerized the application to serve all three frontends and the Python backend from a single efficient Flyer instance using Nginx as a reverse proxy.

### Routing Logic (Nginx)
The server inspects the **Hostname** to decide what to serve:
1.  **`admin.yourchoiceice.com`** → Serves **Admin Portal** (`/dist/admin`)
2.  **`staff.yourchoiceice.com`** → Serves **Staff Portal** (`/dist/staff`)
3.  **`yourchoiceice.com`** (Default) → Serves **Customer Portal** (`/dist/customer`)
4.  **`api.yourchoiceice.com`** → Proxies to **FastAPI Backend** (`localhost:8000`)

### Backend Configuration
- **Database**: SQLite (Production mode).
- **Migrations**: Automatically run on startup (`start.sh`).
- **Port**: Internal `8080` (Mapped to 80/443 externally).

## 🛡️ SSL Certificates
I have requested managed certificates for:
- `yourchoiceice.com`
- `admin.yourchoiceice.com`
- `staff.yourchoiceice.com`
- `api.yourchoiceice.com`

**Status**: *Awaiting DNS Config*. Once you update your DNS records, Fly.io will automatically verify and issue the Let's Encrypt certificates.

## 🔧 Useful Commands
- **Check Status**: `fly status`
- **View Logs**: `fly logs`
- **Redeploy**: `fly deploy` (Run from project root)
- **SSH into Console**: `fly ssh console`
