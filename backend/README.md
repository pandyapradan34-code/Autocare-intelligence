# AutoCare Intelligence — Backend (Phase 2 + Phase 3)

Django + Django REST Framework + MySQL backend for the Vehicle Health
Intelligence System, implementing:

- **Phase 2** — real database, models, and CRUD APIs for Customers,
  Vehicles, Service Records, Component Inspections, and Accident/Repair
  records (previously Phase 1's static dummy data in the React frontend).
- **Phase 3** — a **rule-based** Vehicle Health Score engine. No machine
  learning, no prediction libraries — every score is produced by plain,
  documented Python rules and weighted formulas, so any score can be
  explained exactly.

This is a new addition sitting alongside the existing `src/` React
frontend, in `backend/`. It doesn't touch or require changes to the
frontend — wiring the frontend to it (via `fetch`/`axios` against `/api/`)
is a separate follow-up step, listed at the bottom.

---

## 1. Setup

### 1a. Install MySQL/MariaDB and create the database

```sql
CREATE DATABASE vehicle_health_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vhi_user'@'localhost' IDENTIFIED BY 'vhi_pass_2026';
GRANT ALL PRIVILEGES ON vehicle_health_db.* TO 'vhi_user'@'localhost';
FLUSH PRIVILEGES;
```

(Use your own username/password — just update `.env` to match, see below.)

### 1b. Python environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 1c. Configure environment

```bash
cp .env.example .env
# edit .env if your DB name/user/password/host differ from the defaults
```

### 1d. Migrate and create an admin login

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 1e. Run it

```bash
python manage.py runserver
```

API root: `http://127.0.0.1:8000/api/`
Admin panel (manual data entry without the API): `http://127.0.0.1:8000/admin/`

### 1f. Run the test suite

```bash
python manage.py test core
```

25 tests, including one that reproduces the worked example from the spec
exactly (see §4).

---

## 2. Project layout

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── vhi_backend/          Django project (settings, root urls)
└── core/                 The one app — everything lives here
    ├── models.py          Customer, Vehicle, ComponentInspection, AccidentRecord,
    │                      ServiceRecord (+ work items/parts), HealthScore, HealthFactorScore
    ├── scoring.py          <-- THE HEALTH-SCORE RULE ENGINE (read this first)
    ├── signals.py          Auto-recalculates a vehicle's score whenever
    │                       a ServiceRecord / ComponentInspection / AccidentRecord changes
    ├── serializers.py      DRF serializers (validation, duplicate-prevention)
    ├── views.py             API endpoints, including GET .../health/
    ├── urls.py
    ├── admin.py             Django admin registration (manual data entry UI)
    └── tests.py             25 tests — pure scoring rules, ORM orchestration, API
```

Field names deliberately mirror the frontend's dummy data
(`src/data/customerData.js`, `vehiclesData.js`, `serviceRecordsData.js`,
`componentHealthData.js`) and the schema already drafted in
`schema-project/schema.sql`, so nothing here invents a new shape for data
the frontend already expects.

---

## 3. API reference

| Method | URL | Purpose |
|---|---|---|
| GET/POST | `/api/customers/` | List / create customers |
| GET/PUT/DELETE | `/api/customers/{id}/` | Retrieve / update / delete a customer |
| GET/POST | `/api/vehicles/` | List / create vehicles (`?customer_id=` to filter) |
| GET/PUT/DELETE | `/api/vehicles/{id}/` | Retrieve / update / delete a vehicle |
| POST | `/api/component-inspections/` | Enter/update a component's inspection condition (upserts per vehicle+component) |
| POST | `/api/accident-records/` | Log an accident or major repair |
| GET/POST | `/api/service-records/` | List / create service records (with work items + parts) |
| **GET** | **`/api/vehicles/{id}/health/`** | **The required endpoint** — current health score, status, and full breakdown |
| POST | `/api/vehicles/{id}/health/recalculate/` | Force a fresh calculation right now |
| GET | `/api/vehicles/{id}/health/history/` | Every past calculation for this vehicle, newest first |
| GET | `/api/health-scores/` | Browse all stored health scores (debugging) |

`GET /api/vehicles/15/health/` response shape:

```json
{
  "vehicle_id": 15,
  "health_score": 82.25,
  "status": "Healthy",
  "calculated_at": "2026-09-23T19:36:52Z",
  "breakdown": [
    {
      "factor_key": "engine_condition",
      "factor_label": "Engine Condition",
      "raw_input_summary": "Condition rating: Good",
      "factor_score": "80.00",
      "weight_pct": "25.00",
      "contribution": "20.00"
    }
  ]
}
```

The top-level fields match the spec exactly; `breakdown` is additive —
it's what makes every score explainable without a second lookup.

If required inspection data hasn't been entered yet, the endpoint returns
**400**, not a guessed 200:

```json
{
  "vehicle_id": 15,
  "error": "Cannot calculate health score for DL08CQ1123: no inspection recorded yet for: Battery, Tyre.",
  "missing": ["battery", "tyre"]
}
```

---

## 4. The scoring rules — how any number is calculated

Everything below lives in `core/scoring.py`, split into small, independently
testable functions. Change a number there to change a rule.

### Weights (sum to 100)

| Factor | Weight |
|---|---|
| Engine Condition | 25% |
| Service History | 15% |
| Mileage / Usage | 15% |
| Brake Condition | 10% |
| Suspension Condition | 10% |
| Accident / Repair History | 10% |
| Tyre Condition | 8% |
| Battery Condition | 7% |

`Health Score = Σ(Factor Score × Factor Weight) / 100`, rounded to 2
decimals — `core.scoring.aggregate()`.

**Worked example (identical to the spec, and to `AggregateWorkedExampleTests.test_worked_example_matches_exactly`):**
Engine=85, Service=90, Mileage=80, Brake=65, Suspension=85, Accident/Repair=70,
Battery=90, Tyres=90 → **82.25 → Healthy**.

### Status

| Score | Status |
|---|---|
| 80–100 | Healthy |
| 60–79 | Moderate |
| 0–59 | Needs Attention |

### How each raw input becomes a 0–100 factor score

**Engine / Brake / Suspension / Battery / Tyre condition** — an
admin/mechanic enters a condition rating during inspection (not a precise
number — a judgment call, like a real inspection):

| Rating | Score |
|---|---|
| Excellent | 100 |
| Good | 80 |
| Fair | 60 |
| Poor | 35 |
| Critical | 10 |

`core.scoring.score_from_condition_rating()`. One row per (vehicle,
component) — re-inspecting updates it rather than piling up history.

**Service History** — `core.scoring.score_service_history()`. Two parts:

- *Recency* (60% of this factor): days since the last service — ≤180
  days → 100, ≤365 → 70, ≤730 → 40, older → 15. Never serviced → 0.
- *Regularity* (40% of this factor): actual service count vs. an expected
  count of 2 services/year of vehicle age (min. 1). A vehicle under 6
  months old isn't penalized for not having one yet.

**Mileage / Usage** — `core.scoring.score_mileage_usage()`. Average
annual km (current odometer ÷ vehicle age in years) against breakpoints
benchmarked to ~10–12k km/year as typical usage:

| Avg. annual km | Score |
|---|---|
| ≤ 10,000 | 100 |
| ≤ 15,000 | 85 |
| ≤ 20,000 | 65 |
| ≤ 25,000 | 45 |
| > 25,000 | 25 |

**Accident / Repair History** — `core.scoring.score_accident_repair_history()`.
Starts at 100; each incident subtracts a penalty (minor −5, moderate −15,
severe −35), halved if the incident is more than 2 years old. No
records → 100 (a clean history is a real, valid input — not missing data).

### Registration number

`Vehicle.registration_number` is a unique identifier only — normalized
(whitespace/hyphens stripped, uppercased) purely so two admins entering
"MH12 AB 4521" and "mh12ab4521" collide as the same duplicate instead of
creating two vehicle rows. **No scoring function ever reads it.**

### Missing vs. invalid vs. legitimately-zero data

Per the spec's "do not silently assume missing values are zero":

- An **inspection that was never entered** for a component → the whole
  calculation raises `HealthScoreInputError` (→ HTTP 400 naming exactly
  which components are missing). It is never defaulted to 0 or 100.
- **Zero service records** or an **empty accident list** are treated as
  real, meaningful inputs (never serviced; clean history) and scored
  accordingly — they are not errors.
- An out-of-range or unrecognized value (e.g. `condition_rating="mint"`,
  a negative odometer) also raises `HealthScoreInputError`.

### When it recalculates

`core/signals.py` recalculates and stores a fresh `HealthScore` (+ full
`HealthFactorScore` breakdown) automatically whenever a `ServiceRecord`,
`ComponentInspection`, or `AccidentRecord` is saved or deleted for a
vehicle. Nothing is overwritten — every calculation is a new row, so
`GET /api/vehicles/{id}/health/history/` gives a full trend over time.

---

## 5. Manual testing checklist

1. `python manage.py runserver`, then open `/admin/` and log in.
2. Add a Customer via `/admin/core/customer/add/`.
3. Add a Vehicle for that customer. Try registering the same plate again
   with different spacing/casing — it should be rejected.
4. On the Vehicle's admin page, use the inline "Component inspections" and
   "Accident records" sections (or `POST /api/component-inspections/`) to
   enter Engine/Brake/Suspension/Battery/Tyre — **before all 5 exist**,
   confirm `GET /api/vehicles/{id}/health/` returns 400 with a `missing`
   list, not a score.
5. Once all 5 are entered, confirm `GET /api/vehicles/{id}/health/`
   returns 200 with a score, status, and an 8-row `breakdown` that sums
   (via each `contribution`) to the total.
6. Add a Service Record — confirm the health score changes automatically
   without calling anything else (check `/health/history/` for a new row).
7. Add a severe Accident Record — confirm the score drops and a new
   history row appears.
8. Re-run `python manage.py test core` — all 25 should pass.

---

## 6. Wiring up the React frontend (next step, not done yet)

This backend is intentionally decoupled from the frontend so nothing in
`src/` had to change. To connect them later:

1. Set `VITE_API_BASE_URL=http://127.0.0.1:8000/api` in a frontend `.env`.
2. Replace the static imports in `src/data/*.js` with `fetch`/`axios`
   calls to the endpoints in §3, inside the existing `AdminDataContext`
   (or a new API-backed context) — the field names already match, so
   components shouldn't need changes, only where the data comes from.
3. `CORS_ALLOWED_ORIGINS` in `.env` already allows `http://localhost:5173`
   (the Vite dev server) by default.
