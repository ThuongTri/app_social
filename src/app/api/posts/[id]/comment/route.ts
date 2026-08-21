import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1, "Bình luận không được để trống").max(300, "Bình luận quá dài")
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để bình luận" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { content } = commentSchema.parse(body)
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (!post) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 })
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        postId: post.id,
      },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    })
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại" }, { status: 500 })
  }
} 