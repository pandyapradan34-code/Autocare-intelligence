require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const crypto = require('node:crypto');
const { COMPONENTS, calculateHealth, calculateNextServices } = require('./ruleEngine');

const app = express();
const port = Number(process.env.PORT || 3000);
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
const pool = process.env.DB_NAME ? mysql.createPool({host:process.env.DB_HOST || 'localhost',port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER || 'root',password:process.env.DB_PASSWORD || '',database:process.env.DB_NAME,waitForConnections:true,connectionLimit:10,decimalNumbers:true}) : null;
const adaptSql = (sql) => sql.replace(/\$(\d+)/g, '?').replace(/\bnow\(\)/gi, 'CURRENT_TIMESTAMP');
async function queryOn(conn, sql, params=[]) {
  const clean = adaptSql(sql);
  if (/^BEGIN$/i.test(clean.trim())) { await conn.beginTransaction(); return {rows:[],rowCount:0}; }
  if (/^COMMIT$/i.test(clean.trim())) { await conn.commit(); return {rows:[],rowCount:0}; }
  if (/^ROLLBACK$/i.test(clean.trim())) { await conn.rollback(); return {rows:[],rowCount:0}; }
  const [result] = await conn.execute(clean, params);
  if (Array.isArray(result)) return {rows:result,rowCount:result.length};
  return {rows:[],rowCount:result.affectedRows || 0,insertId:result.insertId,affectedRows:result.affectedRows};
}
const db = { query:(sql,params=[])=>queryOn(pool,sql,params), connect:async()=>{const conn=await pool.getConnection();return {query:(sql,params=[])=>queryOn(conn,sql,params),release:()=>conn.release()};} };
const dbRequired = (req, res, next) => {
  if (!pool) return res.status(503).json({ error: 'Database is not configured. Copy .env.example to .env and set DB_NAME and DB_PASSWORD in .env.' });
  next();
};
app.get('/', (_req, res) => res.json({ name: 'AutoCare Intelligence API', version: '2.0.0', databaseConfigured: !!pool }));
app.get('/api/healthcheck', async (_req, res) => {
  if (!pool) return res.status(503).json({ status: 'not_configured', database: false });
  try { await db.query('SELECT 1'); res.json({ status: 'ok', database: true }); }
  catch (error) { res.status(503).json({ status: 'database_error', database: false, error: error.message }); }
});


