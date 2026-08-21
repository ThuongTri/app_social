import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get("filter") || "like"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const take = 10
  const skip = (page - 1) * take
  try {
    let posts = []
    if (filter === "new") {
      posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { likes: true, comments: true } },
        },
      })
    } else {
      posts = await prisma.post.findMany({
        orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
        skip,
        take,
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { likes: true, comments: true } },
        },
      })
    }
    const total = await prisma.post.count()
    const hasMore = skip + posts.length < total
    return NextResponse.json({ posts, hasMore })
  } catch (error) {
    return NextResponse.json({ posts: [], hasMore: false })
  }
} 