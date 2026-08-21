import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const reportSchema = z.object({
  postId: z.string(),
  reason: z.string().min(5, "Lý do phải ít nhất 5 ký tự")
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để báo cáo" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { postId, reason } = reportSchema.parse(body)
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 })
    await prisma.report.create({ data: { userId: user.id, postId, reason } })
    return NextResponse.json({ message: "Đã gửi báo cáo thành công" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 })
  }
} 