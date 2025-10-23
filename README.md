# TaskSwipe

<div align="center">

A modern, Tinder-style task management app with swipe gestures for effortless task triage.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

[Demo](#) • [Features](#features) • [Getting Started](#getting-started) • [Documentation](TESTING.md)

</div>

## Overview

TaskSwipe reimagines task management with an intuitive swipe-based interface inspired by Tinder. Quickly triage your inbox with natural gestures, organize your day, and stay productive without the complexity of traditional todo apps.

### Why TaskSwipe?

- **Zero Friction**: Swipe through tasks in seconds
- **Mobile-First**: Optimized for touch with haptic feedback
- **Keyboard Friendly**: Full keyboard navigation for desktop users
- **Accessible**: WCAG AA compliant
- **Fast**: Optimistic updates, request deduplication, and smart caching

## Features

### Swipe-Based Triage
Organize tasks with intuitive gestures:
- 👉 **Swipe Right** → Add to Today
- 👈 **Swipe Left** → Defer to Later
- 👆 **Swipe Up** → Mark Complete
- 👇 **Swipe Down** → Archive

### Smart Features
- ⚡ **Quick Win Detection**: Identify tasks that take < 5 minutes
- ⏱️ **Deadline Tracking**: Visual urgency indicators
- ↩️ **Undo System**: Instantly undo accidental swipes (5-second window)
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- 🎯 **Optimistic UI**: Instant feedback with automatic rollback on errors
- 🔐 **Secure Auth**: JWT-based authentication with NextAuth v5

### Task Management
- **Inbox**: Swipe through untriaged tasks
- **Today**: Focus on today's priorities with Quick Wins section
- **Later**: Review and reschedule deferred tasks
- **Completed**: Track your accomplishments (with completion timestamps)
- **Archived**: Keep your lists clean

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router, Server Components) |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | NextAuth.js v5 (JWT sessions) |
| **Styling** | Tailwind CSS v4 (new @theme syntax) |
| **Animations** | Framer Motion |
| **Gestures** | @use-gesture/react |
| **Icons** | Lucide React |
| **Validation** | Zod |

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/KCuppens/taskswipe.git
cd taskswipe
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```
*Note: Use `--legacy-peer-deps` due to Next.js 16/NextAuth v5 compatibility*

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskswipe"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database:**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) and create an account!

### Docker Setup (Alternative)

If you don't have PostgreSQL installed:

```bash
# Start PostgreSQL in Docker
docker run -d \
  --name taskswipe-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskswipe \
  -p 5432:5432 \
  postgres:16-alpine

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskswipe"
```

## Project Structure

```
taskswipe/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/               # Protected application pages
│   │   ├── triage/          # Main swipe interface
│   │   ├── today/           # Today's tasks
│   │   ├── later/           # Deferred tasks
│   │   └── layout.tsx       # App shell with navigation
│   ├── api/
│   │   ├── auth/            # NextAuth routes
│   │   └── tasks/           # Task CRUD endpoints
│   ├── globals.css          # Tailwind v4 config + CSS variables
│   └── page.tsx             # Landing/redirect page
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── skeleton.tsx
│   │   └── toast.tsx
│   ├── task-card.tsx        # Swipeable task card with gestures
│   ├── swipe-deck.tsx       # Card stack visualization
│   ├── task-list-item.tsx   # Memoized list item component
│   └── error-boundary.tsx   # Error handling wrapper
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Prisma client singleton
│   ├── utils.ts             # cn() and helpers
│   ├── api-client.ts        # API utilities with deduplication
│   ├── performance.ts       # debounce, throttle, memoize
│   └── hooks/
│       └── use-tasks.ts     # Custom hook for task operations
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
├── types/
│   └── next-auth.d.ts       # NextAuth type extensions
├── middleware.ts            # Protected route middleware
├── TESTING.md               # Comprehensive testing guide
└── BUILD_PLAN.md            # Original design and architecture
```

## Key Features Explained

### Triage Mode
The heart of TaskSwipe. Swipe through your inbox and make quick decisions:
- **Right (Blue border)**: "I'll do this today"
- **Left (Gray border)**: "I'll do this later"
- **Up (Amber border)**: "This is a quick win!" (adds to Today with priority)
- **Down (Red border)**: "Archive this"

Each swipe shows visual feedback and triggers haptic feedback on mobile devices.

### Quick Win Detection
When you swipe a task right, TaskSwipe asks: "Is this a quick win?" (< 5 minutes). Quick wins appear in a dedicated section on the Today page, helping you knock out small tasks first.

### Optimistic UI
All actions happen instantly in the UI. If the server request fails, the UI automatically rolls back. This creates a snappy, responsive experience even on slow connections.

### Performance Optimizations
- **Request Deduplication**: Prevents duplicate API calls
- **Memoization**: Components and callbacks are memoized
- **Caching**: 5-second TTL for task lists
- **Debouncing/Throttling**: For search and rapid actions
- **Skeleton Loading**: Smooth loading states

### Accessibility
- **Keyboard Navigation**: Tab through all elements, Enter/Space to activate
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Visible focus states for all interactive elements
- **Reduced Motion**: Respects prefers-reduced-motion setting
- **Touch Targets**: Minimum 44x44px on mobile (WCAG AA)
- **Color Contrast**: All text meets WCAG AA standards (4.5:1)

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/[...nextauth]` - NextAuth handlers (login, logout, session)

