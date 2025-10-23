# TaskSwipe Testing Guide

This guide provides comprehensive instructions for testing all functionality of the TaskSwipe application.

## Setup for Testing

### 1. Initial Setup

```bash
# Clone and install dependencies
cd taskswipe
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optional: Seed test data
npx prisma db seed
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Manual Testing Checklist

### Authentication Flow

#### Sign Up
- [ ] Navigate to /signup
- [ ] Test empty form submission (should show validation errors)
- [ ] Test invalid email format (should show error)
- [ ] Test mismatched passwords (should show error)
- [ ] Test password less than 8 characters (should show error)
- [ ] Create account with valid credentials
- [ ] Verify redirect to /triage after successful signup
- [ ] Check that user appears in database

#### Login
- [ ] Navigate to /login
- [ ] Test empty form submission (should show validation errors)
- [ ] Test invalid credentials (should show "Invalid email or password")
- [ ] Test valid credentials (should redirect to /triage)
- [ ] Verify session persistence on page refresh
- [ ] Test "Sign up" link navigates to /signup

#### Sign Out
- [ ] Click "Sign Out" button in desktop navigation
- [ ] Verify redirect to /login
- [ ] Verify cannot access protected routes after logout
- [ ] Test mobile sign out (User icon button)

### Triage Page (Main Swipe Interface)

#### Swipe Gestures
- [ ] Create test tasks in inbox status
- [ ] **Swipe Right**: Task should move to "today" status
- [ ] **Swipe Left**: Task should move to "later" status
- [ ] **Swipe Up**: Task should be marked "completed"
- [ ] **Swipe Down**: Task should be "archived"
- [ ] Verify card animation during swipe
- [ ] Test threshold (150px) - partial swipes should bounce back
- [ ] Verify haptic feedback on mobile devices

#### Undo Functionality
- [ ] Perform any swipe action
- [ ] Click "Undo" button immediately
- [ ] Verify task returns to inbox
- [ ] Verify undo button disappears after timeout (5 seconds)
- [ ] Test multiple consecutive swipes and undo

#### Quick Win Detection
- [ ] Swipe a task right (to today)
- [ ] Open Quick Win modal
- [ ] Select "Yes" - task should get priority: "quick_win"
- [ ] Select "No" - task should have priority: "normal"
- [ ] Verify quick wins appear in separate section on Today page

#### Empty State
- [ ] Complete/archive all inbox tasks
- [ ] Verify empty state message appears
- [ ] Verify "Add Task" button is visible

#### Loading States
- [ ] Refresh page with slow network (throttle in DevTools)
- [ ] Verify skeleton loading animation appears
- [ ] Verify smooth transition when tasks load

### Today Page

#### Task Display
- [ ] Navigate to /today
- [ ] Verify tasks with status "today" appear
- [ ] Check Quick Wins section appears if tasks have priority: "quick_win"
- [ ] Verify normal tasks section appears
- [ ] Check task counts are accurate
- [ ] Verify deadline dates display correctly

#### Task Actions
- [ ] **Complete Button**: Click checkmark circle
  - Task should disappear from list (optimistic update)
  - Verify task status updated to "completed" in database
  - Verify completedAt timestamp is set
- [ ] **Later Button**: Click "Later" button
  - Task should disappear from list
  - Verify task status changed to "later"
- [ ] Test rollback on API failure (disconnect network, perform action)

#### Responsive Design
- [ ] Test on mobile: Verify larger touch targets (44px)
- [ ] Test on tablet: Check layout adapts appropriately
- [ ] Test on desktop: Verify compact layout
- [ ] Verify bottom navigation visible on mobile
- [ ] Verify top navigation visible on desktop

#### Empty State
- [ ] Complete or defer all tasks
- [ ] Verify "All clear!" message appears

### Later Page

#### Task Display
- [ ] Navigate to /later
- [ ] Verify tasks with status "later" appear
- [ ] Check tasks are ordered correctly
- [ ] Verify task details (title, description) display

#### Task Actions
- [ ] **Move to Today**: Click button
  - Task should disappear from Later list
  - Task should appear in Today list
  - Verify status changed to "today"
- [ ] **Delete Button**: Click delete icon
  - Confirmation dialog should appear
  - Confirm deletion - task removed from database
  - Cancel - task remains in list
- [ ] Test optimistic updates work correctly

#### Empty State
- [ ] Move or delete all tasks
- [ ] Verify empty state message appears

### Navigation

#### Desktop Navigation
- [ ] Verify logo "TaskSwipe" links to /triage
- [ ] Click each nav item (Triage, Today, Later)
- [ ] Verify active state indication
- [ ] Verify user email/name displays
- [ ] Test Sign Out button

#### Mobile Navigation
- [ ] Verify sticky top bar with logo and user icon
- [ ] Verify bottom navigation is fixed
- [ ] Test all three nav items (Triage, Today, Later)
- [ ] Verify active state indication
- [ ] Test touch targets are easy to tap
- [ ] Verify safe area insets on iOS devices

### API Endpoints

#### GET /api/tasks
```bash
# Test with curl or Postman
curl http://localhost:3000/api/tasks