const authSecret = process.env.AUTH_SECRET || 'development-only-change-this-secret-before-sharing';
function makeToken(user) {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const sig = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function authRequired(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return res.status(401).json({ error: 'Please log in again.' });
  const expected = crypto.createHmac('sha256', authSecret).update(payload).digest();
  let actual; try { actual = Buffer.from(sig, 'base64url'); } catch { return res.status(401).json({ error: 'Invalid session.' }); }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return res.status(401).json({ error: 'Invalid session.' });
  try { req.auth = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return res.status(401).json({ error: 'Invalid session.' }); }
  if (!req.auth.exp || req.auth.exp < Date.now()) return res.status(401).json({ error: 'Session expired. Please log in again.' });
  next();
}
const adminOnly = (req, res, next) => authRequired(req, res, () => req.auth.role === 'admin' ? next() : res.status(403).json({ error: 'Administrator access required.' }));
const customerOnly = (req, res, next) => authRequired(req, res, () => req.auth.role === 'customer' ? next() : res.status(403).json({ error: 'Customer access required.' }));
function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  const a = Buffer.from(derived, 'hex'), b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
app.post('/api/auth/admin-login', dbRequired, async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const { rows } = await db.query("SELECT id,name,email,phone,role,status,password_hash,avatar_initials FROM users WHERE LOWER(email)=? AND role='admin' AND status='active' LIMIT 1", [email]);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) return res.status(401).json({ error: 'Invalid admin email or password.' });
    delete user.password_hash;
    res.json({ token: makeToken(user), user });
  } catch (e) { next(e); }
});
app.post('/api/auth/customer-login', dbRequired, async (req, res, next) => {
  try {
    const plate = String(req.body?.registrationNumber || '').replace(/\s+/g, '').toUpperCase();
    const phone = String(req.body?.phone || '').replace(/\D/g, '');
    if (!plate || phone.length < 10) return res.status(400).json({ error: 'Enter the registered number plate and mobile number.' });
    const { rows } = await db.query(`SELECT u.id,u.name,u.email,u.phone,u.role,u.avatar_initials,v.id vehicle_id,v.registration_number,v.brand,v.model FROM vehicles v JOIN users u ON u.id=v.customer_id WHERE UPPER(REPLACE(v.registration_number,' ',''))=? AND REPLACE(REPLACE(REPLACE(REPLACE(u.phone,' ',''),'-',''),'+',''),'(', '') LIKE ? AND u.status='active' AND u.role='customer' LIMIT 2`, [plate, `%${phone.slice(-10)}`]);
    if (rows.length !== 1) return res.status(401).json({ error: 'Number plate and registered mobile number did not match an active customer record.' });
    const row = rows[0]; const vehicle = { id: row.vehicle_id, registration_number: row.registration_number, brand: row.brand, model: row.model };
    const user = { id: row.id, name: row.name, email: row.email, phone: row.phone, role: 'customer', avatarInitials: row.avatar_initials };
    res.json({ token: makeToken(user), user, vehicle });
  } catch (e) { next(e); }
});
app.get('/api/auth/me', dbRequired, authRequired, async (req,res,next) => {
  try { const { rows } = await db.query('SELECT id,name,email,phone,role,avatar_initials,status FROM users WHERE id=? AND status=\'active\'', [req.auth.sub]); if (!rows.length) return res.status(401).json({error:'Account is no longer active.'}); res.json({user:rows[0]}); } catch(e){next(e)}
});
app.get('/api/customer/my-vehicles', dbRequired, customerOnly, async (req,res,next) => {
  try { const {rows}=await db.query(`SELECT v.*, (SELECT hs.score FROM health_scores hs WHERE hs.vehicle_id=v.id ORDER BY hs.recorded_date DESC,hs.id DESC LIMIT 1) AS health_score FROM vehicles v WHERE v.customer_id=? ORDER BY v.registration_number`,[req.auth.sub]); res.json(rows); } catch(e){next(e)}
});
app.get('/api/customer/my-services', dbRequired, customerOnly, async (req,res,next) => {
  try { const {rows}=await db.query(`SELECT sr.*,v.registration_number,v.brand,v.model FROM service_records sr JOIN vehicles v ON v.id=sr.vehicle_id WHERE v.customer_id=? ORDER BY sr.service_date DESC,sr.id DESC LIMIT 500`,[req.auth.sub]); res.json(rows); } catch(e){next(e)}
});
app.get('/api/customer/my-notifications', dbRequired, customerOnly, async (req,res,next) => {
  try { const {rows}=await db.query('SELECT id,vehicle_id,title,message,kind,created_at,read_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100',[req.auth.sub]); res.json(rows); } catch(e){next(e)}
});
app.patch('/api/customer/my-notifications/:id/read', dbRequired, customerOnly, async (req,res,next) => {
  try { const result=await db.query('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?',[Number(req.params.id),req.auth.sub]); if(!result.rowCount)return res.status(404).json({error:'Notification not found.'}); res.json({success:true}); } catch(e){next(e)}
});

app.get('/api/mechanics', dbRequired, adminOnly, async (_req, res, next) => {
  try { const { rows } = await db.query("SELECT id, name FROM users WHERE role='mechanic' AND status='active' ORDER BY name"); res.json(rows); } catch (e) { next(e); }
});
app.get('/api/customers', dbRequired, adminOnly, async (_req, res, next) => {
  try { const { rows } = await db.query("SELECT id, name, email, phone FROM users WHERE role='customer' AND status='active' ORDER BY name"); res.json(rows); } catch (e) { next(e); }
});
app.get('/api/admin/customer-search', dbRequired, adminOnly, async (req,res,next) => {
  try {
    const q = `%${String(req.query.q || '').trim()}%`;
    const {rows}=await db.query(`SELECT u.id,u.name,u.email,u.phone,u.status,v.id vehicle_id,v.registration_number,v.brand,v.model FROM users u LEFT JOIN vehicles v ON v.customer_id=u.id WHERE u.role='customer' AND (u.name LIKE ? OR u.phone LIKE ? OR v.registration_number LIKE ?) ORDER BY u.name LIMIT 100`,[q,q,q]);
    res.json(rows);
  } catch(e){next(e)}
});