### Tasks
- `GET /api/tasks?status=inbox` - Fetch tasks (filter by status)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task (status, priority, etc.)
- `DELETE /api/tasks/:id` - Delete task permanently

All routes require authentication (JWT session).

## Database Schema

### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  tasks         Task[]
  // ... NextAuth fields
}
```

### Task
```prisma
model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      String    @default("inbox")  // inbox | today | later | completed | archived
  priority    String?                      // quick_win | normal
  deadline    DateTime?
  completedAt DateTime?
  position    Int       @default(0)
  userId      String
  user        User      @relation(fields: [userId], references: [id])

  @@index([userId, status])
  @@index([userId, deadline])
}
```

## Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open Prisma Studio (GUI)
npx prisma migrate dev   # Create and apply migrations
npx prisma generate      # Regenerate Prisma Client
npx prisma db push       # Push schema without migrations (dev only)
```

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing guide including:
- Manual testing checklists
- API endpoint testing
- Accessibility testing
- Responsive design testing
- Performance testing with Lighthouse
- Browser compatibility matrix

Quick test checklist:
- [ ] Sign up and login
- [ ] Swipe tasks in all 4 directions
- [ ] Test undo functionality
- [ ] Complete tasks on Today page
- [ ] Test on mobile device
- [ ] Check keyboard navigation

## Deployment

### Vercel (Recommended)

1. Push to GitHub (already done!)
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your deployment URL)
4. Deploy!

### Railway

```bash
railway login
railway init
railway add postgres
railway up
```

### Docker

```dockerfile
# Coming soon
```

## Performance Benchmarks

Lighthouse scores (target):
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

Metrics:
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

## Roadmap

### v1.1 (Next Release)
- [ ] Task creation UI in triage page
- [ ] Recurring task engine (daily, weekly, monthly)
- [ ] Dark mode support
- [ ] Task search and filtering

### v1.2
- [ ] Keyboard shortcuts panel
- [ ] Task dependencies
- [ ] Bulk actions
- [ ] Analytics dashboard

### v2.0
- [ ] PWA support (offline mode)
- [ ] Task sharing/collaboration
- [ ] Mobile apps (React Native)
- [ ] AI-powered task suggestions

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure:
- Code follows existing style (ESLint)
- All tests pass
- Accessibility standards are maintained
- Performance isn't degraded

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspiration: Tinder's swipe interface
- UI Components: [shadcn/ui](https://ui.shadcn.com/)
- Icons: [Lucide](https://lucide.dev/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**Built with [Claude Code](https://claude.com/claude-code)**

Made with ❤️ for productive developers

[⬆ back to top](#taskswipe)

</div>
