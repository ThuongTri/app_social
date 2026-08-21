import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)
  let currentUserId = null
  if (session && session.user?.email) {
    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    currentUserId = currentUser?.id
  }
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      include: {
        _count: { select: { followers: true, following: true } },
      },
    })
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })
    let following = false
    if (currentUserId) {
      const follow = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } } })
      following = !!follow
    }
    return NextResponse.json({ user, posts, following })
  } catch (error) {
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 })
  }
} 