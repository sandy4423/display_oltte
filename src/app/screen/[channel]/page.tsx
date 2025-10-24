'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Post, Channel } from '@/types'

export default function ScreenPage() {
  const params = useParams()
  const channelId = params.channel as string
  
  const [posts, setPosts] = useState<Post[]>([])
  const [channel, setChannel] = useState<Channel | null>(null)
  const [spotlightPost, setSpotlightPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!channelId) return

    // Load channel info
    const loadChannel = async () => {
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single()
      
      if (data) setChannel(data)
    }

    // Load initial posts
    const loadPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('channel_id', channelId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data) setPosts(data)
      setLoading(false)
    }

    loadChannel()
    loadPosts()

    // Subscribe to new posts
    const subscription = supabase
      .channel(`posts:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const newPost = payload.new as Post
          if (newPost.status === 'approved') {
            // Show in spotlight
            setSpotlightPost(newPost)
            setTimeout(() => {
              setSpotlightPost(null)
              setPosts(prev => [newPost, ...prev.slice(0, 19)])
            }, (channel?.spotlight_duration || 5) * 1000)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [channelId, channel?.spotlight_duration])

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-2xl text-primary-700">로딩 중...</div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-2xl text-primary-700">채널을 찾을 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: channel.theme.backgroundColor || '#fef7f0' }}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: channel.theme.textColor || '#1f2937' }}>
          {channel.name}
        </h1>
        <div className="text-sm opacity-75">
          {new Date().toLocaleString('ko-KR')}
        </div>
      </header>

      {/* Spotlight Section */}
      {spotlightPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-12 rounded-2xl max-w-4xl mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-8" style={{ color: channel.theme.primaryColor || '#e36e42' }}>
              새로운 메시지!
            </div>
            <div className="text-3xl font-bold mb-4 break-words">
              {spotlightPost.content}
            </div>
            {spotlightPost.media_url && (
              <img 
                src={spotlightPost.media_url} 
                alt="첨부 이미지"
                className="max-w-full max-h-64 mx-auto rounded-lg"
              />
            )}
            <div className="text-lg opacity-75 mt-6">
              {spotlightPost.submitter && `- ${spotlightPost.submitter}`}
            </div>
          </div>
        </div>
      )}

      {/* Wall Section */}
      <main className="p-6">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4" style={{ color: channel.theme.primaryColor || '#e36e42' }}>
              💭
            </div>
            <div className="text-2xl" style={{ color: channel.theme.textColor || '#1f2937' }}>
              첫 번째 메시지를 기다리고 있어요!
            </div>
            <div className="text-lg opacity-75 mt-2">
              QR 코드를 스캔해서 메시지를 남겨보세요
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            channel.wall_layout === 'masonry' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {posts.map((post) => (
              <div 
                key={post.id}
                className="bg-white p-6 rounded-xl shadow-lg border-l-4"
                style={{ borderLeftColor: channel.theme.primaryColor || '#e36e42' }}
              >
                <div className="text-lg font-medium mb-3 break-words">
                  {post.content}
                </div>
                {post.media_url && (
                  <img 
                    src={post.media_url} 
                    alt="첨부 이미지"
                    className="w-full rounded-lg mb-3"
                  />
                )}
                <div className="text-sm opacity-75 flex justify-between">
                  <span>{post.submitter || '익명'}</span>
                  <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}