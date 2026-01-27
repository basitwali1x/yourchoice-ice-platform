# 🗺️ Admin Dashboard Roadmap & Status

This document outlines the current state of the "Your Choice Ice" Admin Dashboard, detailing completed features, recent additions, and pending items.

## ✅ Completed Modules

### 1. **Executive Control Room (v2.0)**
*Redesigned Jan 27, 2026*
- **Top Command Bar**: Fixed, always-visible status bar answering 5 critical questions (Revenue, Alerts, Fleet, Customers, Health).
- **Action Tiles**: Clickable KPIs that drill down into problems (e.g., "3 Critical Alerts" -> Filtered View).
- **Live Ops Snapshot**: Real-time map combined with active driver list.
- **Revenue Heatmap**: Global view of network performance.

### 2. **Logistics & Routing**
- **Route Visualization**: View optimized delivery routes for each driver.
- **Stop Sequencing**: Detail view of delivery order (Stop #1, #2, etc.).
- **Map Integration**: Visual representation of route segments.

### 3. **Inventory Control**
- **Product Management**: Active SKU list (e.g., 20lb Bag, 8lb Bag).
- **Dynamic Pricing**: Ability to update base pricing globally.
- **Availability Toggle**: Enable/Disable products instantly across the platform.

### 4. **Partner Registry (CRM)**
- **Customer Database**: Searchable list of all registered accounts.
- **Profile Management**: Edit business details and assign primary DC anchors.
- **Legacy Import**: Drag-and-drop Excel ingestion for bulk onboarding.

### 5. **Maintenance Protocol**
- **Work Order Hub**: View incoming maintenance requests from drivers/staff.
- **Approval Workflow**: "Approve" (In Progress) or "Deny" requests with one click.

---

## ✨ Recent Additions (New Features)

### 6. **Employee Management (`/users`)**
*Added Jan 27, 2026*
- **Staff Directory**: Complete list of all system users.
- **Role-Based Creation**: Form to create new users with specific roles:
  - **Driver**: Access to Mobile App only.
  - **Staff**: Limited Admin access.
  - **Admin**: Full system control.
- **Access Control**: Ability to view credentials and deactivate accounts.

### 7. **Mobile Fleet Tracking (`/tracking`)**
*Added Jan 27, 2026*
- **Live Fleet Map**: Visual map interface showing active driver pins.
- **Driver Manifest**: Real-time list of "Online" drivers.
- **Telemetry**: Status indicators for driver activity (Active/Idle).

### 8. **Financial Intelligence (`/financials`)**
*Enhanced Jan 27, 2026*
- **Global Heatmap**: Unified view of revenue across ALL locations simultaneously.
- **Transaction Ledger**: Detailed table of individual historical sales records (Dates, Customers, Amounts).
- **Growth Metrics**: Year-over-Year (YOY) tracking and retention stats.

---

## 🚧 Pending / Future Development

### 1. **Live GPS Streaming**
- **Current Status**: The Driver App captures location, and the Admin Map exists.
- **Next Step**: Connect the two via WebSocket or Polling to show *moving* pins on the map in real-time. Currently, the map shows static driver locations based on their home base/last drop.

### 2. **Advanced Exports**
- **Current Status**: Data is visible on screen.
- **Next Step**: Add "Export to CSV/PDF" buttons for Financials and Route Manifests for accounting purposes.

### 3. **Google Play Store Launch**
- **Current Status**: Project configured for Capacitor. Codebase synced.
- **Next Step**: User must generate Signed APK/AAB using Android Studio and upload to Play Console (Guide provided in `DEPLOY_TO_PLAY_STORE.md`).

### 4. **Push Notifications**
- **Current Status**: Not implemented.
- **Next Step**: Send push alerts to Drivers when a new route is assigned or to Admins when a Work Order is urgent.
