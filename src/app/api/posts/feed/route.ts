import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    })
    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: "Không thể lấy danh sách bài viết" }, { status: 500 })
  }
} 