# With status filter
curl http://localhost:3000/api/tasks?status=today

# Test without authentication (should return 401)
curl http://localhost:3000/api/tasks
```

Test cases:
- [ ] Returns 401 without authentication
- [ ] Returns user's tasks only
- [ ] Filters by status when provided
- [ ] Returns max 100 tasks
- [ ] Ordered by deadline, then position, then createdAt

#### POST /api/tasks
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test","status":"inbox"}'
```

Test cases:
- [ ] Returns 401 without authentication
- [ ] Returns 400 for invalid data (missing title)
- [ ] Creates task with valid data
- [ ] Returns 201 status code
- [ ] Default status is "inbox" if not provided
- [ ] Deadline converts string to Date

#### PATCH /api/tasks/:id
```bash
curl -X PATCH http://localhost:3000/api/tasks/[TASK_ID] \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","completedAt":"2025-10-23T12:00:00Z"}'
```

Test cases:
- [ ] Returns 401 without authentication
- [ ] Returns 404 for non-existent task
- [ ] Returns 403 when updating another user's task
- [ ] Updates task successfully
- [ ] Partial updates work (only status)
- [ ] Returns updated task data

#### DELETE /api/tasks/:id
```bash
curl -X DELETE http://localhost:3000/api/tasks/[TASK_ID]
```

Test cases:
- [ ] Returns 401 without authentication
- [ ] Returns 404 for non-existent task
- [ ] Returns 403 when deleting another user's task
- [ ] Deletes task successfully
- [ ] Returns 204 status code

### Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through all interactive elements in order
- [ ] Verify focus indicators are visible
- [ ] Test Enter/Space to activate buttons
- [ ] Test Escape to close modals
- [ ] Verify skip links work (if implemented)

#### Screen Reader Testing
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] Verify all buttons have accessible labels
- [ ] Check form inputs have associated labels
- [ ] Verify error messages are announced
- [ ] Test ARIA attributes are correct

#### Color Contrast
- [ ] Use browser DevTools to check contrast ratios
- [ ] Verify text meets WCAG AA standards (4.5:1)
- [ ] Test dark mode color contrast
- [ ] Verify focus indicators have 3:1 contrast

#### Motion Preferences
- [ ] Enable "Reduce Motion" in OS settings
- [ ] Verify animations are minimal/disabled
- [ ] Check prefers-reduced-motion media query works

### Responsive Design Testing

#### Mobile (320px - 767px)
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 12/13 Pro (390px)
- [ ] Test on Galaxy S8+ (360px)
- [ ] Verify bottom navigation visible and usable
- [ ] Check touch targets are 44px minimum
- [ ] Test swipe gestures work smoothly
- [ ] Verify safe area insets on notched devices

#### Tablet (768px - 1023px)
- [ ] Test on iPad (768px)
- [ ] Test on iPad Pro (1024px)
- [ ] Verify layout adapts appropriately
- [ ] Check navigation switches at correct breakpoint

#### Desktop (1024px+)
- [ ] Test on 1280px, 1440px, 1920px
- [ ] Verify top navigation displays
- [ ] Check max-width constraints work
- [ ] Test on ultrawide monitors (2560px+)

### Performance Testing

