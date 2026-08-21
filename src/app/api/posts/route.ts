import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const postSchema = z.object({
  content: z.string().min(1, "Nội dung không được để trống").max(500, "Nội dung quá dài"),
  image: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để tạo bài viết" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, image } = postSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    }

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: user.id,
      },
      select: {
        id: true,
        content: true,
        image: true,
        createdAt: true,
        author: { select: { id: true, name: true, username: true, image: true } },
      },
    })

    return NextResponse.json({ message: "Tạo bài viết thành công", post }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại" }, { status: 500 })
  }
} 