"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import PostCard from "@/components/PostCard"

export default function UserProfilePage() {
  const { username } = useParams() as { username: string }
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const res = await fetch(`/api/user/${username}`)
      const data = await res.json()
      setUser(data.user)
      setPosts(data.posts)
      setFollowing(data.following)
      setLoading(false)
    }
    if (username) fetchUser()
  }, [username])

  const handleFollow = async () => {
    setFollowLoading(true)
    setMessage("")
    const res = await fetch(`/api/user/${username}/follow`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || "Có lỗi xảy ra")
    } else {
      setFollowing(data.following)
      setUser((prev: any) => prev ? { ...prev, _count: { ...prev._count, followers: data.count } } : prev)
      setMessage(data.following ? "Đã theo dõi" : "Đã bỏ theo dõi")
    }
    setFollowLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>
  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-400">Không tìm thấy người dùng.</div>

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
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`ml-auto px-4 py-2 rounded-lg text-white ${following ? "bg-gray-400 hover:bg-gray-500" : "bg-blue-600 hover:bg-blue-700"} transition-colors`}
          >
            {followLoading ? "Đang xử lý..." : following ? "Bỏ theo dõi" : "Theo dõi"}
          </button>
        </div>
        {user.bio && <div className="mb-4 text-gray-700">{user.bio}</div>}
        {message && <div className="mb-2 text-sm text-red-600">{message}</div>}
        <h3 className="font-semibold text-gray-900 mb-2 mt-6">Bài viết</h3>
        {posts.length === 0 ? (
          <div className="text-gray-400">Chưa có bài viết nào.</div>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
} 