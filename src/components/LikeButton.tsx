"use client"
import { useState } from "react"

interface LikeButtonProps {
  postId: string
  liked: boolean
  count: number
  onChange?: (liked: boolean, count: number) => void
}

export default function LikeButton({ postId, liked: likedProp, count: countProp, onChange }: LikeButtonProps) {
  const [liked, setLiked] = useState(likedProp)
  const [count, setCount] = useState(countProp)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" })
      const data = await res.json()
      setLiked(data.liked)
      setCount(data.count)
      onChange?.(data.liked, data.count)
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 ${liked ? "text-red-500" : "text-gray-500"} hover:text-red-600 transition-colors`}
      aria-label={liked ? "Bỏ thích" : "Thích"}
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path stroke={liked ? "#ef4444" : "#d1d5db"} strokeWidth="2" d="M16.5 3.75A5.373 5.373 0 0 0 12 5.75a5.373 5.373 0 0 0-4.5-2c-2.9 0-5.25 2.35-5.25 5.25 0 6.25 8.25 11.25 8.25 11.25s8.25-5 8.25-11.25c0-2.9-2.35-5.25-5.25-5.25Z"/>
      </svg>
      <span>{count}</span>
    </button>
  )
} 