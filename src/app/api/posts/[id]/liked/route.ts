import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ liked: false })
  }
  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ liked: false })
    const like = await prisma.like.findUnique({ where: { userId_postId: { userId: user.id, postId: params.id } } })
    return NextResponse.json({ liked: !!like })
  } catch (error) {
    return NextResponse.json({ liked: false })
  }
} 