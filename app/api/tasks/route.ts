import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["inbox", "today", "later", "completed", "archived"]).default("inbox"),
  priority: z.enum(["quick_win", "normal"]).optional(),
  deadline: z.string().optional(),
  recurring: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
  recurData: z.any().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    // Optimized query with type-safe where clause
    const where = {
      userId: session.user.id,
      ...(status && { status }),
    }

    // Only fetch necessary fields, add select if needed for large datasets
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { deadline: { sort: "asc", nulls: "last" } },
        { position: "asc" },
        { createdAt: "desc" },
      ],
      // Limit results for better performance
      take: 100,
    })

    // Add cache headers for better performance
    return NextResponse.json(tasks, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
      },
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = taskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    const task = await prisma.task.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