#### Lighthouse Audit
```bash
# Run Lighthouse in Chrome DevTools
# Target scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 90
# SEO: > 90
```

- [ ] Run audit on /triage
- [ ] Run audit on /today
- [ ] Run audit on /later
- [ ] Check First Contentful Paint < 1.8s
- [ ] Check Time to Interactive < 3.8s
- [ ] Check Cumulative Layout Shift < 0.1

#### Network Performance
- [ ] Test on Fast 3G throttling
- [ ] Verify optimistic UI updates work
- [ ] Check loading states appear quickly
- [ ] Test offline behavior (should show error)

#### Database Performance
- [ ] Test with 1000+ tasks in database
- [ ] Verify queries stay under 100ms
- [ ] Check pagination/limits work correctly
- [ ] Monitor memory usage in DevTools

### Edge Cases and Error Scenarios

#### Network Errors
- [ ] Disconnect network mid-operation
- [ ] Verify error messages appear
- [ ] Check rollback works for optimistic updates
- [ ] Test retry mechanisms

#### Invalid Data
- [ ] Submit forms with XSS attempts
- [ ] Test SQL injection in inputs
- [ ] Verify Zod validation catches all cases
- [ ] Check error messages are user-friendly

#### Concurrent Operations
- [ ] Open app in two tabs
- [ ] Perform actions in both
- [ ] Verify data consistency
- [ ] Check for race conditions

#### Large Data
- [ ] Create task with very long title (1000+ chars)
- [ ] Create task with very long description
- [ ] Test with special characters and emojis
- [ ] Verify truncation/scrolling works

#### Authentication Edge Cases
- [ ] Test expired session behavior
- [ ] Test concurrent login from multiple devices
- [ ] Verify CSRF protection works
- [ ] Test session hijacking prevention

### Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

## Automated Testing (Future Implementation)

### Unit Tests
```bash
npm run test
```

Recommended test suites:
- API route handlers
- Authentication logic
- Validation schemas
- Utility functions (debounce, throttle, memoize)
- Custom hooks (useTasks)

### Integration Tests
- Authentication flow (signup → login → logout)
- Task CRUD operations
- Swipe gesture handling
- Undo functionality

### E2E Tests (Playwright/Cypress)
- Complete user journey: signup → create tasks → triage → complete
- Mobile swipe interactions
- Cross-browser testing

## Bug Reporting Template

When you find a bug, report it with:

```markdown
### Bug Description
Clear description of the issue

### Steps to Reproduce
1. Go to...
2. Click on...
3. See error

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Browser: Chrome 119
- OS: Windows 11
- Screen size: 1920x1080
- Device: Desktop

### Screenshots/Videos
Attach if relevant

### Console Errors
Paste any errors from DevTools console
```

## Test Data Setup

### Create Test Users
```sql
-- Run in Prisma Studio or SQL client
INSERT INTO "User" (id, email, "passwordHash", name)
VALUES
  ('test1', 'test@example.com', '$2a$10$...', 'Test User'),
  ('test2', 'demo@example.com', '$2a$10$...', 'Demo User');
```

### Create Test Tasks
```sql
INSERT INTO "Task" (id, title, description, status, priority, "userId")
VALUES
  ('task1', 'Quick task', 'Should be quick', 'inbox', 'quick_win', 'test1'),
  ('task2', 'Normal task', 'Regular priority', 'inbox', 'normal', 'test1'),
  ('task3', 'Today task', 'Do today', 'today', NULL, 'test1'),
  ('task4', 'Later task', 'Do later', 'later', NULL, 'test1');
```

## Success Criteria

All testing is considered complete when:
- [ ] All manual test cases pass
- [ ] All API endpoints return correct responses
- [ ] Authentication flow works end-to-end
- [ ] Responsive design works on all screen sizes
- [ ] Accessibility audit passes WCAG AA
- [ ] Performance scores meet targets
- [ ] No console errors in normal operation
- [ ] All edge cases handled gracefully

## Notes

- Test with real user data scenarios (typical: 20-50 tasks)
- Always test with network throttling for realistic conditions
- Use incognito/private browsing to test fresh sessions
- Clear localStorage/sessionStorage between tests if needed
- Test during different times of day for deadline display accuracy
