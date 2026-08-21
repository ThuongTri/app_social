import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 })
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        _count: {
          select: { followers: true, following: true },
        },
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
    return NextResponse.json({ user, posts })
  } catch (error) {
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 })
  }
} 