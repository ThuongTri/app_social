import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    })
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 })
    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json({ error: "Không thể lấy chi tiết bài viết" }, { status: 500 })
  }
} 