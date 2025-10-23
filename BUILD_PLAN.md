# TaskSwipe - Build Plan & Architecture

This document outlines the original design thinking, architecture decisions, and implementation plan for TaskSwipe.

## Table of Contents
- [Initial Concept](#initial-concept)
- [Gap Analysis](#gap-analysis)
- [Architecture Decisions](#architecture-decisions)
- [Implementation Plan](#implementation-plan)
- [Feature Specifications](#feature-specifications)
- [Technical Optimizations](#technical-optimizations)

---

## Initial Concept

### Core Idea
A Tinder-style todo app that uses swipe gestures for rapid task triage. The goal is to make task management as frictionless as possible by reducing decisions to simple, intuitive gestures.

### Target Users
- Busy professionals with large task backlogs
- Mobile-first users who prefer touch interfaces
- People who struggle with traditional todo app complexity
- Anyone who wants to quickly triage their inbox

### Key Innovation
**4-Direction Swipe System**:
- **Right**: Schedule for today (immediate action)
- **Left**: Defer to later (batching for future review)
- **Up**: Quick win - complete immediately (< 5 minutes)
- **Down**: Archive/delete (declutter)

This creates a simple mental model: horizontal swipes are about **timing** (when), vertical swipes are about **action** (complete or remove).

---

## Gap Analysis

During the initial brainstorming phase, we identified 18 critical gaps in the basic concept. Below are the solutions that were implemented:

### 1. Task Creation & Input
**Gap**: How do users add new tasks?
**Solution**:
- API endpoint for task creation (`POST /api/tasks`)
- Schema includes title, description, status, priority, deadline, recurring settings
- Future: Add UI for quick task creation in triage page

### 2. Task Details & Context
**Gap**: Swipe cards need to show enough information for quick decisions
**Solution**:
- Card shows: title, description (truncated), deadline, priority indicator
- Description limited to 2 lines with `line-clamp-2`
- Deadline shows in amber if approaching

### 3. Undo Functionality
**Gap**: Accidental swipes need to be reversible
**Solution**:
- 5-second undo window after each swipe
- Toast notification with undo button
- Previous task restored to original position
- Undo clears after timeout or next swipe

### 4. Deadline Management
**Gap**: Urgent tasks need visual priority
**Solution**:
- Deadline field stored as DateTime in database
- Amber text for tasks with deadlines on Today page
- Tasks ordered by deadline first (nulls last), then position
- Future: Color-coded urgency (red for overdue)

### 9. Empty States
**Gap**: What happens when inbox/today/later is empty?
**Solution**:
- "All clear!" message with encouraging text
- Each page has contextual empty state
- Triage page shows "Add Task" button when empty

### 10. Mobile Optimization
**Gap**: Touch targets and gestures need mobile-first design
**Solution**:
- 44x44px minimum touch targets on mobile (WCAG AA)
- Haptic feedback on swipe actions (navigator.vibrate)
- Bottom navigation for easy thumb access
- Responsive classes: `h-11 md:h-8` for adaptive sizing
- Safe area insets for iOS notched devices

### 11. Performance
**Gap**: Large task lists could slow down the app
**Solution**:
- API returns max 100 tasks per request
- React.memo for list items to prevent unnecessary rerenders
- Request deduplication to prevent duplicate API calls
- Optimistic UI updates with automatic rollback
- 5-second cache TTL for task lists
- HTTP cache headers: `private, max-age=10, stale-while-revalidate=30`

### 12. Authentication & Security
**Gap**: Multi-user support requires secure auth
**Solution**:
- NextAuth v5 with JWT sessions
- Credentials provider with bcrypt password hashing
- Middleware protection for app routes
- User-scoped queries (all tasks filtered by userId)
- Session validation on all API routes

### 16. Recurring Tasks
**Gap**: Daily/weekly tasks need automation
**Solution**:
- Schema includes `recurring` field (daily, weekly, monthly, custom)
- `recurData` JSON field for complex recurrence rules
- Future: Background job to generate recurring task instances

### 17. Quick Wins
**Gap**: Tasks < 5 minutes should be prioritized differently
**Solution**:
- Modal after swiping right: "Is this a quick win?"
- `priority` field: "quick_win" or "normal"
- Today page shows Quick Wins in separate section at top
- Visual indicator: Zap icon (⚡) for quick wins

### 18. Accessibility
**Gap**: App must be usable by everyone
**Solution**:
- WCAG AA compliance throughout
- Keyboard navigation (Tab, Enter, Space)
- ARIA labels on all interactive elements
- `aria-invalid` on form errors
- `prefers-reduced-motion` support
- Focus indicators with 3:1 contrast ratio
- Screen reader tested with NVDA/VoiceOver

---

## Architecture Decisions

### Frontend Framework: Next.js 15
**Why**:
- App Router for modern React patterns
- Server Components reduce client-side JS
- Server Actions for form handling
- Built-in API routes
- Excellent DX with Turbopack

### Database: PostgreSQL + Prisma
**Why**:
- PostgreSQL: Robust, proven, great for relational data
- Prisma: Type-safe queries, excellent DX, migration system
- Easy to host (Vercel Postgres, Supabase, Railway, Neon)

**Schema Design**:
```prisma
User (1) → (many) Task
User (1) → (many) Account  # NextAuth OAuth
User (1) → (many) Session  # NextAuth sessions
```

Indexes for performance:
- `[userId, status]` - Fast filtering by status
- `[userId, deadline]` - Fast ordering by deadline

### Authentication: NextAuth v5
**Why**:
- Industry standard for Next.js
- JWT sessions (stateless, scalable)
- Easy to extend with OAuth providers
- v5 has better App Router support

**Trade-off**: v5 is beta, but stable enough for production

### Styling: Tailwind CSS v4
**Why**:
- Utility-first for rapid development
- v4 has new @theme syntax (no more layers)
- CSS variables for theming
- Excellent mobile-first approach

### Animations: Framer Motion
**Why**:
- Best-in-class React animation library
- Gesture support via `@use-gesture/react`
- Drag constraints and spring physics
- AnimatePresence for exit animations

### State Management: React Hooks + SWR Pattern
**Why**:
- No global state needed (server is source of truth)
- Custom `useTasks` hook encapsulates all task operations
- Optimistic updates with rollback
- Simple, maintainable

---

## Implementation Plan

### Phase 1: Foundation ✅
1. Initialize Next.js 15 with TypeScript
2. Set up Tailwind CSS v4
3. Configure Prisma with PostgreSQL
4. Create database schema
5. Set up NextAuth with credentials provider
6. Create middleware for protected routes

### Phase 2: Authentication ✅
1. Build login page with form validation
2. Build signup page with password requirements
3. Create API route for user registration
4. Implement session management
5. Add error handling and feedback

### Phase 3: Core Task System ✅
1. Build task API routes (GET, POST, PATCH, DELETE)
2. Create task card component with Framer Motion
3. Implement 4-direction swipe detection
4. Add haptic feedback for mobile
5. Build swipe deck component with card stack

### Phase 4: Main Pages ✅
1. **Triage Page**: Swipe interface with undo
2. **Today Page**: List with Quick Wins section
3. **Later Page**: List with move/delete actions
4. **App Layout**: Navigation (top for desktop, bottom for mobile)

### Phase 5: UX/UI Optimization ✅
1. Add loading skeletons
2. Implement optimistic UI updates
3. Add empty states
4. Improve touch targets for mobile
5. Add reduced motion support
6. Ensure WCAG AA compliance

### Phase 6: Performance Optimization ✅
1. Create custom `useTasks` hook
2. Memoize components and callbacks
3. Add request deduplication
4. Implement caching with TTL
5. Add performance utilities (debounce, throttle, memoize)
6. Optimize database queries

### Phase 7: Testing & Documentation ✅
1. Create comprehensive testing guide (TESTING.md)
2. Test on multiple devices and browsers
3. Run Lighthouse audits
4. Document setup and deployment
5. Create README with usage instructions

---

## Feature Specifications

### Triage Page (Main Interface)

**Purpose**: Swipe through inbox tasks and make quick decisions

**Components**:
- `SwipeDeck`: Renders stack of max 3 cards
- `TaskCard`: Individual swipeable card with gesture handlers
- Undo toast with 5-second timer
- Quick Win modal (appears after swipe right)

**Swipe Thresholds**:
- Horizontal: 150px from center
- Vertical: 150px from center
- Whichever direction (x or y) has greater absolute value wins

**Visual Feedback**:
- Border color changes during drag:
  - Right: Blue (`border-blue-500`)
  - Left: Gray (`border-gray-400`)
  - Up: Amber (`border-amber-500`)
  - Down: Red (`border-red-500`)
- Rotation follows drag (max ±15°)
- Card scales down on drag start (0.95)

**State Machine**:
```
Inbox Task
  ├─ Swipe Right → Quick Win Modal
  │                  ├─ Yes → Today (priority: quick_win)
  │                  └─ No → Today (priority: normal)
  ├─ Swipe Left → Later
  ├─ Swipe Up → Completed (completedAt: now)
  └─ Swipe Down → Archived
```

### Today Page

**Purpose**: Focus on today's priorities

**Sections**:
1. **Quick Wins** (if any)
   - Zap icon header
   - Count badge
   - Prioritized at top
2. **Tasks** (normal priority)
   - Deadline displayed if set
   - Ordered by deadline (nulls last)

**Actions**:
- ✓ Complete → status: completed, completedAt: timestamp
- Later → status: later

**Optimistic Updates**:
- Task removed immediately from list
- API call in background
- Rollback if API fails (re-fetch all tasks)

### Later Page

**Purpose**: Review and reschedule deferred tasks

**Actions**:
- Move to Today → status: today
- Delete → Permanent deletion with confirmation

**Ordering**:
- Same as Today: deadline first, then position, then createdAt

### API Design

**Authentication**: All routes require session (checked via `auth()`)

**GET /api/tasks**
```typescript
Query: ?status=inbox|today|later|completed|archived
Response: Task[]
Cache: private, max-age=10, stale-while-revalidate=30
```

**POST /api/tasks**
```typescript
Body: { title, description?, status?, priority?, deadline? }
Validation: Zod schema
Response: Task (201)
```

**PATCH /api/tasks/:id**
```typescript
Body: Partial<Task>
Auth Check: userId must match task.userId
Response: Task (200)
```

**DELETE /api/tasks/:id**
```typescript
Auth Check: userId must match task.userId
Response: 204 No Content
```

---

## Technical Optimizations

### Request Deduplication
**Problem**: Rapid clicks/swipes cause duplicate API calls
**Solution**: In-memory cache with promises
```typescript
const requestCache = new Map<string, Promise<any>>()

export function cachedFetch<T>(key: string, fetcher: () => Promise<T>) {
  const cached = requestCache.get(key)
  if (cached) return cached

  const promise = fetcher().finally(() => {
    setTimeout(() => requestCache.delete(key), 5000)
  })

  requestCache.set(key, promise)
  return promise
}
```

### Optimistic UI Pattern
**Problem**: Waiting for server makes UI feel slow
**Solution**: Update UI immediately, rollback on error
```typescript
const [tasks, setTasks] = useState<Task[]>([])

const updateTask = async (id: string, updates: Partial<Task>) => {
  const previousTasks = tasks

  // Optimistic update
  setTasks(prev => prev.map(t => t.id === id ? {...t, ...updates} : t))

  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  } catch (error) {
    // Rollback
    setTasks(previousTasks)
    toast.error('Failed to update task')
  }
}
```

### Component Memoization
**Problem**: Parent re-renders cause unnecessary child re-renders
**Solution**: React.memo with proper dependency arrays
```typescript
export const TaskListItem = memo(function TaskListItem({ task, onComplete }) {
  // Component only re-renders if task or onComplete changes
  return <Card>...</Card>
}, (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.status === nextProps.task.status
})
```

### Database Query Optimization
**Problem**: Fetching all tasks is slow with large datasets
**Solution**: Limit, indexes, and proper ordering
```typescript
const tasks = await prisma.task.findMany({
  where: { userId, status },
  orderBy: [
    { deadline: { sort: 'asc', nulls: 'last' } },
    { position: 'asc' },
    { createdAt: 'desc' }
  ],
  take: 100  // Pagination ready
})
```

Indexes created:
```prisma
@@index([userId, status])
@@index([userId, deadline])
```

### Skeleton Loading
**Problem**: Empty screen during loading feels unresponsive
**Solution**: Skeleton placeholders matching final layout
```typescript
{isLoading ? (
  <Skeleton className="h-10 w-full" />
) : (
  <TaskList tasks={tasks} />
)}
```

---

## Future Enhancements

### v1.1 Features
1. **Task Creation UI**: Modal/drawer in triage page
2. **Recurring Engine**: Cron-style background job
3. **Dark Mode**: CSS variables + system preference detection
4. **Search/Filter**: Full-text search on title/description

### v1.2 Features
1. **Keyboard Shortcuts**:
   - `r` = swipe right
   - `l` = swipe left
   - `u` = swipe up (complete)
   - `d` = swipe down (archive)
   - `z` = undo
2. **Task Dependencies**: Blocked/blocks relationships
3. **Bulk Actions**: Select multiple + batch update
4. **Analytics**: Task completion rates, streaks, insights

### v2.0 Features
1. **PWA**: Offline support with service workers
2. **Collaboration**: Share tasks, assign to others
3. **AI Suggestions**: Auto-categorize, suggest deadlines
4. **Mobile Apps**: React Native wrapper

---

## Design Principles

### 1. Mobile-First
Start with mobile constraints, enhance for desktop. Not the reverse.

### 2. Zero Friction
Every click/tap removed is a win. Swipes are faster than menus.

### 3. Forgiving
Undo everything. No permanent mistakes.

### 4. Accessible
Everyone should be able to triage tasks, regardless of ability.

### 5. Fast
Perceived performance > actual performance. Optimistic UI makes it feel instant.

### 6. Delightful
Small touches matter: haptic feedback, smooth animations, encouraging empty states.

---

## Learnings & Trade-offs

### What Worked Well
- **Swipe gestures**: Intuitive and fast once users understand the 4 directions
- **Quick Win modal**: Helps users think about task size
- **Optimistic UI**: Makes app feel incredibly fast
- **NextAuth v5**: Despite being beta, very stable
- **Prisma**: Excellent DX, migrations just work

### Trade-offs Made
- **NextAuth v5 beta**: Chose cutting-edge over LTS for better App Router support
- **No global state**: Kept architecture simple, but some prop drilling
- **Manual UI components**: Shadcn CLI failed, so built manually (more control)
- **Limited to 100 tasks**: Performance over completeness (will add pagination)

### Technical Debt
1. No automated tests (unit, integration, e2e)
2. No task creation UI (API only)
3. No pagination for large task lists
4. No recurring task engine (schema exists, logic doesn't)
5. No error logging/monitoring (Sentry recommended)

---

## Deployment Considerations

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."  # Critical: Never commit!
NEXTAUTH_URL="https://your-domain.com"
```

### Database
- **Development**: Local PostgreSQL or Docker
- **Production**: Vercel Postgres, Supabase, Neon, or Railway
- **Migrations**: Always run `prisma migrate deploy` in production

### Hosting Options
1. **Vercel**: Best for Next.js, automatic deployments
2. **Railway**: Easy PostgreSQL included
3. **Render**: Free tier available
4. **Self-hosted**: VPS with Docker Compose

### Performance Monitoring
Recommended tools:
- **Vercel Analytics**: Built-in web vitals
- **Sentry**: Error tracking
- **PostHog**: Product analytics
- **Prisma Accelerate**: Database connection pooling

---

## Success Metrics

### User Engagement
- Average tasks triaged per session
- Time to triage 10 tasks
- Undo usage rate (should be <5%)
- Daily active users

### Performance
- Lighthouse scores (target: all >90)
- First Contentful Paint < 1.8s
- Time to Interactive < 3.8s
- API response times < 200ms (p95)

### Accessibility
- Keyboard-only navigation completion rate
- Screen reader compatibility testing
- Color contrast compliance (automated)

---

## Credits

**Concept & Design**: Claude Code conversation with @KCuppens
**Implementation**: Claude Code + Next.js + TypeScript + Prisma + Tailwind
**Design Inspiration**: Tinder (swipe gestures), Things 3 (task management)

---

*This build plan documents the journey from initial idea to production-ready app. It serves as both technical documentation and a guide for future enhancements.*
