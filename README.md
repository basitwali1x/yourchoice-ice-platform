# YCI (YOUR CHOICE ICE) Platform
> Successor to Arctic Ice Solutions

## 📂 Repository Structure
```
/golden-curiosity
  ├── /backend                  # FastAPI + Postgres (Port 8000)
  │   ├── /data-migration       # REAL Data SQL Scripts
  │   └── /routers              # API Endpoints
  ├── /frontend-admin           # Admin Dashboard (Port 5177)
  ├── /frontend-customer        # Customer App (Port 5176)
  ├── /frontend-staff           # Staff/Driver App (Port 5174)
  ├── /scripts                  # Runners
  └── package.json              # Root Runner
```

## 🚀 Launch (One-Command)
```powershell
npm run dev
```
*Starts Backend, Admin, Customer, and Staff apps concurrently.*

## 🔗 Access Points
| App | URL | Credentials (Demo) |
|---|---|---|
| **Backend API** | [http://localhost:8000/docs](http://localhost:8000/docs) | - |
| **Admin** | [http://localhost:5177](http://localhost:5177) | `admin@yci.local` / `password` |
| **Customer** | [http://localhost:5176](http://localhost:5176) | - |
| **Staff** | [http://localhost:5174](http://localhost:5174) | `driver1@yci.local` / `password` |

## 📊 Data Migration Report
**Source**: Arctic Ice Solutions Legacy Repo (`etl_json_to_pg.py`)
- **Locations**: 2 Migrated
- **Products**: 2 Migrated
- **Users**: 1 Legacy Manager Migrated
- *Note: Transactional data (Orders/Routes) was missing in source; validated schema created to accept future imports.*

## ✅ Definition of Done
- [x] **Monorepo**: All projects initialized (Backend, Admin, Customer, Staff).
- [x] **Real Data**: Extracted Locations, Products, Users from legacy source.
- [x] **Strict Schema**: Postgres schema enforces all YCI business rules.
- [x] **Fixed Ports**: 8000, 5177, 5176, 5174 hardcoded.
- [x] **Runner**: `npm run dev` orchestration verified.
- [x] **Theme**: "Ice Blue" premium branding applied.
