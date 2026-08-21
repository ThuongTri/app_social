import React, { useEffect, useState } from "react"
import Link from "next/link"
import LikeButton from "@/components/LikeButton"
import { useSession } from "next-auth/react"

interface PostCardProps {
  post: {
    id: string
    content: string
    image?: string | null
    createdAt: string
    author: {
      id: string
      name: string | null
      username: string
      image?: string | null
    }
    _count: {
      likes: number
      comments: number
    }
  }
}

export default function PostCard({ post }: { post: PostCardProps["post"] }) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportMsg, setReportMsg] = useState("")

  useEffect(() => {
    async function fetchLiked() {
      if (!session) return
      const res = await fetch(`/api/posts/${post.id}/liked`)
      const data = await res.json()
      setLiked(data.liked)
    }
    fetchLiked()
  }, [session, post.id])

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="flex items-center mb-3">
        <Link href={`/user/${post.author.username}`} className="flex items-center gap-2 group">
          <img
            src={post.author.image || `https://ui-avatars.com/api/?name=${post.author.name || post.author.username}&background=random`}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover mr-3 group-hover:ring-2 group-hover:ring-blue-500"
          />
          <div>
            <div className="font-semibold text-gray-900 group-hover:underline">{post.author.name || post.author.username}</div>
            <div className="text-xs text-gray-500">@{post.author.username}</div>
          </div>
        </Link>
        <div className="ml-auto text-xs text-gray-400">{new Date(post.createdAt).toLocaleString("vi-VN")}</div>
      </div>
      <Link href={`/posts/${post.id}`} className="block group">
        <div className="text-gray-800 mb-3 whitespace-pre-line group-hover:underline">{post.content}</div>
        {post.image && (
          <img
            src={post.image}
            alt="Post image"
            className="rounded-lg max-h-80 w-full object-cover mb-3 border"
          />
        )}
      </Link>
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <LikeButton postId={post.id} liked={liked} count={likeCount} onChange={(l, c) => { setLiked(l); setLikeCount(c) }} />
        <div className="flex items-center gap-1">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6366f1" strokeWidth="2" d="M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-3.5-.6l-4.5 1.6 1.6-4.5A7.96 7.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/></svg>
          <span>{post._count.comments}</span>
        </div>
        {session && (
          <button onClick={() => setShowReport(true)} className="ml-auto text-xs text-red-500 hover:underline">Báo cáo</button>
        )}
      </div>
      {showReport && (
        <div className="mt-3 p-3 border rounded bg-red-50">
          <div className="mb-2 font-semibold text-red-600">Báo cáo bài viết</div>
          <textarea
            className="w-full border rounded p-2 text-gray-900 bg-white placeholder-gray-400"
            rows={2}
            placeholder="Nhập lý do báo cáo..."
            value={reportReason}
            onChange={e => setReportReason(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                setReportMsg("")
                const res = await fetch("/api/report", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ postId: post.id, reason: reportReason })
                })
                const data = await res.json()
                setReportMsg(data.message || data.error)
                if (res.ok) setShowReport(false)
              }}
              disabled={!reportReason.trim()}
            >Gửi</button>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setShowReport(false)}>Hủy</button>
          </div>
          {reportMsg && <div className="mt-2 text-sm text-red-600">{reportMsg}</div>}
        </div>
      )}
    </div>
  )
} 