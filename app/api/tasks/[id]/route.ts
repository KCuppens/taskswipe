import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["inbox", "today", "later", "completed", "archived"]).optional(),
  priority: z.enum(["quick_win", "normal"]).optional(),
  deadline: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  recurring: z.enum(["daily", "weekly", "monthly", "custom"]).nullable().optional(),
  recurData: z.any().optional(),
  position: z.number().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = updateTaskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const data = validation.data
    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null
    }
    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null
    }
    if (data.recurring !== undefined) updateData.recurring = data.recurring
    if (data.recurData !== undefined) updateData.recurData = data.recurData
    if (data.position !== undefined) updateData.position = data.position

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
