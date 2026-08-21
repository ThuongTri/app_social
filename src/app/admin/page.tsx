"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import PostCard from "@/components/PostCard"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError("")
      const res = await fetch("/api/admin")
      if (!res.ok) {
        setError("Bạn không có quyền truy cập trang admin!")
        setLoading(false)
        return
      }
      const data = await res.json()
      setUsers(data.users)
      setPosts(data.posts)
      setComments(data.comments)
      setReports(data.reports)
      setLoading(false)
    }
    fetchData()
  }, [refresh])

  if (status === "loading" || loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  if (!session || session.user?.role !== "admin") return <div className="min-h-screen flex items-center justify-center text-red-600">Bạn không có quyền truy cập trang admin!</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
        <h3 className="font-semibold text-gray-900 mb-2">Danh sách người dùng</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    <button className="text-xs text-red-600 hover:underline" onClick={async () => {
                      if (confirm("Bạn chắc chắn muốn xóa user này?")) {
                        await fetch(`/api/admin/user/${u.id}`, { method: "DELETE" })
                        setRefresh(r => r + 1)
                      }
                    }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Danh sách bài viết</h3>
        {posts.length === 0 ? <div className="text-gray-400 mb-4">Chưa có bài viết nào.</div> : posts.map((post: any) => (
          <div key={post.id} className="mb-4">
            <PostCard post={post} />
            <button className="text-xs text-red-600 hover:underline" onClick={async () => {
              if (confirm("Bạn chắc chắn muốn xóa bài viết này?")) {
                await fetch(`/api/admin/post/${post.id}`, { method: "DELETE" })
                setRefresh(r => r + 1)
              }
            }}>Xóa bài viết</button>
          </div>
        ))}
        <h3 className="font-semibold text-gray-900 mb-2 mt-6">Danh sách bình luận</h3>
        {comments.length === 0 ? <div className="text-gray-400">Chưa có bình luận nào.</div> : (
          <div className="space-y-2">
            {comments.map((c: any) => (
              <div key={c.id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="text-gray-800">{c.content}</div>
                  <div className="text-xs text-gray-500">Bài viết: {c.postId} • Người dùng: {c.authorId} • {new Date(c.createdAt).toLocaleString("vi-VN")}</div>
                </div>
                <button className="text-xs text-red-600 hover:underline ml-4" onClick={async () => {
                  if (confirm("Bạn chắc chắn muốn xóa bình luận này?")) {
                    await fetch(`/api/admin/comment/${c.id}`, { method: "DELETE" })
                    setRefresh(r => r + 1)
                  }
                }}>Xóa</button>
              </div>
            ))}
          </div>
        )}
        <h3 className="font-semibold text-gray-900 mb-2 mt-6">Danh sách báo cáo</h3>
        {reports && reports.length === 0 ? <div className="text-gray-400">Chưa có báo cáo nào.</div> : (
          <div className="space-y-2">
            {reports && reports.map((r: any) => (
              <div key={r.id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="text-gray-800">{r.reason}</div>
                  <div className="text-xs text-gray-500">Bài viết: {r.postId} • Người dùng: {r.userId} • {new Date(r.createdAt).toLocaleString("vi-VN")}</div>
                </div>
                <button className="text-xs text-red-600 hover:underline ml-4" onClick={async () => {
                  if (confirm("Bạn chắc chắn muốn xóa báo cáo này?")) {
                    await fetch(`/api/admin/report/${r.id}`, { method: "DELETE" })
                    setRefresh(rf => rf + 1)
                  }
                }}>Xóa</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 