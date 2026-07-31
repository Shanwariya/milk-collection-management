# Milk Collection Management System - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Milk Collection Management System as a production web application.

---

## PRODUCTION DATABASE REQUIREMENT

> [!IMPORTANT]
> **PostgreSQL IS REQUIRED FOR PRODUCTION**
> - **Local Development**: Falling back to `db.json` file storage is permitted when `NODE_ENV !== 'production'`.
> - **Production Deployment**: **PostgreSQL IS MANDATORY**. `db.json` and persistent disk files are **NOT ALLOWED** in production because hosting containers reset file storage on restarts.
> - In production mode (`NODE_ENV=production`), if `DATABASE_URL` is missing, the backend server will fail immediately with a clear error:
>   `DATABASE_URL environment variable is required in production mode (NODE_ENV=production).`

---

## 1. Step-by-Step Production Deployment Workflow

### Step 1: Create a PostgreSQL Database
Create a free managed PostgreSQL database on any SQL cloud provider:
- **[Neon.tech](https://neon.tech)** (Recommended - Free Serverless PostgreSQL)
- **[Supabase](https://supabase.com)** (Free PostgreSQL Database)
- **[Render PostgreSQL](https://render.com)** (Managed PostgreSQL Service)

### Step 2: Obtain your PostgreSQL `DATABASE_URL`
Copy your database connection string from your PostgreSQL provider dashboard. It will look like:
```text
postgresql://user:password@ep-cool-host-12345.eastus2.azure.neon.tech/neondb?sslmode=require
```

---

### Step 3: Deploy the Backend Service (e.g. Render / Railway / DigitalOcean)

1. Push your project repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/) -> Click **New Web Service**.
3. Select your GitHub repository.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server/server.js`

### Step 4: Configure Backend Environment Variables
In your hosting platform environment settings, add the following **REQUIRED** backend variables:

| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Must be `production` | `production` |
| `DATABASE_URL` | **REQUIRED**: PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secure random secret string | `prod_jwt_super_secret_key_98765` |
| `CORS_ORIGIN` | Allowed production frontend URL | `https://your-app.vercel.app` |
| `PORT` | Node server port (auto-set by hosting platform) | `5000` |

> [!CAUTION]
> **SECURITY CHECK**: NEVER prefix `DATABASE_URL` or `JWT_SECRET` with `VITE_`. They must remain private to the backend server and must NEVER be exposed to the browser frontend.

---

### Step 5: Deploy the Frontend Web App (e.g. Vercel / Netlify / Cloudflare Pages)

1. Log in to [Vercel Dashboard](https://vercel.com/) -> Click **Add New Project**.
2. Import your GitHub repository.
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
4. The project includes [vercel.json](file:///c:/Users/USER-PC/.gemini/antigravity-ide/scratch/milk-collection-app/vercel.json) at the root directory to handle client-side React Router rewrites (`/index.html`) so refreshing or accessing sub-routes directly works without Vercel 404 errors.
5. Click **Deploy**.

---

### Step 6: Configure CORS for Production

In your backend hosting dashboard (e.g. Render), set `CORS_ORIGIN` to your deployed Vercel frontend URL:
```text
CORS_ORIGIN=https://your-app.vercel.app
```
This restricts API access strictly to your deployed frontend domain in production.

---

### Step 7: Verify Production Functionality & Persistence

Once deployed, perform the following verification workflow on your live URL:

1. **Test Woman Sign Up**:
   - Open live URL -> Click **Woman Sign Up** tab -> Register new supplier (e.g. Name: `Priya`, Username: `priya123`, Password: `Test@123`).
   - Confirm ID `M0001` is generated and saved in PostgreSQL.

2. **Test Woman Login**:
   - Log out -> Sign in with `priya123` / `Test@123` -> Confirm Priya's personal profile opens.

3. **Test Milkman Dashboard & Search**:
   - Log in as Milkman (`milkman` / `milk123`).
   - Confirm **Registered Women** displays `1`.
   - Click **Collect Milk** -> Type `P` -> Confirm `Priya (M0001)` appears in search dropdown.

4. **Test Milk Collection Entry**:
   - Record 5L Morning Cow Milk for `Priya`.
   - Confirm Dashboard displays `Today's Collection: 5.00 L` and revenue updates.

5. **Verify Database Persistence Across Restarts**:
   - Restart the backend service on Render/Railway.
   - Refresh live app -> Confirm `Priya`, her registered status (`1 Woman`), and her 5L milk collection remain **100% intact**.
