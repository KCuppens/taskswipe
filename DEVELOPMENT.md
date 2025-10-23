# Development Guide

Complete development setup and workflow guide for TaskSwipe contributors.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Database Management](#database-management)
- [Code Style & Quality](#code-style--quality)
- [Architecture Overview](#architecture-overview)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** 18.17+ or 20.5+
  - Check: `node --version`
  - Install: [nodejs.org](https://nodejs.org/)
- **npm** 9+ (comes with Node.js)
  - Check: `npm --version`
- **PostgreSQL** 14+
  - Check: `psql --version`
  - Install: [postgresql.org](https://www.postgresql.org/download/)
  - Alternative: Use Docker (see below)
- **Git**
  - Check: `git --version`
  - Install: [git-scm.com](https://git-scm.com/)

### Recommended Tools

- **VS Code** with extensions:
  - Prisma (Prisma.prisma)
  - ESLint (dbaeumer.vscode-eslint)
  - Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
  - TypeScript + JavaScript (built-in)
- **Postman** or **Thunder Client** for API testing
- **Docker Desktop** (if not using local PostgreSQL)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/KCuppens/taskswipe.git
cd taskswipe

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Start PostgreSQL service (macOS)
brew services start postgresql@16

# Start PostgreSQL service (Linux)
sudo systemctl start postgresql

# Start PostgreSQL service (Windows)
# Use pgAdmin or Services app

# Create database
createdb taskswipe

# Or using psql
psql postgres
CREATE DATABASE taskswipe;
\q
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run -d \
  --name taskswipe-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskswipe \
  -p 5432:5432 \
  postgres:16-alpine

# Verify it's running
docker ps

# View logs
docker logs taskswipe-db
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Or create .env manually
touch .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskswipe"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Optional: Node environment
NODE_ENV="development"
```

**Security Note:** Never commit `.env` to version control. It's in `.gitignore`.

### 4. Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Verify schema
npx prisma studio
# Opens GUI at http://localhost:5555
```

### 5. Seed Test Data (Optional)

```bash
# Add 50 sample tasks
npm run seed

# Verify in Prisma Studio
npx prisma studio
```

### 6. Start Development Server

```bash
# Start Next.js dev server with Turbopack
npm run dev

# Server will start at:
# - Local:   http://localhost:3000
# - Network: http://192.168.x.x:3000
```

### 7. Create First User

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. You'll be redirected to /triage

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Apply new migrations
npx prisma migrate dev

# 4. Start dev server
npm run dev

# 5. Make changes, test, commit
git add .
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Test locally
npm run dev

# 4. Run type checking
npx tsc --noEmit

# 5. Run linter
npm run lint

# 6. Commit with conventional commit message
git commit -m "feat(tasks): add bulk delete functionality"

# 7. Push and create PR
git push origin feature/my-feature
```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(triage): add undo button for swipe actions"
git commit -m "fix(auth): resolve JWT expiration issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "perf(tasks): optimize task list rendering with memoization"
```

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create migration for schema changes
npx prisma migrate dev --name descriptive_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Push schema without migrations (dev only)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

### Common Schema Modifications

**Adding a field:**

```prisma
// prisma/schema.prisma
model Task {
  // ... existing fields
  notes String? @db.Text  // Add new optional field
}
```

```bash
# Create migration
npx prisma migrate dev --name add_task_notes

# Prisma will:
# 1. Generate SQL migration file
# 2. Apply it to your database
# 3. Regenerate Prisma Client
```

**Modifying a field:**

```prisma
model Task {
  deadline DateTime?  // Changed from String to DateTime
}
```

```bash
npx prisma migrate dev --name change_deadline_to_datetime
```

### Database Backup & Restore

```bash
# Backup
pg_dump taskswipe > backup.sql

# Restore
psql taskswipe < backup.sql

# Docker backup
docker exec taskswipe-db pg_dump -U postgres taskswipe > backup.sql

# Docker restore
docker exec -i taskswipe-db psql -U postgres taskswipe < backup.sql
```

## Code Style & Quality

### TypeScript

```bash
# Type checking (no output = success)
npx tsc --noEmit

# Watch mode for type checking
npx tsc --noEmit --watch
```

**Type Safety Best Practices:**
- Always define types for function parameters and return values
- Use `interface` for object shapes, `type` for unions/intersections
- Avoid `any` - use `unknown` if type is truly unknown
- Enable strict mode in tsconfig.json (already enabled)

### ESLint

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Linting Rules:**
- No unused variables
- Consistent code formatting
- React hooks rules
- Next.js best practices

### Code Formatting

We use ESLint for formatting (Prettier-compatible rules).

```bash
# Format all files
npm run lint -- --fix
```

**VS Code Auto-Format:**

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "dbaeumer.vscode-eslint",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Import Organization

```typescript
// 1. React/Next.js imports
import { useState } from "react"
import { NextResponse } from "next/server"

// 2. Third-party libraries
import { motion } from "framer-motion"
import { z } from "zod"

// 3. Internal imports (@/ alias)
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// 4. Types
import type { Task } from "@/types"
```

## Architecture Overview

### Next.js App Router Structure

```
app/
├── (auth)/           # Route group for auth pages
│   ├── login/
│   └── signup/
├── (app)/            # Route group for protected pages
│   ├── triage/
│   ├── today/
│   ├── later/
│   └── layout.tsx    # Shared layout with nav
├── api/              # API routes
│   ├── auth/
│   └── tasks/
└── page.tsx          # Landing page
```

**Route Groups:** `(auth)` and `(app)` don't affect the URL, just organize files.

### Component Architecture

```
components/
├── ui/               # Reusable primitives
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── task-card.tsx     # Feature components
└── swipe-deck.tsx
```

**Component Patterns:**
- **Server Components** (default): Fetch data, no interactivity
- **Client Components** (`"use client"`): Hooks, events, browser APIs
- **Composition**: Build complex UIs from simple components

### State Management

We use React built-in state management:

- `useState` - Local component state
- `useEffect` - Side effects
- Context API - Shared state (if needed)
- Server components - Server-side data fetching

**No Redux/Zustand** - Keep it simple!

### Authentication Flow

```
1. User visits /triage
   ↓
2. Middleware (middleware.ts) checks JWT
   ↓
3. If no JWT → redirect to /login
   ↓
4. User logs in
   ↓
5. NextAuth creates JWT session
   ↓
6. Middleware allows access
   ↓
7. Page fetches user data with auth()
```

**Key Files:**
- `middleware.ts` - Route protection (Edge runtime)
- `lib/auth.ts` - NextAuth config (Node.js runtime)
- `lib/auth.edge.ts` - Lightweight auth for middleware

### API Design

**RESTful conventions:**

```
GET    /api/tasks           # List tasks
POST   /api/tasks           # Create task
PATCH  /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
```

**Response format:**

```typescript
// Success
{
  "id": "123",
  "title": "Task",
  ...
}

// Error
{
  "error": "Task not found"
}
```

**Status codes:**
- 200 OK - Success
- 201 Created - Resource created
- 400 Bad Request - Validation error
- 401 Unauthorized - Not authenticated
- 404 Not Found - Resource doesn't exist
- 500 Internal Server Error - Server error

## Common Tasks

### Adding a New Page

```bash
# 1. Create page file
mkdir -p app/(app)/mypage
touch app/(app)/mypage/page.tsx
```

```typescript
// app/(app)/mypage/page.tsx
export default function MyPage() {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  )
}
```

```bash
# 2. Add navigation link
# Edit app/(app)/layout.tsx
```

```typescript
<Link href="/mypage">My Page</Link>
```

### Adding a New API Route

```bash
# 1. Create route file
mkdir -p app/api/myroute
touch app/api/myroute/route.ts
```

```typescript
// app/api/myroute/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Your logic here
  return NextResponse.json({ message: "Success" })
}
```

### Adding a Database Model

```prisma
// prisma/schema.prisma

model MyModel {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model User {
  // ... existing fields
  myModels  MyModel[]
}
```

```bash
# Create and apply migration
npx prisma migrate dev --name add_my_model

# Use in API route
import { prisma } from "@/lib/db"

const items = await prisma.myModel.findMany({
  where: { userId: session.user.id }
})
```

### Adding a UI Component

```bash
# Create component file
touch components/ui/my-component.tsx
```

```typescript
// components/ui/my-component.tsx
import { cn } from "@/lib/utils"

interface MyComponentProps {
  children: React.ReactNode
  className?: string
}

export function MyComponent({ children, className }: MyComponentProps) {
  return (
    <div className={cn("p-4 border rounded", className)}>
      {children}
    </div>
  )
}
```

```typescript
// Use in page
import { MyComponent } from "@/components/ui/my-component"

<MyComponent className="bg-blue-100">
  Hello!
</MyComponent>
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U postgres -d taskswipe

# Check if PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Docker
docker ps
docker logs taskswipe-db
```

**Common fixes:**
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Ensure database exists: `createdb taskswipe`
- Check firewall/network settings

### Prisma Client Not Found

```bash
# Regenerate Prisma Client
npx prisma generate

# If still fails, clean and regenerate
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart TS server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Build Fails on Vercel

**Check build locally first:**

```bash
npm run build

# If successful locally but fails on Vercel:
# 1. Check environment variables in Vercel dashboard
# 2. Ensure DATABASE_URL is set
# 3. Check build logs for specific error
```

### "Module not found" Errors

**Check import paths:**

```typescript
// ❌ Wrong
import { Button } from "components/ui/button"

// ✅ Correct
import { Button } from "@/components/ui/button"
```

**Restart dev server:**

```bash
# Stop server (Ctrl+C)
# Clear cache
rm -rf .next
# Restart
npm run dev
```

### Hot Reload Not Working

```bash
# 1. Restart dev server
# 2. Clear .next cache
rm -rf .next
npm run dev

# 3. If using Docker, check file watching
# Add to next.config.js:
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}
```

## Performance Tips

### Development Speed

```bash
# Use Turbopack (enabled by default in dev)
npm run dev  # Already uses --turbo

# Faster installs
npm ci  # Instead of npm install (uses package-lock.json)
```

### Debugging

```typescript
// Server-side logging (API routes, Server Components)
console.log("Debug:", data)  // Appears in terminal

// Client-side logging (Client Components)
console.log("Debug:", data)  // Appears in browser console

// Inspect Network requests
// Chrome DevTools → Network tab
```

**VS Code Debugging:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

## Getting Help

1. Check [TROUBLESHOOTING](#troubleshooting) section above
2. Search [GitHub Issues](https://github.com/KCuppens/taskswipe/issues)
3. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment info (OS, Node version, etc.)

---

**Happy coding!** 🚀
