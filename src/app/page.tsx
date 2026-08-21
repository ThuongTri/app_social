"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Home, User, Search, Plus, MessageCircle, LogOut, Users } from "lucide-react"
import PostCard from "@/components/PostCard"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      const res = await fetch("/api/posts/feed")
      const data = await res.json()
      setPosts(data.posts || [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">SocialApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}&background=random`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-6">
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-700">
                    <Home className="w-5 h-5" />
                    <span>Trang chủ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                    <User className="w-5 h-5" />
                    <span>Hồ sơ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Search className="w-5 h-5" />
                    <span>Tìm kiếm</span>
                  </Link>
                </li>
                <li>
                  <Link href="/create-post" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Plus className="w-5 h-5" />
                    <span>Tạo bài viết</span>
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Users className="w-5 h-5" />
                    <span>Khám phá</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Bài viết mới nhất</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải bài viết...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Chưa có bài viết nào.</div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Người dùng đề xuất
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://ui-avatars.com/api/?name=John+Doe&background=random"
                    alt="User"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">@johndoe</p>
                  </div>
                  <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700">
                    Theo dõi
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <img
                    src="https://ui-avatars.com/api/?name=Jane+Smith&background=random"
                    alt="User"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                    <p className="text-xs text-gray-500">@janesmith</p>
                  </div>
                  <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700">
                    Theo dõi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
