"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"

const postSchema = z.object({
  content: z.string().min(1, "Nội dung không được để trống").max(500, "Nội dung quá dài (tối đa 500 ký tự)"),
  image: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("").transform(() => undefined)),
})

type PostForm = z.infer<typeof postSchema>

export default function CreatePostPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  })

  const onSubmit = async (data: PostForm) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error || "Có lỗi xảy ra")
        return
      }
      reset()
      router.push("/")
    } catch (e) {
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo bài viết mới</h2>
            <p className="text-gray-600">Chia sẻ cảm nghĩ hoặc khoảnh khắc của bạn với mọi người!</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("content")}
                id="content"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white resize-none"
                placeholder="Bạn đang nghĩ gì?"
                maxLength={500}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh (URL, tuỳ chọn)
              </label>
              <input
                {...register("image")}
                id="image"
                type="url"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Dán link ảnh (nếu có)"
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Đang đăng..." : "Đăng bài"}
            </button>
            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Quay lại trang chủ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 