# AutoCare Intelligence

React/Vite frontend, Express API, and MySQL 8 database for the MCA capstone.

## Requirements
- Node.js 20+ (Node 22 recommended)
- MySQL Server 8.0+ and MySQL Workbench (optional)

## First-time setup
1. Create a MySQL schema named `autocare`.
2. In MySQL Workbench, open and execute `backend/schema.mysql.sql` against that schema.
3. Execute `backend/seed.mysql.sql` to add 15 clearly marked fictional demo customers and their vehicles. It is idempotent.
4. Copy `backend/.env.example` to `backend/.env`, then enter your own MySQL password and a long random `AUTH_SECRET`. Never share `.env`.
5. In a terminal: `cd backend`, `npm install`, then set `ADMIN_PASSWORD` in your terminal and run `npm run seed:admin`. On PowerShell: `$env:ADMIN_PASSWORD='choose-a-strong-password'; npm run seed:admin`. Default admin email is `admin@demo.com`; the password is the value you chose.
6. In a second terminal: `cd frontend`, `npm install`, copy `.env.example` to `.env` if needed, and run `npm run dev`.
7. Open the Vite URL (normally `http://localhost:5173`). Check `http://localhost:3000/api/healthcheck` returns `{"status":"ok","database":true}`.

## Demo customer login
Customer login uses the plate and phone number stored on the same vehicle/customer record. Demo rows use plates `GJ01DE0001` through `GJ01DE0015`; phone numbers are `9000000001` through `9000000015`. These are fictional test credentials only.

## Security notes
- Customer self-registration is disabled. The administrator adds customer and vehicle records.
- Admin login is verified against a scrypt password hash in MySQL. Customer access uses a signed, expiring session token.
- Do not expose the development API to the public internet as-is. Before deployment, use HTTPS, rotate `AUTH_SECRET`, use a least-privilege MySQL account, add rate limiting and stronger session management, and audit every admin-only endpoint.
- This is a student project; run the verification checklist below before demonstrating it.

## Verification checklist
- Healthcheck returns database true.
- Wrong plate/mobile pair is rejected; correct pair logs in.
- Customer can view only records returned by customer-scoped endpoints.
- Admin login works with the password chosen during `seed:admin`; wrong password fails.
- Search API requires an admin token.
- Alert owner action creates a database row; customer notifications endpoint returns only the logged-in customer's notifications.
- Restart backend and refresh; database records remain.
