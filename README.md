# AssetFlow — Cinematic Asset Intelligence

Enterprise asset management platform with a dark, glassmorphic design system.

## Project Structure

```
assertflow/
├── frontend/        # Next.js 14 App Router (React, TypeScript, TailwindCSS v4)
├── backend/         # Express + TypeScript REST API
├── code.html        # Original landing page prototype
├── DESIGN.md        # Design system specification
└── screen.png       # UI reference screenshot
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5000
```

## Screens

| Route | Screen |
|-------|--------|
| `/dashboard` | Dashboard — KPIs, alerts, activity timeline |
| `/organization` | Organization Setup — departments, employees, categories |
| `/assets` | Asset Directory — register, search, filter, detail drawer |
| `/allocation` | Allocation & Transfer — allocate assets, raise transfer requests |
| `/booking` | Resource Booking — calendar scheduler, conflict detection |
| `/maintenance` | Maintenance Kanban — drag-and-drop status board |
| `/audit` | Audit — checklist, discrepancy report |
| `/reports` | Reports & Analytics — charts, utilization, trends |
| `/notifications` | Notifications & Activity Logs |

## Tech Stack

**Frontend:** Next.js 14, React 19, TypeScript, TailwindCSS v4, Framer Motion, shadcn/ui, Recharts, Lucide Icons

**Backend:** Node.js, Express, TypeScript, CORS, Helmet, Morgan
