"use client"
import { useEffect, useState } from "react"
import PostCard from "@/components/PostCard"

const FILTERS = [
  { label: "Mới nhất", value: "new" },
  { label: "Nhiều like", value: "like" },
]

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("like")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      const res = await fetch(`/api/explore?filter=${filter}&page=${page}`)
      const data = await res.json()
      if (page === 1) setPosts(data.posts)
      else setPosts(prev => [...prev, ...data.posts])
      setHasMore(data.hasMore)
      setLoading(false)
    }
    fetchPosts()
  }, [filter, page])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-4 mb-6">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1) }}
              className={`px-4 py-2 rounded-lg font-medium ${filter === f.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {loading && <div className="text-center text-gray-500">Đang tải...</div>}
        {posts.length === 0 && !loading && <div className="text-center text-gray-400">Chưa có bài viết nào.</div>}
        {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
        {hasMore && !loading && (
          <div className="text-center mt-4">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 