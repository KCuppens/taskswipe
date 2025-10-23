# Deployment Guide

Complete guide for deploying TaskSwipe to production environments.

## Table of Contents

- [Deployment Platforms](#deployment-platforms)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Railway](#railway)
  - [Render](#render)
  - [Self-Hosted (Docker)](#self-hosted-docker)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- GitHub repository with code pushed
- Production database (PostgreSQL)
- Domain name (optional but recommended)

## Deployment Platforms

### Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Step 1: Prepare Database

**Option A: Vercel Postgres**

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Create Postgres database
vercel postgres create taskswipe-db
```

**Option B: External PostgreSQL** (Neon, Supabase, Railway, etc.)

Get your connection string from your provider.

#### Step 2: Deploy to Vercel

**Via Vercel Dashboard (Easiest):**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NEXTAUTH_SECRET=your-secret-min-32-chars
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

6. Click "Deploy"

**Via CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to link/create project

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Redeploy with env vars
vercel --prod
```

#### Step 3: Run Database Migrations

```bash
# Connect to production database
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Verify
DATABASE_URL="your-production-url" npx prisma studio
```

#### Step 4: Configure Custom Domain (Optional)

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your domain: `taskswipe.com`
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL`:
   ```
   NEXTAUTH_URL=https://taskswipe.com
   ```

### Railway

Railway offers integrated database and app hosting.

#### Step 1: Create Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

#### Step 2: Deploy Project

**Via Dashboard:**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway auto-detects Next.js

**Via CLI:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to GitHub repo
railway link

# Add PostgreSQL
railway add postgres

# Deploy
railway up
```

#### Step 3: Configure Environment

```bash
# Add environment variables
railway variables set NEXTAUTH_SECRET=your-secret
railway variables set NEXTAUTH_URL=https://your-app.railway.app

# DATABASE_URL is auto-set by Railway Postgres
```

#### Step 4: Run Migrations

```bash
# Railway provides DATABASE_URL automatically
railway run npx prisma migrate deploy
```

#### Step 5: Custom Domain

1. Go to project settings
2. Click "Domains"
3. Add custom domain
4. Update `NEXTAUTH_URL` in Railway variables

### Render

#### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: taskswipe
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid)

#### Step 2: Create Database

1. Click "New +" → "PostgreSQL"
2. Name it `taskswipe-db`
3. Copy Internal Database URL

#### Step 3: Configure Environment

Add in Render dashboard:

```
DATABASE_URL=<internal-database-url>
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://your-app.onrender.com
```

#### Step 4: Run Migrations

```bash
# In Render Shell (from dashboard)
npx prisma migrate deploy
```

### Self-Hosted (Docker)

For VPS or dedicated servers.

#### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### Step 2: Update next.config.js

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  // ... other config
}
```

#### Step 3: Create docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/taskswipe
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: taskswipe
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Step 4: Deploy

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Step 5: Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/taskswipe
server {
    listen 80;
    server_name taskswipe.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/taskswipe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Add SSL with Let's Encrypt
sudo certbot --nginx -d taskswipe.com
```

## Database Setup

### Recommended Providers

| Provider | Free Tier | Pros | Cons |
|----------|-----------|------|------|
| **Neon** | 10GB | Serverless, autoscaling | Limited connections |
| **Supabase** | 500MB | Auth + DB, generous | Smaller free tier |
| **Railway** | $5 credit/mo | Integrated, simple | Credit-based |
| **Vercel Postgres** | 256MB | Integrated w/ Vercel | Smallest free tier |
| **Render** | 90 days | Auto-backups | Expires after 90 days |

### Neon Setup (Recommended)

```bash
# 1. Go to neon.tech
# 2. Create project: "taskswipe"
# 3. Copy connection string
# 4. Add to environment variables

# Connection string format:
# postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Connection Pooling

For serverless (Vercel), use connection pooling:

```env
# Direct connection (for migrations)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Pooled connection (for app)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
```

**Prisma setup for pooling:**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // For migrations
}
```

```env
# .env
DATABASE_URL="pooled-connection-string"
DIRECT_DATABASE_URL="direct-connection-string"
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for JWT signing (min 32 chars) | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://taskswipe.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `NEXTAUTH_URL_INTERNAL` | Internal URL (for containers) | Same as `NEXTAUTH_URL` |

### Generating Secrets

```bash
# Strong secret (32+ characters)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or online
# https://generate-secret.vercel.app/32
```

### Setting Variables by Platform

**Vercel:**
```bash
vercel env add VARIABLE_NAME
```

**Railway:**
```bash
railway variables set VARIABLE_NAME=value
```

**Render:**
Add in dashboard under "Environment"

**Docker:**
Create `.env.production`:
```env
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

Load in docker-compose.yml:
```yaml
env_file:
  - .env.production
```

## Post-Deployment

### 1. Run Database Migrations

```bash
# Production database
DATABASE_URL="your-prod-url" npx prisma migrate deploy
```

### 2. Verify Deployment

**Health checks:**

```bash
# Check homepage
curl https://your-domain.com

# Check API health
curl https://your-domain.com/api/tasks
# Should return 401 (Unauthorized) - means API is working

# Check database connection
# Try signing up through UI
```

### 3. Create Admin User

Visit your deployed app and create first user through signup flow.

### 4. Seed Data (Optional)

```bash
# If you want sample data in production
DATABASE_URL="your-prod-url" npm run seed
```

**Warning:** Only for demo/testing environments!

### 5. Configure Error Tracking (Optional)

**Sentry:**

```bash
npm install @sentry/nextjs

npx @sentry/wizard -i nextjs
```

**Update environment:**
```env
SENTRY_DSN=your-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=taskswipe
```

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to project
2. Analytics tab
3. Enable Web Analytics

### Railway Metrics

Built-in metrics available in dashboard:
- CPU usage
- Memory usage
- Network traffic

### Custom Monitoring

**Uptime monitoring:**
- [UptimeRobot](https://uptimerobot.com) (free)
- [BetterUptime](https://betteruptime.com)

**Performance monitoring:**
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Google Lighthouse](https://pagespeed.web.dev/)

**Database monitoring:**
- Neon dashboard (query stats, connection count)
- Prisma Studio (data inspection)

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**

```bash
# Add to build command
npm run build  # Already includes prisma generate in postinstall

# Or explicitly:
npx prisma generate && npm run build
```

**Error: TypeScript errors**

```bash
# Check locally first
npx tsc --noEmit

# If passes locally, check:
# 1. Node version matches (18+)
# 2. All files committed to git
# 3. Dependencies installed correctly
```

### Database Connection Fails

**Error: Can't reach database**

```bash
# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:5432/dbname

# Common mistakes:
# ❌ Missing protocol: user:pass@host:5432/dbname
# ❌ Wrong port: host:3306 (that's MySQL)
# ❌ Spaces: postgresql:// user:pass @ host:5432/dbname
# ✅ Correct: postgresql://user:pass@host:5432/dbname
```

**SSL Required:**

```env
# Add sslmode parameter
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Middleware Size Error

Our app has this fixed, but if you see:

```
Error: The Edge Function "middleware" size is 1.02 MB and your plan size limit is 1 MB.
```

**Solution:** Already implemented in `lib/auth.edge.ts` - lightweight middleware config.

### NextAuth Errors

**Error: NEXTAUTH_URL mismatch**

```bash
# Make sure NEXTAUTH_URL matches your deployed URL
# ❌ NEXTAUTH_URL=http://localhost:3000
# ✅ NEXTAUTH_URL=https://your-app.vercel.app

# Update environment variable and redeploy
```

**Error: JWT secret missing**

```bash
# Generate and set NEXTAUTH_SECRET
openssl rand -base64 32

# Add to environment variables
```

### Database Migration Issues

**Error: Migration failed**

```bash
# Check if database is accessible
DATABASE_URL="your-url" npx prisma db execute --stdin <<< "SELECT 1"

# If successful, try migration again
DATABASE_URL="your-url" npx prisma migrate deploy

# If fails, reset (WARNING: deletes data)
DATABASE_URL="your-url" npx prisma migrate reset
```

### Performance Issues

**Slow page loads:**

1. **Enable caching:**
   - Already implemented in API routes (Cache-Control headers)

2. **Optimize images:**
   ```typescript
   import Image from "next/image"

   <Image src="/image.jpg" width={500} height={300} alt="..." />
   ```

3. **Database indexing:**
   - Already configured in schema (@@index directives)

4. **Connection pooling:**
   - Use pooled DATABASE_URL (see Database Setup)

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is strong (32+ characters)
- [ ] Environment variables not committed to git
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] CORS configured (Next.js handles this)
- [ ] Rate limiting on API routes (implement if needed)
- [ ] Input validation with Zod (already implemented)
- [ ] SQL injection protected (Prisma handles this)
- [ ] XSS protected (React handles this)

## Scaling

### Database

**When to scale:**
- > 1000 active users
- > 10k tasks created
- Query times > 100ms

**Options:**
1. Upgrade database plan
2. Add read replicas
3. Implement caching (Redis)

### Application

**Horizontal scaling:**
- Vercel: Automatic
- Railway: Increase replicas
- Docker: Use load balancer (nginx)

**Vertical scaling:**
- Increase instance size/memory

## Backup Strategy

### Database Backups

**Automated (Recommended):**

Most providers offer automatic backups:
- Neon: Point-in-time recovery
- Render: Daily backups
- Railway: Database snapshots

**Manual:**

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240101.sql

# Automate with cron
0 2 * * * pg_dump $DATABASE_URL > /backups/backup-$(date +%Y%m%d).sql
```

### Code Backups

- Git repository (primary)
- Vercel deployment history
- Local git clones

## Rollback Procedure

**Vercel:**

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Railway:**

1. Deployments tab
2. Select previous deployment
3. Click "Redeploy"

**Database rollback:**

```bash
# Revert migration
npx prisma migrate resolve --rolled-back migration_name

# Or restore from backup
psql $DATABASE_URL < backup.sql
```

## Cost Estimation

### Free Tier Limits

**Vercel:**
- 100GB bandwidth/month
- 100 serverless function hours
- 6000 build minutes

**Neon (Database):**
- 10GB storage
- Unlimited queries

**Total: $0/month** for small projects!

### Paid Plans (when needed)

- Vercel Pro: $20/month
- Neon Pro: $19/month
- **Total: ~$40/month** for production use

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

**Deployment complete!** 🚀

Your TaskSwipe app is now live and accessible to users worldwide.
