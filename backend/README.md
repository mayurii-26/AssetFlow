# AssetFlow — Backend API

Node.js + Express + TypeScript REST API for AssetFlow.

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server starts at **http://localhost:5000**

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check |
| **Assets** | | |
| GET | `/api/assets` | List assets (filters: status, category, department, search) |
| GET | `/api/assets/:id` | Get single asset |
| POST | `/api/assets` | Register new asset |
| PATCH | `/api/assets/:id` | Update asset |
| DELETE | `/api/assets/:id` | Delete asset |
| **Organization** | | |
| GET | `/api/organization/departments` | List departments |
| POST | `/api/organization/departments` | Create department |
| PATCH | `/api/organization/departments/:id` | Update department |
| DELETE | `/api/organization/departments/:id` | Delete department |
| GET | `/api/organization/employees` | List employees |
| POST | `/api/organization/employees` | Create employee |
| GET | `/api/organization/categories` | List categories |
| POST | `/api/organization/categories` | Create category |
| **Allocation** | | |
| GET | `/api/allocation` | List allocations |
| POST | `/api/allocation` | Allocate asset to employee |
| GET | `/api/allocation/transfers` | List transfer requests |
| POST | `/api/allocation/transfers` | Raise transfer request |
| PATCH | `/api/allocation/transfers/:id` | Approve / Reject transfer |
| **Booking** | | |
| GET | `/api/booking` | List bookings |
| GET | `/api/booking/resources` | List bookable resources |
| POST | `/api/booking` | Create booking (conflict-checked) |
| PATCH | `/api/booking/:id/cancel` | Cancel booking |
| **Maintenance** | | |
| GET | `/api/maintenance` | List tasks (filter: status) |
| POST | `/api/maintenance` | Raise maintenance request |
| PATCH | `/api/maintenance/:id` | Update task / move Kanban column |
| DELETE | `/api/maintenance/:id` | Delete task |
| **Audit** | | |
| GET | `/api/audit` | List audit cycles |
| GET | `/api/audit/:id` | Get cycle with items |
| POST | `/api/audit` | Create audit cycle |
| PATCH | `/api/audit/:cycleId/items/:itemId` | Update audit item |
| PATCH | `/api/audit/:id/close` | Close audit cycle |
| **Notifications** | | |
| GET | `/api/notifications` | List notifications |
| PATCH | `/api/notifications/:id/read` | Mark one read |
| PATCH | `/api/notifications/mark-all-read` | Mark all read |
| DELETE | `/api/notifications/:id` | Delete notification |
| **Reports** | | |
| GET | `/api/reports/summary` | Dashboard KPIs |
| GET | `/api/reports/utilization` | Utilization by department |
| GET | `/api/reports/status-distribution` | Status pie data |
| GET | `/api/reports/by-category` | Assets by category |
| GET | `/api/reports/near-retirement` | Assets expiring within 90 days |

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Express server entry
│   ├── types/
│   │   └── index.ts      # Shared TypeScript interfaces
│   ├── data/
│   │   └── seed.ts       # In-memory mock data store
│   └── routes/
│       ├── assets.ts
│       ├── organization.ts
│       ├── allocation.ts
│       ├── booking.ts
│       ├── maintenance.ts
│       ├── audit.ts
│       ├── notifications.ts
│       └── reports.ts
├── .env.example
├── package.json
└── tsconfig.json
```

> **Note:** Data is stored in-memory (no database). Swap `src/data/seed.ts` arrays with a database (PostgreSQL / MongoDB) when moving to production.
