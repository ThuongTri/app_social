import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự").regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ cái, số và dấu gạch dưới"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, username, password } = signupSchema.parse(body)

    // Kiểm tra email đã tồn tại
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      )
    }

    // Kiểm tra username đã tồn tại
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "Username đã được sử dụng" },
        { status: 400 }
      )
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12)

    // Tạo user mới
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { 
        message: "Đăng ký thành công",
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại" },
      { status: 500 }
    ) 
  }
} 