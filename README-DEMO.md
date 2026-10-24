# AutoCare Intelligence — Frontend Demo

This is a frontend-only portfolio/demo version of AutoCare Intelligence. It keeps the existing customer and admin screens, charts, recommendations, reports, notifications, service history, vehicle health, and Add Service workflow.

## Run locally

1. Install Node.js (current LTS).
2. Open a terminal in `frontend`.
3. Run `npm ci`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Demo login

- **Customer:** registration `MH12 AB 4521`, mobile `98765 43210`
- **Admin:** `admin@demo.com`, password `admin123`

## Data behavior

- No backend or MySQL database is required.
- Data is supplied by local JavaScript demo files and a frontend mock API adapter.
- Add Service, profile edits, notifications, and other changes are held in memory for the current app session only. They are not permanently saved and reset after a page refresh.
- All vehicle, service, health, cost, and recommendation details are sample data for demonstration, not real vehicle records or diagnostic advice.
