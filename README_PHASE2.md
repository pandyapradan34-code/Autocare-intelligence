# AutoCare Intelligence — Phase 2 integration

This update adds a MySQL-backed service workflow and a deterministic, explainable rule engine. Existing screens are retained; the Admin Add Service and Service Records pages now use the API instead of pretending that a form was saved.

## Requirements
- Node.js 20+ (Node 22 recommended)
- MySQL 14+

## 1. Create the database
Create a MySQL database named `autocare`, then run the full schema in `backend/schema.mysql.sql` against it. This file contains the provided schema plus the Phase 2 additions (`component_assessments`, factor snapshots, odometer logs, notifications and per-part cost).

Example with psql:
```bash
createdb autocare
psql -d autocare -f backend/schema.mysql.sql
```
If using pgAdmin, open Query Tool for your `autocare` database and execute `backend/schema.mysql.sql`.

## 2. Configure backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME` to your MySQL credentials. Then:
```bash
npm install
npm start
```
API: `http://localhost:3000`; health check: `http://localhost:3000/api/healthcheck`.

## 3. Configure frontend
In another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL, normally `http://localhost:5173`.

## 4. Initial data required
The schema intentionally does not invent customer records. Before using Add Service, create customer users and vehicles in MySQL (`users` with role `customer`, `vehicles` linked to those user IDs). To use the mechanic dropdown, create `users` with role `mechanic`. The page reads these records from the database.

## What happens when a service is saved
1. API validates vehicle, cost, date and odometer; odometer cannot go backwards.
2. A database transaction writes the service visit, component assessments, repaired/replaced parts, factor snapshot, odometer log and updated vehicle mileage.
3. The rule engine calculates a weighted component score, driving/condition penalties, health status, explainable recommendations and a low-confidence remaining-life range.
4. The API stores the health score, current next-service items, remaining-life estimate and customer notification before committing the transaction.
5. Admin Service Records loads saved service visits from MySQL.

## Rule engine assumptions / limitations
- It is a deterministic educational rules engine, not machine learning and not a certified mechanical diagnostic system.
- Component percentages are manual inspection inputs. Real tyre, brake, battery and engine checks should use measured/tested values wherever possible.
- Remaining-life ranges are rough planning estimates with **Low** confidence; they must not be represented as guaranteed remaining vehicle life.
- Service intervals are starter defaults and should be configured by make/model/engine using manufacturer schedules before real-world use.
- Current frontend login and most non-service customer pages still use the original demo authentication/static sample data. Do not deploy this as a production system until server-side authentication, authorization, ownership checks, input-rate limits and database backups are implemented.


## MySQL setup
1. Install MySQL Server 8 and MySQL Workbench.
2. In Workbench, connect to localhost and run `CREATE DATABASE autocare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`.
3. Open and execute `backend/schema.mysql.sql` while the `autocare` schema is selected.
4. Copy `backend/.env.example` to `backend/.env` and set your MySQL password.
5. Run `cd backend`, `npm install`, `npm start`.

Note: use MySQL 8.0+ (the API uses window functions). Do not run the old PostgreSQL `schema.sql`.
