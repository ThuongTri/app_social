"use client"
import { useState } from "react"
import Link from "next/link"
import PostCard from "@/components/PostCard"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearched(false)
    let url = `/api/search?q=${encodeURIComponent(query)}`
    if (query.startsWith("@")) {
      url = `/api/search?q=${encodeURIComponent(query)}&exact=1`
    }
    const res = await fetch(url)
    const data = await res.json()
    setUsers(data.users || [])
    setPosts(data.posts || [])
    setLoading(false)
    setSearched(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm người dùng (@username) hoặc bài viết..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={loading || !query.trim()}
          >
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>
        {searched && (
          <>
            <h3 className="font-semibold text-gray-900 mb-2">Người dùng</h3>
            {users.length === 0 ? (
              <div className="text-gray-400 mb-4">Không tìm thấy người dùng nào.</div>
            ) : (
              users.map((user: any) => (
                <Link key={user.id} href={`/user/${user.username}`} className="flex items-center gap-3 mb-3 hover:bg-gray-50 p-2 rounded-lg">
                  <img
                    src={user.image || `https://ui-avatars.com/api/?name=${user.name || user.username}&background=random`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                  />
                  <div className="cursor-pointer">
                    <div className="font-medium text-gray-900">{user.name || user.username}</div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </div>
                </Link>
              ))
            )}
            <h3 className="font-semibold text-gray-900 mb-2 mt-6">Bài viết</h3>
            {posts.length === 0 ? (
              <div className="text-gray-400">Không tìm thấy bài viết nào.</div>
            ) : (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </>
        )}
      </div>
    </div>
  )
} 