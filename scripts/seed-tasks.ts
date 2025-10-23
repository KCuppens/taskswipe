import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const taskTemplates = [
  // Work tasks
  { title: "Review pull requests", description: "Check and review the 3 pending PRs in the main repository" },
  { title: "Update documentation", description: "Add API examples to the developer guide" },
  { title: "Fix bug in authentication", description: "Users report intermittent login failures on mobile" },
  { title: "Optimize database queries", description: "Profile and improve slow queries in the analytics dashboard" },
  { title: "Deploy to production", description: "Push the latest release to prod after QA approval" },
  { title: "Code review meeting", description: "Weekly code review session with the team at 2pm" },
  { title: "Refactor user service", description: "Clean up the user service code and add better error handling" },
  { title: "Write unit tests", description: "Add test coverage for the new payment integration" },
  { title: "Update dependencies", description: "Upgrade to the latest versions of key packages" },
  { title: "Design new feature", description: "Sketch out the UI for the upcoming dashboard redesign" },

  // Personal tasks
  { title: "Buy groceries", description: "Milk, eggs, bread, vegetables, and some snacks" },
  { title: "Call dentist", description: "Schedule 6-month checkup appointment" },
  { title: "Pay electricity bill", description: "Due date is approaching, don't forget!" },
  { title: "Water the plants", description: "Indoor plants haven't been watered in a few days" },
  { title: "Book flight tickets", description: "For the conference next month in San Francisco" },
  { title: "Schedule car maintenance", description: "Oil change and tire rotation needed" },
  { title: "Reply to emails", description: "Clear out inbox, respond to important messages" },
  { title: "Organize closet", description: "Donate clothes you haven't worn in a year" },
  { title: "Learn new recipe", description: "Try making that pasta dish from the cooking show" },
  { title: "Read book chapter", description: "Finish at least one chapter of 'Atomic Habits'" },

  // Quick wins (< 5 min)
  { title: "Reply to John's message", description: "Quick response about tomorrow's meeting time" },
  { title: "Update calendar", description: "Add next week's meetings to the calendar" },
  { title: "Download expense report", description: "Get last month's expenses for reimbursement" },
  { title: "Like team's post", description: "Engage with the team announcement on Slack" },
  { title: "Set reminder", description: "Set phone reminder for tomorrow's early meeting" },

  // Learning tasks
  { title: "Watch TypeScript tutorial", description: "Complete the advanced generics section" },
  { title: "Practice algorithm", description: "Solve 3 LeetCode medium problems" },
  { title: "Read tech article", description: "Article about React Server Components" },
  { title: "Take online course", description: "Finish module 3 of the AWS certification course" },
  { title: "Review coding notes", description: "Go through notes from last week's workshop" },

  // Health & Fitness
  { title: "Go for a run", description: "30-minute jog around the neighborhood" },
  { title: "Gym workout", description: "Upper body strength training session" },
  { title: "Meal prep", description: "Prepare healthy lunches for the week" },
  { title: "Meditation session", description: "15 minutes of mindfulness meditation" },
  { title: "Stretch routine", description: "Full body stretching after sitting all day" },

  // Creative projects
  { title: "Write blog post", description: "Article about building TaskSwipe with Next.js" },
  { title: "Edit photos", description: "Process photos from last weekend's trip" },
  { title: "Practice guitar", description: "Work on that new song for 30 minutes" },
  { title: "Draw sketch", description: "Daily drawing practice - try perspective" },
  { title: "Brainstorm ideas", description: "Come up with concepts for next side project" },

  // Home tasks
  { title: "Fix leaky faucet", description: "Kitchen sink has been dripping for days" },
  { title: "Clean out garage", description: "Organize tools and throw away old stuff" },
  { title: "Replace light bulb", description: "Bedroom ceiling light burned out" },
  { title: "Vacuum living room", description: "Weekly cleaning routine" },
  { title: "Take out trash", description: "Garbage collection is tomorrow morning" },

  // Financial
  { title: "Review budget", description: "Check spending for this month and adjust categories" },
  { title: "Update investment portfolio", description: "Rebalance based on market changes" },
  { title: "File tax documents", description: "Organize receipts and invoices for tax season" },
  { title: "Cancel unused subscriptions", description: "Found 3 services not being used anymore" },
  { title: "Set up automatic payments", description: "Automate recurring bills to save time" },
]

async function main() {
  console.log("Starting to seed tasks...")

  // Get the first user from the database
  const user = await prisma.user.findFirst()

  if (!user) {
    console.error("No user found! Please create a user account first.")
    process.exit(1)
  }

  console.log(`Creating tasks for user: ${user.email}`)

  // Create all 50 tasks
  for (const template of taskTemplates) {
    await prisma.task.create({
      data: {
        title: template.title,
        description: template.description,
        status: "inbox",
        userId: user.id,
      },
    })
    console.log(`✓ Created: ${template.title}`)
  }

  console.log(`\n✅ Successfully created ${taskTemplates.length} test tasks!`)
  console.log(`\nYou can now test the app at http://localhost:3002/triage`)
}

main()
  .catch((e) => {
    console.error("Error seeding tasks:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
