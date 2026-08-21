"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import LikeButton from "@/components/LikeButton"

export default function PostDetailPage() {
  const { id } = useParams() as { id: string }
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      const res = await fetch(`/api/posts/${id}`)
      const data = await res.json()
      setPost(data.post)
      setLikeCount(data.post?._count?.likes || 0)
      setLoading(false)
    }
    if (id) fetchPost()
  }, [id])

  useEffect(() => {
    async function fetchLiked() {
      if (!session) return
      const res = await fetch(`/api/posts/${id}/liked`)
      const data = await res.json()
      setLiked(data.liked)
    }
    fetchLiked()
  }, [session, id])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/posts/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra")
        return
      }
      setComment("")
      setPost((prev: any) => ({ ...prev, comments: [...prev.comments, data.comment], _count: { ...prev._count, comments: prev._count.comments + 1 } }))
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setCommentLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>
  if (!post) return <div className="min-h-screen flex items-center justify-center text-gray-400">Không tìm thấy bài viết.</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-3">
          <img
            src={post.author.image || `https://ui-avatars.com/api/?name=${post.author.name || post.author.username}&background=random`}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <div className="font-semibold text-gray-900">{post.author.name || post.author.username}</div>
            <div className="text-xs text-gray-500">@{post.author.username}</div>
          </div>
          <div className="ml-auto text-xs text-gray-400">{new Date(post.createdAt).toLocaleString("vi-VN")}</div>
        </div>
        <div className="text-gray-800 mb-3 whitespace-pre-line">{post.content}</div>
        {post.image && (
          <img
            src={post.image}
            alt="Post image"
            className="rounded-lg max-h-80 w-full object-cover mb-3 border"
          />
        )}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
          <LikeButton postId={id} liked={liked} count={likeCount} onChange={(l, c) => { setLiked(l); setLikeCount(c) }} />
          <div className="flex items-center gap-1">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6366f1" strokeWidth="2" d="M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-3.5-.6l-4.5 1.6 1.6-4.5A7.96 7.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/></svg>
            <span>{post._count.comments}</span>
          </div>
        </div>
        <form onSubmit={handleComment} className="flex gap-2 mb-4">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Viết bình luận..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
            disabled={commentLoading}
          />
          <button
            type="submit"
            disabled={commentLoading || !session}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {commentLoading ? "Đang gửi..." : "Bình luận"}
          </button>
        </form>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Bình luận</h3>
          {post.comments.length === 0 ? (
            <div className="text-gray-400">Chưa có bình luận nào.</div>
          ) : (
            post.comments.map((c: any) => (
              <div key={c.id} className="flex items-start gap-3 mb-4">
                <img
                  src={c.author.image || `https://ui-avatars.com/api/?name=${c.author.name || c.author.username}&background=random`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{c.author.name || c.author.username}</div>
                  <div className="text-xs text-gray-500 mb-1">@{c.author.username} • {new Date(c.createdAt).toLocaleString("vi-VN")}</div>
                  <div className="text-gray-700 whitespace-pre-line">{c.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">← Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  )
} 