# AutoCare Intelligence — Vehicle Health Intelligence System

**Phase 1 — Frontend Development**

An MCA academic project frontend for a Smart Vehicle Health & Maintenance
Recommendation System. This phase implements a fully navigable, polished
frontend prototype using **React**, **React Router**, **Tailwind CSS**, and
**Recharts** — with realistic dummy data standing in for the future
backend, database, and ML-based prediction engine.

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Demo Credentials

| Role     | Email             | Password    |
|----------|-------------------|-------------|
| Customer | customer@demo.com | customer123 |
| Admin    | admin@demo.com    | admin123    |

(Both are pre-filled via the "Demo credentials" buttons on the login page.)

## Project Structure

```
src/
├── components/     # Reusable UI building blocks
│   ├── common/         Sidebar, Navbar, PageHeader, StatCard, Modal, ...
│   ├── dashboard/       MaintenanceCostCard
│   ├── vehicle/         VehicleCard
│   ├── health/           HealthScoreCard, ComponentHealthCard
│   ├── service/          ServiceHistoryCard, ServiceTable
│   ├── charts/            ChartCard + 5 Recharts-based chart components
│   └── recommendations/  RecommendationCard, WarningCard
├── pages/
│   ├── auth/         Login, Register, ForgotPassword
│   ├── customer/     Dashboard, MyCar, VehicleHealth, ComponentHealth,
│   │                 ServiceHistory, NextService, LifeExpectancy,
│   │                 Recommendations, MaintenanceCost, Profile
│   └── admin/        Dashboard, Customers, Vehicles, ServiceRecords,
│                     AddService, HealthOverview, MaintenanceAnalysis,
│                     Reports, Profile
├── layouts/          AuthLayout, CustomerLayout, AdminLayout
├── data/             All dummy/static data, one file per data source
├── context/          AuthContext (dummy, session-based login)
├── routes/           ProtectedRoute + centralized nav config
└── utils/            Formatters and shared health-status helpers
```

## Design Principles

- **No backend, no real auth, no ML** — everything here is UI only.
  Login checks credentials against `src/data/authData.js`.
- **Data-driven components** — e.g. a single `ComponentHealthCard` renders
  Engine, Brakes, Suspension, etc. by receiving different data, rather than
  hard-coding a card per component.
- **Dummy data lives in `src/data/`**, never scattered inline, so it can be
  swapped for real API responses later without touching component code.
- **Future-ready architecture** — Phase 2 (backend/DB/APIs), Phase 3
  (health scoring & recommendation engine), and Phase 4 (ML prediction)
  should be able to plug in without redesigning this frontend.

## Tech Stack

- React 19 + Vite
- React Router v7
- Tailwind CSS v3
- Recharts (charts/analytics)
- lucide-react (icons)
