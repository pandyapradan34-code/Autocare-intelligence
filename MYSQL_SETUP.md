# AutoCare Intelligence — MySQL setup (Windows)

1. Install MySQL Server 8.0+ and MySQL Workbench.
2. Open Workbench and connect to your local MySQL server.
3. Open a SQL tab and run:

```sql
CREATE DATABASE autocare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autocare;
```

4. In Workbench choose **File → Open SQL Script**, select `backend/schema.mysql.sql`, then click the lightning bolt to execute.
5. Copy `backend/.env.example` to `backend/.env`; fill in your MySQL password.
6. Open terminal in the project folder and run:

```powershell
cd backend
npm install
npm start
```

7. Open `http://localhost:3000/api/healthcheck`. Expected JSON: `{"status":"ok","database":true}`.
8. In another terminal run the frontend as usual.

Use the MySQL schema, not the old PostgreSQL `schema.sql`. This setup requires MySQL 8.0+.
