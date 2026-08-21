import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để like" }, { status: 401 })
  }
  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 })
    const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: user.id, postId: post.id } } })
    let liked = false
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      liked = false
    } else {
      await prisma.like.create({ data: { userId: user.id, postId: post.id } })
      liked = true
    }
    const count = await prisma.like.count({ where: { postId: post.id } })
    return NextResponse.json({ liked, count })
  } catch (error) {
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại" }, { status: 500 })
  }
} 