"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import PostCard from "@/components/PostCard"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      const res = await fetch("/api/profile")
      const data = await res.json()
      setUser(data.user)
      setPosts(data.posts)
      setLoading(false)
    }
    fetchProfile()
  }, [])

  if (status === "loading" || loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>
  if (!session || !user) return <div className="min-h-screen flex items-center justify-center text-gray-400">Không tìm thấy thông tin.</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <img
            src={user.image || `https://ui-avatars.com/api/?name=${user.name || user.username}&background=random`}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover mr-4"
          />
          <div>
            <div className="font-bold text-xl text-gray-900">{user.name || user.username}</div>
            <div className="text-gray-500">@{user.username}</div>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span><b>{user._count.followers}</b> người theo dõi</span>
              <span><b>{user._count.following}</b> đang theo dõi</span>
            </div>
          </div>
        </div>
        {user.bio && <div className="mb-4 text-gray-700">{user.bio}</div>}
        <h3 className="font-semibold text-gray-900 mb-2 mt-6">Bài viết của bạn</h3>
        {posts.length === 0 ? (
          <div className="text-gray-400">Bạn chưa có bài viết nào.</div>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
} 