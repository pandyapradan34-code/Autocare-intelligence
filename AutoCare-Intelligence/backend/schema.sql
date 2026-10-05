-- ============================================================================
-- AutoCare Intelligence — Vehicle Health Intelligence System
-- Planned Database Schema (Phase 2)
-- Dialect: PostgreSQL (uses SERIAL / TIMESTAMPTZ / CHECK constraints;
--          swap SERIAL for AUTO_INCREMENT and TIMESTAMPTZ for DATETIME on MySQL)
--
-- This schema is not yet implemented — Phase 1 uses static dummy data in
-- src/data/*.js. It mirrors that data's shape so the frontend can later be
-- pointed at a real API backed by this schema without redesigning the UI.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. USERS  — both customers and staff (admin / mechanic) share one table,
--             distinguished by role, since the frontend's dummy auth already
--             stores every login this way (see src/data/authData.js).
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(160)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(10)     NOT NULL CHECK (role IN ('customer', 'admin', 'mechanic')),
    avatar_initials VARCHAR(4),
    status          VARCHAR(10)     NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------------
-- 2. VEHICLES  — one row per registered vehicle; owned by a customer user.
-- ---------------------------------------------------------------------------
CREATE TABLE vehicles (
    id                  SERIAL PRIMARY KEY,
    customer_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_number VARCHAR(20)     NOT NULL UNIQUE,
    brand               VARCHAR(60)     NOT NULL,
    model                VARCHAR(60)    NOT NULL,
    variant             VARCHAR(60),
    manufacturing_year  SMALLINT        NOT NULL,
    purchase_date       DATE,
    fuel_type           VARCHAR(20),
    engine_type         VARCHAR(80),
    current_km          INTEGER         NOT NULL DEFAULT 0,
    previous_owners     SMALLINT        NOT NULL DEFAULT 0,
    accident_history    TEXT,
    insurance_valid_till DATE,
    puc_valid_till      DATE,
    color               VARCHAR(40),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);

-- ---------------------------------------------------------------------------
-- 3. SERVICE_RECORDS  — one row per service visit.
-- ---------------------------------------------------------------------------
CREATE TABLE service_records (
    id            SERIAL PRIMARY KEY,
    vehicle_id    INTEGER       NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    mechanic_id   INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    service_date  DATE          NOT NULL,
    odometer      INTEGER       NOT NULL,
    service_type  VARCHAR(60)   NOT NULL,
    category      VARCHAR(30),  -- e.g. engine | brakes | suspension | tyres | other (drives cost-breakdown charts)
    cost          NUMERIC(10,2) NOT NULL DEFAULT 0,
    remarks       TEXT,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX idx_service_records_vehicle ON service_records(vehicle_id);
CREATE INDEX idx_service_records_date ON service_records(service_date);

-- ---------------------------------------------------------------------------
-- 4. SERVICE_WORK_ITEMS  — normalizes the "what was done" checklist
--    (oil change, brake service, AC service, ...) instead of a wide table
--    of boolean columns.
-- ---------------------------------------------------------------------------
CREATE TABLE service_work_items (
    id                 SERIAL PRIMARY KEY,
    service_record_id  INTEGER     NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
    work_type          VARCHAR(30) NOT NULL CHECK (work_type IN (
        'oil_change', 'brake_service', 'battery_replacement', 'tyre_replacement',
        'air_filter', 'coolant', 'ac_service', 'suspension_work', 'engine_work'
    )),
    UNIQUE (service_record_id, work_type)
);

-- ---------------------------------------------------------------------------
-- 5. SERVICE_PARTS  — parts replaced or repaired during a service visit.
-- ---------------------------------------------------------------------------
CREATE TABLE service_parts (
    id                 SERIAL PRIMARY KEY,
    service_record_id  INTEGER     NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
    part_name          VARCHAR(100) NOT NULL,
    action             VARCHAR(10) NOT NULL CHECK (action IN ('replaced', 'repaired'))
);
CREATE INDEX idx_service_parts_record ON service_parts(service_record_id);

-- ---------------------------------------------------------------------------
-- 6. COMPONENTS  — lookup table of trackable vehicle components.
-- ---------------------------------------------------------------------------
CREATE TABLE components (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE  -- Engine, Transmission, Brakes, Suspension,
                                      -- Battery, Tyres, AC, Cooling System, Steering, Electrical System
);

-- ---------------------------------------------------------------------------
-- 7. COMPONENT_HEALTH  — current health value per vehicle, per component.
-- ---------------------------------------------------------------------------
CREATE TABLE component_health (
    id            SERIAL PRIMARY KEY,
    vehicle_id    INTEGER  NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    component_id  INTEGER  NOT NULL REFERENCES components(id),
    health_value  SMALLINT NOT NULL CHECK (health_value BETWEEN 0 AND 100),
    summary       TEXT,
    last_updated  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (vehicle_id, component_id)
);
CREATE INDEX idx_component_health_vehicle ON component_health(vehicle_id);

-- ---------------------------------------------------------------------------
-- 8. HEALTH_SCORES  — overall vehicle health score, recorded over time so
--    a trend chart (Vehicle Health Over Time) can be drawn from history.
-- ---------------------------------------------------------------------------
CREATE TABLE health_scores (
    id             SERIAL PRIMARY KEY,
    vehicle_id     INTEGER  NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    score          SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
    status         VARCHAR(20) NOT NULL,  -- Healthy | Good | Moderate | Attention Required | Critical
    explanation    TEXT,
    recorded_date  DATE     NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX idx_health_scores_vehicle_date ON health_scores(vehicle_id, recorded_date);

-- ---------------------------------------------------------------------------
-- 9. HEALTH_FACTORS  — the weighted factors that make up one health_scores
--    row (Service Regularity, Mileage, Engine Condition, ...).
-- ---------------------------------------------------------------------------
CREATE TABLE health_factors (
    id               SERIAL PRIMARY KEY,
    health_score_id  INTEGER      NOT NULL REFERENCES health_scores(id) ON DELETE CASCADE,
    factor_name      VARCHAR(60)  NOT NULL,
    weight_pct       SMALLINT     NOT NULL CHECK (weight_pct BETWEEN 0 AND 100),
    contribution_pct SMALLINT     NOT NULL CHECK (contribution_pct BETWEEN 0 AND 100)
);

-- ---------------------------------------------------------------------------
-- 10. RECOMMENDATIONS  — actionable suggestions surfaced to the customer.
-- ---------------------------------------------------------------------------
CREATE TABLE recommendations (
    id            SERIAL PRIMARY KEY,
    vehicle_id    INTEGER  NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    component_id  INTEGER  REFERENCES components(id),  -- nullable: not every recommendation ties to one component
    severity      VARCHAR(10) NOT NULL CHECK (severity IN ('good', 'moderate', 'attention')),
    title         VARCHAR(120) NOT NULL,
    message       TEXT NOT NULL,
    status        VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recommendations_vehicle ON recommendations(vehicle_id);

-- ---------------------------------------------------------------------------
-- 11. WARNINGS  — early-warning alerts for recurring problem patterns.
-- ---------------------------------------------------------------------------
CREATE TABLE warnings (
    id          SERIAL PRIMARY KEY,
    vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    severity    VARCHAR(10) NOT NULL CHECK (severity IN ('moderate', 'attention', 'critical')),
    title       VARCHAR(160) NOT NULL,
    detail      TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_warnings_vehicle ON warnings(vehicle_id);

-- ---------------------------------------------------------------------------
-- 12. WARNING_EVIDENCE  — links a warning to the specific past service
--     records that justify it (e.g. 3 brake services in 18 months), so the
--     UI can show "why this warning fired" rather than a bare claim.
-- ---------------------------------------------------------------------------
CREATE TABLE warning_evidence (
    id                 SERIAL PRIMARY KEY,
    warning_id         INTEGER NOT NULL REFERENCES warnings(id) ON DELETE CASCADE,
    service_record_id  INTEGER NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
    UNIQUE (warning_id, service_record_id)
);

-- ---------------------------------------------------------------------------
-- 13. NEXT_SERVICE_ITEMS  — per-component countdown to the next service.
-- ---------------------------------------------------------------------------
CREATE TABLE next_service_items (
    id            SERIAL PRIMARY KEY,
    vehicle_id    INTEGER  NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    label         VARCHAR(60) NOT NULL,   -- e.g. "Engine Oil", "Brake Inspection"
    remaining_km  INTEGER  NOT NULL,
    interval_km   INTEGER  NOT NULL,
    status        VARCHAR(10) NOT NULL CHECK (status IN ('good', 'moderate', 'attention')),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_next_service_items_vehicle ON next_service_items(vehicle_id);

-- ---------------------------------------------------------------------------
-- 14. REMAINING_LIFE_ESTIMATES  — the estimated-remaining-useful-life range
--     shown on the Life Expectancy page.
-- ---------------------------------------------------------------------------
CREATE TABLE remaining_life_estimates (
    id           SERIAL PRIMARY KEY,
    vehicle_id   INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    years_range  VARCHAR(30) NOT NULL,   -- e.g. "3–5 Years"
    km_range     VARCHAR(30) NOT NULL,   -- e.g. "45,000–60,000 km"
    confidence   VARCHAR(10) NOT NULL CHECK (confidence IN ('Low', 'Moderate', 'High')),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_remaining_life_vehicle ON remaining_life_estimates(vehicle_id);

-- ---------------------------------------------------------------------------
-- 15. REMAINING_LIFE_FACTORS  — the inputs behind one remaining-life
--     estimate (vehicle age, annual mileage, repair frequency, ...).
-- ---------------------------------------------------------------------------
CREATE TABLE remaining_life_factors (
    id            SERIAL PRIMARY KEY,
    estimate_id   INTEGER NOT NULL REFERENCES remaining_life_estimates(id) ON DELETE CASCADE,
    factor_label  VARCHAR(60) NOT NULL,
    detail        VARCHAR(200) NOT NULL
);

-- ============================================================================
-- Seed data for the lookup table (safe to run once)
-- ============================================================================
INSERT INTO components (name) VALUES
    ('Engine'), ('Transmission'), ('Brakes'), ('Suspension'), ('Battery'),
    ('Tyres'), ('AC'), ('Cooling System'), ('Steering'), ('Electrical System')
ON CONFLICT (name) DO NOTHING;

-- AutoCare Phase 2 additions: detailed assessment, factor snapshots, odometer log and notifications.
ALTER TABLE service_parts ADD COLUMN IF NOT EXISTS cost NUMERIC(10,2) NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS component_assessments (
  id SERIAL PRIMARY KEY,
  service_record_id INTEGER NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  component_key VARCHAR(40) NOT NULL,
  component_name VARCHAR(60) NOT NULL,
  health_value SMALLINT NOT NULL CHECK (health_value BETWEEN 0 AND 100),
  action VARCHAR(20) NOT NULL DEFAULT 'inspected' CHECK (action IN ('serviced','replaced','repaired','inspected','not_touched')),
  notes TEXT,
  part_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_component_assessments_vehicle ON component_assessments(vehicle_id, created_at DESC);
CREATE TABLE IF NOT EXISTS vehicle_factor_snapshots (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_record_id INTEGER REFERENCES service_records(id) ON DELETE SET NULL,
  factor_key VARCHAR(60) NOT NULL,
  factor_value VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vehicle_factor_snapshots_vehicle ON vehicle_factor_snapshots(vehicle_id, created_at DESC);
CREATE TABLE IF NOT EXISTS odometer_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_record_id INTEGER REFERENCES service_records(id) ON DELETE SET NULL,
  odometer INTEGER NOT NULL CHECK (odometer >= 0),
  source VARCHAR(30) NOT NULL CHECK (source IN ('service_record','customer_update','admin_update')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_odometer_logs_vehicle ON odometer_logs(vehicle_id, recorded_at DESC);
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  kind VARCHAR(30) NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
