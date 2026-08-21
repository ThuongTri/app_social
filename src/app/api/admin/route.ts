import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Bạn không có quyền truy cập" }, { status: 403 })
  }
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, email: true, role: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: 20,
    })
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return NextResponse.json({ users, posts, comments, reports })
  } catch (error) {
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 })
  }
} 