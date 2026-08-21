import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  let q = searchParams.get("q")?.trim() || ""
  if (!q) return NextResponse.json({ users: [], posts: [] })
  try {
    let users = []
    let posts = []
    const allUsers = await prisma.user.findMany({ select: { id: true, username: true } })
    if (q.startsWith("@")) {
      const username = q.replace(/^@/, "")
      console.log("[SEARCH] Username query:", username)
      users = await prisma.user.findMany({
        where: { username: { equals: username } },
        select: { id: true, name: true, username: true, image: true },
        take: 10,
      })
      console.log("[SEARCH] Result users:", users)
      if (users.length === 0) {
        console.log("[SEARCH] All users in DB:", allUsers)
      }
    } else {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q } },
            { name: { contains: q } },
          ],
        },
        select: { id: true, name: true, username: true, image: true },
        take: 10,
      })
    }
    posts = await prisma.post.findMany({
      where: { content: { contains: q } },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
    // DEBUG: Log kết quả users và tổng số user
    console.log("[SEARCH] Query:", q, "Users:", users, "AllUsers:", allUsers)
    return NextResponse.json({ users, posts })
  } catch (error) {
    return NextResponse.json({ users: [], posts: [] })
  }
} 