app.get('/api/vehicles', dbRequired, adminOnly, async (req, res, next) => {
  try {
    const params = []; const clauses = [];
    if (req.query.customerId) { params.push(Number(req.query.customerId)); clauses.push(`v.customer_id=$${params.length}`); }
    if (req.query.customerEmail) { params.push(String(req.query.customerEmail).trim().toLowerCase()); clauses.push(`LOWER(u.email)=$${params.length}`); }
    if (req.query.registration) { params.push(String(req.query.registration).trim()); clauses.push(`upper(v.registration_number)=upper($${params.length})`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT v.*, u.name AS owner_name, (SELECT hs.score FROM health_scores hs WHERE hs.vehicle_id=v.id ORDER BY hs.recorded_date DESC,hs.id DESC LIMIT 1) AS health_score FROM vehicles v JOIN users u ON u.id=v.customer_id ${where} ORDER BY v.registration_number`, params);
    res.json(rows);
  } catch (e) { next(e); }
});
app.get('/api/service-records', dbRequired, adminOnly, async (req, res, next) => {
  try {
    const params=[]; let where='';
    if(req.query.vehicleId){params.push(Number(req.query.vehicleId));where='WHERE sr.vehicle_id=?';}
    const {rows}=await db.query(`SELECT sr.*,v.registration_number,v.brand,v.model,u.name AS customer_name,u.email,u.phone,mech.name AS mechanic_name
      FROM service_records sr JOIN vehicles v ON v.id=sr.vehicle_id JOIN users u ON u.id=v.customer_id
      LEFT JOIN users mech ON mech.id=sr.mechanic_id ${where} ORDER BY sr.service_date DESC,sr.id DESC LIMIT 500`,params);
    for(const row of rows){
      const parts=await db.query('SELECT part_name AS name,action,cost FROM service_parts WHERE service_record_id=?',[row.id]);
      const assessments=await db.query('SELECT component_key AS component,health_value AS health,action,notes FROM component_assessments WHERE service_record_id=?',[row.id]);
      row.parts=parts.rows; row.assessments=assessments.rows;
    }
    res.json(rows);
  } catch(e){next(e);}
});
app.post('/api/service-records', dbRequired, adminOnly, async (req, res, next) => {
  const b = req.body || {};
  if (!Number.isInteger(Number(b.vehicleId)) || !b.serviceDate || !b.serviceType || !Number.isFinite(Number(b.odometer)) || Number(b.odometer) < 0 || !Number.isFinite(Number(b.cost)) || Number(b.cost) < 0) return res.status(400).json({ error: 'Vehicle, service date, service type, non-negative odometer and cost are required.' });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const vehicleResult = await client.query('SELECT * FROM vehicles WHERE id=$1 FOR UPDATE', [Number(b.vehicleId)]);
    if (!vehicleResult.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Vehicle not found.' }); }
    const vehicle = vehicleResult.rows[0];
    if (Number(b.odometer) < Number(vehicle.current_km)) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Odometer cannot be lower than the latest recorded ${vehicle.current_km} km.` }); }
    const mechanicId = b.mechanicId && Number.isInteger(Number(b.mechanicId)) ? Number(b.mechanicId) : null;
    const created = await client.query(`INSERT INTO service_records(vehicle_id,mechanic_id,service_date,odometer,service_type,category,cost,remarks)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)`, [vehicle.id, mechanicId, b.serviceDate, Number(b.odometer), b.serviceType, b.category || null, Number(b.cost), b.remarks || null]);
    const serviceResult = await client.query('SELECT * FROM service_records WHERE id=$1', [created.insertId]);
    const service = serviceResult.rows[0];
    const assessments = b.components || {};
    for (const c of COMPONENTS) {
      const item = assessments[c.key]; if (!item || item.health === '' || item.health == null) continue;
      const health = Math.max(0, Math.min(100, Math.round(Number(item.health))));
      await client.query(`INSERT INTO component_assessments(service_record_id,vehicle_id,component_key,component_name,health_value,action,notes,part_cost)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)`, [service.id, vehicle.id, c.key, c.name, health, ['serviced','replaced','repaired','inspected','not_touched'].includes(item.action) ? item.action : 'inspected', item.notes || null, Math.max(0, Number(item.cost) || 0)]);
      await client.query(`INSERT INTO component_health(vehicle_id,component_id,health_value,summary,last_updated)
        SELECT $1,id,$2,$3,now() FROM components WHERE lower(name)=lower($4)
        ON DUPLICATE KEY UPDATE health_value=VALUES(health_value),summary=VALUES(summary),last_updated=CURRENT_TIMESTAMP`, [vehicle.id, health, item.notes || `${item.action || 'inspected'} during service ${service.id}`, c.name]);
    }
    for (const part of Array.isArray(b.parts) ? b.parts : []) {
      if (!part.name || !['replaced','repaired'].includes(part.action)) continue;
      await client.query('INSERT INTO service_parts(service_record_id,part_name,action,cost) VALUES($1,$2,$3,$4)', [service.id, String(part.name).slice(0,100), part.action, Math.max(0, Number(part.cost) || 0)]);
    }
    await client.query('INSERT INTO odometer_logs(vehicle_id,service_record_id,odometer,source) VALUES($1,$2,$3,$4)', [vehicle.id, service.id, Number(b.odometer), 'service_record']);
    await client.query('UPDATE vehicles SET current_km=$1,updated_at=now() WHERE id=$2', [Number(b.odometer), vehicle.id]);
    const allAssessments = await client.query(`SELECT component_key,health_value FROM (SELECT ca.component_key,ca.health_value,ROW_NUMBER() OVER(PARTITION BY ca.component_key ORDER BY sr.service_date DESC,sr.id DESC) rn FROM component_assessments ca JOIN service_records sr ON sr.id=ca.service_record_id WHERE ca.vehicle_id=$1) ranked WHERE rn=1`, [vehicle.id]);
    const componentMap = {}; for (const row of allAssessments.rows) componentMap[row.component_key] = { health: row.health_value };
    const factorRows = await client.query('SELECT factor_key,factor_value FROM vehicle_factor_snapshots WHERE vehicle_id=$1 ORDER BY created_at DESC LIMIT 8', [vehicle.id]);
    const factors = {}; for (const row of factorRows.rows) if (!(row.factor_key in factors)) factors[row.factor_key] = row.factor_value;
    if (b.factors && typeof b.factors === 'object') for (const [key,value] of Object.entries(b.factors)) {
      await client.query('INSERT INTO vehicle_factor_snapshots(vehicle_id,service_record_id,factor_key,factor_value) VALUES($1,$2,$3,$4)', [vehicle.id,service.id,key,String(value)]); factors[key] = String(value);
    }
    const calculation = calculateHealth(componentMap, factors, { manufacturingYear: vehicle.manufacturing_year, annualKm: b.annualKm });
    await client.query('INSERT INTO health_scores(vehicle_id,score,status,explanation,recorded_date) VALUES($1,$2,$3,$4,$5)', [vehicle.id,calculation.score,calculation.status,`Component score ${calculation.componentScore}; driving/condition penalty ${calculation.factorPenalty}; age penalty ${calculation.agePenalty}.`, b.serviceDate]);
    const componentLookup = await client.query('SELECT id,name FROM components'); const componentIds = new Map(componentLookup.rows.map(r => [r.name.toLowerCase(),r.id]));
    await client.query("UPDATE recommendations SET status='resolved' WHERE vehicle_id=$1 AND status='open'", [vehicle.id]);
    for (const rec of calculation.recommendations) {
      const severity = rec.severity === 'critical' ? 'attention' : rec.severity;
      await client.query('INSERT INTO recommendations(vehicle_id,component_id,severity,title,message) VALUES($1,$2,$3,$4,$5)', [vehicle.id, rec.component ? componentIds.get(rec.component.toLowerCase()) || null : null, ['good','moderate','attention'].includes(severity) ? severity : 'attention', rec.title, rec.message]);
    }
    const serviceHistoryForRules = await client.query(`SELECT sr.service_date,sr.odometer,sr.service_type,COALESCE(ca.component_key,sr.category) AS category
      FROM service_records sr LEFT JOIN component_assessments ca ON ca.service_record_id=sr.id
      WHERE sr.vehicle_id=$1 ORDER BY sr.service_date DESC,sr.id DESC`, [vehicle.id]);
    const nextServices = calculateNextServices(componentMap, Number(b.odometer), serviceHistoryForRules.rows);
    await client.query('DELETE FROM next_service_items WHERE vehicle_id=$1', [vehicle.id]);
    for (const item of nextServices) {
      await client.query('INSERT INTO next_service_items(vehicle_id,label,remaining_km,interval_km,status) VALUES($1,$2,$3,$4,$5)', [vehicle.id, item.component, item.remainingKm == null ? 0 : item.remainingKm, item.intervalKm || 0, item.status]);
    }
    await client.query('INSERT INTO remaining_life_estimates(vehicle_id,years_range,km_range,confidence) VALUES($1,$2,$3,$4)', [vehicle.id, `${calculation.remainingLife.yearsLow}-${calculation.remainingLife.yearsHigh} years`, `${calculation.remainingLife.kmLow}-${calculation.remainingLife.kmHigh} km`, calculation.remainingLife.confidence]);
    await client.query('INSERT INTO notifications(vehicle_id,user_id,title,message,kind) VALUES($1,$2,$3,$4,$5)', [vehicle.id,vehicle.customer_id,'Vehicle service record updated',`A service record was added at ${Number(b.odometer).toLocaleString()} km. Current rule-based health score: ${calculation.score}/100.`, 'service']);
    await client.query('COMMIT');
    res.status(201).json({ service, health: calculation, nextServices });
  } catch (e) { await client.query('ROLLBACK'); next(e); } finally { client.release(); }
});
app.post('/api/vehicles/:id/odometer', dbRequired, adminOnly, async (req, res, next) => {
  const km = Number(req.body?.odometer);
  if (!Number.isInteger(km) || km < 0) return res.status(400).json({ error: 'Odometer must be a non-negative whole number.' });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const v = await client.query('SELECT * FROM vehicles WHERE id=$1 FOR UPDATE', [Number(req.params.id)]);
    if (!v.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Vehicle not found.' }); }
    if (km < v.rows[0].current_km) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Odometer must be at least ${v.rows[0].current_km} km.` }); }
    await client.query('UPDATE vehicles SET current_km=$1,updated_at=now() WHERE id=$2', [km, Number(req.params.id)]);
    await client.query('INSERT INTO odometer_logs(vehicle_id,odometer,source) VALUES($1,$2,$3)', [Number(req.params.id),km,'customer_update']);
    await client.query('COMMIT'); res.json({ vehicleId: Number(req.params.id), currentKm: km });
  } catch (e) { await client.query('ROLLBACK'); next(e); } finally { client.release(); }
});


app.post('/api/admin/recalculate-all', dbRequired, adminOnly, async (req, res, next) => {
  try {
    const vehiclesResult = await db.query(
      'SELECT * FROM vehicles ORDER BY id'
    );

    const results = [];

    for (const vehicle of vehiclesResult.rows) {
      // Latest component health assessments
      const assessmentResult = await db.query(`
        SELECT component_key, health_value
        FROM (
          SELECT component_key, health_value,
            ROW_NUMBER() OVER (
              PARTITION BY component_key
              ORDER BY created_at DESC, id DESC
            ) AS rn
          FROM component_assessments
          WHERE vehicle_id = ?
        ) ranked
        WHERE rn = 1
      `, [vehicle.id]);

      const componentMap = {};
      for (const row of assessmentResult.rows) {
        componentMap[row.component_key] = {
          health: row.health_value
        };
      }

      // Latest value for each vehicle factor
      const factorResult = await db.query(`
        SELECT factor_key, factor_value
        FROM (
          SELECT factor_key, factor_value,
            ROW_NUMBER() OVER (
              PARTITION BY factor_key
              ORDER BY created_at DESC, id DESC
            ) AS rn
          FROM vehicle_factor_snapshots
          WHERE vehicle_id = ?
        ) ranked
        WHERE rn = 1
      `, [vehicle.id]);

      const factors = {};
      for (const row of factorResult.rows) {
        factors[row.factor_key] = row.factor_value;
      }

      // Existing service history; do not create fake records
      const historyResult = await db.query(`
        SELECT *
        FROM service_records
        WHERE vehicle_id = ?
        ORDER BY service_date DESC, id DESC
      `, [vehicle.id]);

      const vehicleForCalculation = {
        manufacturingYear: vehicle.manufacturing_year,
        annualKm: vehicle.annual_km || 12000
      };

      const health = calculateHealth(
        componentMap,
        factors,
        vehicleForCalculation
      );

      // Save a new health-score history entry
      await db.query(`
        INSERT INTO health_scores
          (vehicle_id, score, status, explanation, recorded_date)
        VALUES (?, ?, ?, ?, CURRENT_DATE)
      `, [
        vehicle.id,
        health.score,
        health.status,
        `Component score ${health.componentScore}; factor penalty ${health.factorPenalty}; age penalty ${health.agePenalty}. Rule-based estimate.`
      ]);

      // Rebuild the next-service list for this vehicle
      const nextServices = calculateNextServices(
        componentMap,
        vehicle.current_km,
        historyResult.rows
      );

      await db.query(
        'DELETE FROM next_service_items WHERE vehicle_id = ?',
        [vehicle.id]
      );

      for (const item of nextServices) {
        await db.query(`
          INSERT INTO next_service_items
            (vehicle_id, label, remaining_km, interval_km, status)
          VALUES (?, ?, ?, ?, ?)
        `, [
          vehicle.id,
          item.component,
          item.remainingKm ?? 0,
          item.intervalKm || 0,
          item.status
        ]);
      }

      // Save estimated remaining life
      await db.query(`
        INSERT INTO remaining_life_estimates
          (vehicle_id, years_range, km_range, confidence)
        VALUES (?, ?, ?, ?)
      `, [
        vehicle.id,
        `${health.remainingLife.yearsLow}-${health.remainingLife.yearsHigh} years`,
        `${health.remainingLife.kmLow}-${health.remainingLife.kmHigh} km`,
        health.remainingLife.confidence
      ]);

      results.push({
        vehicleId: vehicle.id,
        registrationNumber: vehicle.registration_number,
        healthScore: health.score,
        healthStatus: health.status,
        nextServicesSaved: nextServices.length,
        existingServiceRecords: historyResult.rows.length
      });
    }

    res.json({
      success: true,
      vehiclesProcessed: results.length,
      message: 'Health calculations and next-service data saved.',
      results
    });
  } catch (error) {
    next(error);
  }
});


app.get('/api/vehicles/:id/intelligence', dbRequired, adminOnly, async (req, res, next) => {
  try {
    const vehicleResult = await db.query('SELECT * FROM vehicles WHERE id=$1', [Number(req.params.id)]);
    if (!vehicleResult.rowCount) return res.status(404).json({ error: 'Vehicle not found.' });
    const vehicle = vehicleResult.rows[0];
    const history = await db.query('SELECT * FROM service_records WHERE vehicle_id=$1 ORDER BY service_date DESC,id DESC', [vehicle.id]);
    const assessments = await db.query(`SELECT component_key,component_name,health_value,action,notes,service_record_id FROM (SELECT component_key,component_name,health_value,action,notes,service_record_id,ROW_NUMBER() OVER(PARTITION BY component_key ORDER BY created_at DESC,id DESC) rn FROM component_assessments WHERE vehicle_id=$1) ranked WHERE rn=1`, [vehicle.id]);
    const componentMap = {}; for (const row of assessments.rows) componentMap[row.component_key] = { health: row.health_value, action: row.action, notes: row.notes };
    const factorsResult = await db.query(`SELECT factor_key,factor_value FROM (SELECT factor_key,factor_value,ROW_NUMBER() OVER(PARTITION BY factor_key ORDER BY created_at DESC,id DESC) rn FROM vehicle_factor_snapshots WHERE vehicle_id=$1) ranked WHERE rn=1`, [vehicle.id]);
    const factors = Object.fromEntries(factorsResult.rows.map(r => [r.factor_key,r.factor_value]));
    const health = calculateHealth(componentMap,factors,vehicle);
    const nextServices = calculateNextServices(componentMap,vehicle.current_km,history.rows);
    const costs = await db.query('SELECT COALESCE(SUM(cost),0) AS lifetime_cost, COUNT(*) AS service_count FROM service_records WHERE vehicle_id=$1', [vehicle.id]);
    res.json({ vehicle, health, nextServices, history: history.rows, assessments: assessments.rows, costs: costs.rows[0] });
  } catch (e) { next(e); }
});
app.get('/api/customer/notifications', dbRequired, async (req,res,next)=>{ try { const {rows}=await db.query('SELECT n.* FROM notifications n WHERE n.user_id=? ORDER BY n.created_at DESC LIMIT 100',[req.auth.sub]); res.json(rows); } catch(e){next(e)} });
app.get('/api/notifications/:userId', dbRequired, adminOnly, async (req,res,next) => {
  try { const { rows } = await db.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[Number(req.params.userId)]); res.json(rows); } catch(e) { next(e); }
});
app.patch('/api/notifications/:id/read', dbRequired, adminOnly, async (req,res,next) => {
  try { const result = await db.query('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=$1',[Number(req.params.id)]); if (!result.rowCount) return res.status(404).json({error:'Notification not found.'}); const {rows}=await db.query('SELECT * FROM notifications WHERE id=$1',[Number(req.params.id)]); res.json(rows[0]); } catch(e) { next(e); }
});

// Customer creation, profile editing and live report/alert endpoints.
app.post('/api/customers', dbRequired, adminOnly, async (req,res,next) => {
  const { name, email, phone } = req.body || {};
  if (!String(name||'').trim() || !String(email||'').trim() || String(phone||'').replace(/\D/g,'').length < 10) return res.status(400).json({error:'Customer name, email and a valid 10-digit mobile number are required.'});
  try {
    const result = await db.query("INSERT INTO users(name,email,password_hash,phone,role,avatar_initials,status) VALUES(?,?,?,?, 'customer', ?, 'active')", [String(name).trim(),String(email).trim().toLowerCase(),'SET_PASSWORD_ON_FIRST_LOGIN',String(phone||'').trim()||null,String(name).trim().split(/\\s+/).map(x=>x[0]).join('').slice(0,4).toUpperCase()]);
    const {rows}=await db.query("SELECT id,name,email,phone,status FROM users WHERE id=?",[result.insertId]);
    res.status(201).json(rows[0]);
  } catch(e) { if(e.code==='ER_DUP_ENTRY') return res.status(409).json({error:'A customer with this email already exists.'}); next(e); }
});
app.post('/api/vehicles', dbRequired, adminOnly, async (req,res,next)=>{
 const b=req.body||{}; if(!Number.isInteger(Number(b.customerId))||!String(b.registrationNumber||'').trim()||!String(b.brand||'').trim()||!String(b.model||'').trim()||!Number.isInteger(Number(b.manufacturingYear))) return res.status(400).json({error:'Customer, registration number, brand, model and manufacturing year are required.'});
 try { const result=await db.query('INSERT INTO vehicles(customer_id,registration_number,brand,model,variant,manufacturing_year,current_km) VALUES(?,?,?,?,?,?,?)',[Number(b.customerId),String(b.registrationNumber).trim().toUpperCase(),String(b.brand).trim(),String(b.model).trim(),String(b.variant||'').trim()||null,Number(b.manufacturingYear),Math.max(0,Number(b.currentKm)||0)]); const {rows}=await db.query('SELECT v.*,u.name AS owner_name FROM vehicles v JOIN users u ON u.id=v.customer_id WHERE v.id=?',[result.insertId]); res.status(201).json(rows[0]); }
 catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({error:'That registration number is already registered.'});next(e)}
});
app.patch('/api/users/profile', dbRequired, authRequired, async (req,res,next) => {
  const { currentEmail, name, email, phone } = req.body || {};
  if (!String(currentEmail||'').trim() || !String(name||'').trim() || !String(email||'').trim()) return res.status(400).json({error:'Current email, name and email are required.'});
  try {
    const result=await db.query("UPDATE users SET name=?,email=?,phone=?,avatar_initials=?,updated_at=CURRENT_TIMESTAMP WHERE email=?",[String(name).trim(),String(email).trim().toLowerCase(),String(phone||'').trim()||null,String(name).trim().split(/\\s+/).map(x=>x[0]).join('').slice(0,4).toUpperCase(),String(currentEmail).trim().toLowerCase()]);
    if(!result.rowCount) {
      const role = ['admin','customer','mechanic'].includes(req.body?.role) ? req.body.role : 'customer';
      try { await db.query('INSERT INTO users(name,email,password_hash,phone,role,avatar_initials,status) VALUES(?,?,?,?,?,?,?)',[String(name).trim(),String(email).trim().toLowerCase(),'PASSWORD_SETUP_REQUIRED',String(phone||'').trim()||null,role,String(name).trim().split(/\s+/).map(x=>x[0]).join('').slice(0,4).toUpperCase(),'active']); }
      catch(insertError) { if(insertError.code!=='ER_DUP_ENTRY') throw insertError; }
    }
    const {rows}=await db.query('SELECT id,name,email,phone,role,avatar_initials FROM users WHERE email=?',[String(email).trim().toLowerCase()]); res.json(rows[0]);
  } catch(e) { if(e.code==='ER_DUP_ENTRY') return res.status(409).json({error:'That email is already used by another account.'}); next(e); }
});
app.get('/api/reports/summary', dbRequired, adminOnly, async (_req,res,next)=>{
 try {
  const [customers,vehicles,services,spend,health]=await Promise.all([
   db.query("SELECT COUNT(*) total FROM users WHERE role='customer' AND status='active'"),
   db.query('SELECT COUNT(*) total FROM vehicles'),
   db.query('SELECT COUNT(*) total FROM service_records'),
   db.query('SELECT COALESCE(SUM(cost),0) total FROM service_records'),
   db.query('SELECT COALESCE(ROUND(AVG(h.score)),0) average FROM (SELECT vehicle_id,MAX(id) max_id FROM health_scores GROUP BY vehicle_id) latest JOIN health_scores h ON h.id=latest.max_id')
  ]);
  res.json({customers:Number(customers.rows[0].total),vehicles:Number(vehicles.rows[0].total),services:Number(services.rows[0].total),maintenanceSpend:Number(spend.rows[0].total),averageHealth:Number(health.rows[0].average)});
 } catch(e){next(e)}
});
app.get('/api/reports/export.csv', dbRequired, adminOnly, async (_req,res,next)=>{
 try {
  const {rows}=await db.query(`SELECT sr.id AS service_id,sr.service_date,sr.service_type,sr.category,sr.cost,sr.odometer,sr.remarks,v.registration_number,v.brand,v.model,u.name AS customer_name,u.email,u.phone FROM service_records sr JOIN vehicles v ON v.id=sr.vehicle_id JOIN users u ON u.id=v.customer_id ORDER BY sr.service_date DESC,sr.id DESC`);
  const fields=['service_id','service_date','service_type','category','cost','odometer','remarks','registration_number','brand','model','customer_name','email','phone'];
  const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const csv=[fields.join(','),...rows.map(r=>fields.map(f=>esc(r[f])).join(','))].join('\r\n');
  res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="autocare-service-report.csv"'); res.send('\uFEFF'+csv);
 } catch(e){next(e)}
});
app.post('/api/vehicles/:id/alert-owner', dbRequired, adminOnly, async (req,res,next)=>{
 try {
  const {rows}=await db.query('SELECT v.id,v.customer_id,v.brand,v.model,v.registration_number,u.name owner_name FROM vehicles v JOIN users u ON u.id=v.customer_id WHERE v.id=?',[Number(req.params.id)]);
  if(!rows.length) return res.status(404).json({error:'Vehicle not found.'});
  const v=rows[0]; const title=String(req.body?.title||'Vehicle health alert').slice(0,160); const message=String(req.body?.message||`${v.brand} ${v.model} (${v.registration_number}) needs attention. Please review the vehicle health and arrange an inspection.`).slice(0,4000);
  const result=await db.query('INSERT INTO notifications(vehicle_id,user_id,title,message,kind) VALUES(?,?,?,?,?)',[v.id,v.customer_id,title,message,'health_alert']);
  res.status(201).json({id:result.insertId,vehicleId:v.id,customerId:v.customer_id,title,message});
 } catch(e){next(e)}
});

app.use((err,_req,res,_next) => { console.error(err); res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message }); });
app.listen(port, () => console.log(`AutoCare API listening on http://localhost:${port}`));
