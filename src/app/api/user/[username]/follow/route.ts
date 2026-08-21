import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để theo dõi" }, { status: 401 })
  }
  try {
    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    const user = await prisma.user.findUnique({ where: { username: params.username } })
    if (!currentUser || !user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
    if (currentUser.id === user.id) return NextResponse.json({ error: "Không thể tự theo dõi chính mình" }, { status: 400 })
    const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUser.id, followingId: user.id } } })
    let following = false
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } })
      following = false
    } else {
      await prisma.follow.create({ data: { followerId: currentUser.id, followingId: user.id } })
      following = true
    }
    const count = await prisma.follow.count({ where: { followingId: user.id } })
    return NextResponse.json({ following, count })
  } catch (error) {
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 })
  }
} 