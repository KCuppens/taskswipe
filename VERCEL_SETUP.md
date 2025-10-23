# Vercel Deployment Setup Guide

Step-by-step guide to fix the current deployment errors and get TaskSwipe running on Vercel.

## Current Issues

Based on the logs, you're seeing these errors:
```
[auth][error] MissingSecret: Please define a `secret`
[TypeError: Invalid URL] { input: 'undefined' }
```

This means the environment variables are not set in Vercel.

## Quick Fix Steps

### Step 1: Set Up Database (Choose One Option)

#### Option A: Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Click "Create Project"
   - Name: `taskswipe`
   - Region: Choose closest to your users
4. Click on "Connection Details"
5. Copy the connection string (starts with `postgresql://`)

#### Option B: Vercel Postgres

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
cd taskswipe
vercel link

# Create database
vercel postgres create taskswipe-db

# Copy the connection string shown
```

#### Option C: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project: `taskswipe`
3. Go to Settings → Database
4. Copy "Connection string" (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

### Step 2: Generate Auth Secret

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use online generator
# https://generate-secret.vercel.app/32
```

Copy the generated secret (should be ~44 characters).

### Step 3: Add Environment Variables to Vercel

**Via Vercel Dashboard (Easiest):**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your `taskswipe` project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

   **DATABASE_URL**
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```
   - Value: Your database connection string from Step 1
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **NEXTAUTH_SECRET**
   ```
   your-generated-secret-from-step-2
   ```
   - Value: Your generated secret from Step 2
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **NEXTAUTH_URL**
   ```
   https://taskswipe.vercel.app
   ```
   - Value: Your Vercel deployment URL (or custom domain)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. Click **Save** for each variable

**Via Vercel CLI (Alternative):**

```bash
# Set DATABASE_URL
vercel env add DATABASE_URL
# When prompted:
# - Enter the value: your-database-connection-string
# - Select environments: Production, Preview, Development

# Set NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET
# Enter your generated secret

# Set NEXTAUTH_URL
vercel env add NEXTAUTH_URL
# Enter: https://taskswipe.vercel.app (or your domain)
```

### Step 4: Run Database Migrations

```bash
# Use the DATABASE_URL from Step 1
DATABASE_URL="your-connection-string" npx prisma migrate deploy

# If migrations fail, try db push (one-time setup)
DATABASE_URL="your-connection-string" npx prisma db push
```

Expected output:
```
✓ Applying migration `20240101000000_init`
✓ Database is now in sync with your schema
```

### Step 5: Redeploy

**Via Dashboard:**
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

**Via CLI:**
```bash
vercel --prod
```

**Via Git:**
```bash
# Make any small change or use --allow-empty
git commit --allow-empty -m "chore: redeploy with env vars"
git push origin main
```

### Step 6: Verify Deployment

1. Wait for deployment to complete (~2 minutes)
2. Visit your URL: `https://taskswipe.vercel.app`
3. You should see the landing page
4. Click "Sign Up" and create an account
5. You should be redirected to `/triage`

## Troubleshooting

### Still Seeing "MissingSecret" Error

**Check environment variables are set:**

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify all 3 variables are listed
3. Make sure they're enabled for "Production"
4. Redeploy

**Or via CLI:**
```bash
# List all environment variables
vercel env ls

# Should show:
# DATABASE_URL (Production, Preview, Development)
# NEXTAUTH_SECRET (Production, Preview, Development)
# NEXTAUTH_URL (Production, Preview, Development)
```

### Database Connection Errors

**Error: "Can't reach database server"**

Check your connection string format:
```
✅ Correct: postgresql://user:pass@host.region.provider.com:5432/db?sslmode=require
❌ Wrong: postgresql://user:pass@localhost:5432/db
```

**Test connection:**
```bash
# Replace with your connection string
DATABASE_URL="your-string" npx prisma db execute --stdin <<< "SELECT 1"

# Should output: No rows returned
```

### Build Fails on Vercel

**Check build logs:**
1. Go to Deployments tab
2. Click on failed deployment
3. Click "View Build Logs"

**Common issues:**

**TypeScript errors:**
```bash
# Test locally first
npm run build

# Should succeed with no errors
```

**Prisma errors:**
```
Error: @prisma/client did not initialize yet
```

**Fix:** Build command should include `prisma generate`:
- Vercel should auto-detect this from `package.json` postinstall script
- If not, set Build Command in Settings to: `npm run build`

### Pages Load but Show Errors

**"Invalid URL" error:**
- `NEXTAUTH_URL` is missing or incorrect
- Should be: `https://your-domain.vercel.app`

**"Unauthorized" on all pages:**
- `NEXTAUTH_SECRET` is missing
- Generate new one and add to Vercel

**Database errors:**
- `DATABASE_URL` is missing or incorrect
- Verify connection string
- Run migrations: `DATABASE_URL="..." npx prisma migrate deploy`

## Environment Variables Reference

### DATABASE_URL
**Format:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Examples:**

Neon:
```
postgresql://user:pass@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Supabase:
```
postgresql://postgres:yourpassword@db.projectref.supabase.co:5432/postgres
```

Vercel Postgres:
```
postgres://default:pass@ep-abc-123.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

### NEXTAUTH_SECRET
**Requirements:**
- Minimum 32 characters
- Random, cryptographically secure
- Never commit to git
- Different for production vs development

**Generate:**
```bash
openssl rand -base64 32
```

**Example:** (don't use this!)
```
jK8vN2mQ5rT9wXzY1aC3dE6fH7gJ0kL4mN5oP8qR1sT2u
```

### NEXTAUTH_URL
**Format:**
```
https://your-domain.com
```

**Examples:**

Vercel default domain:
```
https://taskswipe.vercel.app
```

Custom domain:
```
https://taskswipe.com
```

**Note:** Use `https://` for production, `http://localhost:3000` for local dev only.

## Complete Setup Checklist

- [ ] Database created (Neon/Supabase/Vercel Postgres)
- [ ] `DATABASE_URL` added to Vercel (all environments)
- [ ] `NEXTAUTH_SECRET` generated and added to Vercel
- [ ] `NEXTAUTH_URL` added to Vercel (with https://)
- [ ] Database migrations run (`prisma migrate deploy`)
- [ ] Redeployed project
- [ ] Visited deployed URL
- [ ] Signed up and logged in successfully
- [ ] Can create and swipe tasks

## After Setup

Once environment variables are set and deployment succeeds:

1. **Create your first user:**
   - Visit https://taskswipe.vercel.app/signup
   - Create an account
   - Log in

2. **Test the app:**
   - Go to /triage
   - Try swiping tasks (if you seeded data)
   - Or create a new task using the + button

3. **Add custom domain (optional):**
   - Go to Settings → Domains
   - Add your domain
   - Update `NEXTAUTH_URL` to your custom domain
   - Redeploy

## Security Reminders

- ✅ Never commit `.env` files to git
- ✅ Use different secrets for dev/staging/production
- ✅ Keep `NEXTAUTH_SECRET` secure and private
- ✅ Use SSL/TLS for database connections (`sslmode=require`)
- ✅ Regularly rotate secrets (e.g., every 90 days)

## Support

If you're still having issues after following this guide:

1. Check Vercel build logs for specific errors
2. Verify all environment variables are set correctly
3. Test database connection locally
4. Check [Vercel Status](https://www.vercel-status.com/) for outages

---

**Need more help?**
- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [NextAuth.js Deployment Docs](https://next-auth.js.org/deployment)
- [Prisma Deployment Docs](https://www.prisma.io/docs/guides/deployment/deployment)
