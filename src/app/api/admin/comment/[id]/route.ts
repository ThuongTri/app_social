import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Bạn không có quyền" }, { status: 403 })
  }
  try {
    await prisma.comment.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Đã xóa bình luận" })
  } catch (error) {
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 })
  }
} 