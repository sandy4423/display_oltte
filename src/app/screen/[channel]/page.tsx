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
  const [spotlightExiting, setSpotlightExiting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cardPositions, setCardPositions] = useState<Array<{top: number, left: number}>>([])

  // 카드 충돌 감지 함수
  const isOverlapping = (
    box1: {top: number, left: number, width: number, height: number},
    box2: {top: number, left: number, width: number, height: number},
    margin: number = 30
  ) => {
    return !(
      box1.left + box1.width + margin < box2.left ||
      box2.left + box2.width + margin < box1.left ||
      box1.top + box1.height + margin < box2.top ||
      box2.top + box2.height + margin < box1.top
    )
  }

  // 카드 위치 계산 함수 (물리적으로 겹치지 않도록)
  const calculateCardPositions = (postCount: number) => {
    const positions: Array<{top: number, left: number}> = []
    const cardWidth = 340
    const cardHeight = 220
    const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 150 : 800
    const margin = 40 // 카드 간 최소 간격
    const maxAttempts = 200

    for (let i = 0; i < postCount; i++) {
      let placed = false
      let attempts = 0

      while (!placed && attempts < maxAttempts) {
        // 랜덤 위치 생성 (약간의 변형)
        const randomTop = Math.random() * (containerHeight - cardHeight - margin * 2) + margin
        // 가로는 컬럼 기반이지만 각 컬럼 내에서 약간의 랜덤
        const baseColumn = Math.floor(i / 2.5) * 450
        const randomOffset = (Math.random() - 0.5) * 100
        const randomLeft = baseColumn + randomOffset

        const newBox = {
          top: randomTop,
          left: randomLeft,
          width: cardWidth,
          height: cardHeight
        }

        // 기존 카드들과 충돌 체크
        let hasCollision = false
        for (const pos of positions) {
          const existingBox = {
            top: pos.top,
            left: pos.left,
            width: cardWidth,
            height: cardHeight
          }

          if (isOverlapping(newBox, existingBox, margin)) {
            hasCollision = true
            break
          }
        }

        if (!hasCollision) {
          positions.push({ top: randomTop, left: randomLeft })
          placed = true
        }

        attempts++
      }

      // 최대 시도 후 안전한 위치에 배치
      if (!placed) {
        const safeRow = (i % 2)
        const safeColumn = Math.floor(i / 2)
        positions.push({
          top: safeRow * (cardHeight + margin + 60) + margin,
          left: safeColumn * 500
        })
      }
    }

    return positions
  }

  useEffect(() => {
    if (posts.length > 0 && typeof window !== 'undefined') {
      setCardPositions(calculateCardPositions(posts.length))
    }
  }, [posts.length])

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
            setSpotlightExiting(false)

            const duration = (channel?.spotlight_duration || 5) * 1000

            // Exit 애니메이션 시작 (종료 1초 전)
            setTimeout(() => {
              setSpotlightExiting(true)
            }, duration - 1000)

            // Spotlight 완전 종료
            setTimeout(() => {
              setSpotlightPost(null)
              setSpotlightExiting(false)
              setPosts(prev => [newPost, ...prev.slice(0, 19)])
            }, duration)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-3xl font-bold text-white animate-pulse">로딩 중...</div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-3xl font-bold text-white">채널을 찾을 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements - 브랜드 컬러 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E36E42]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E36E42]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-8 flex justify-between items-center backdrop-blur-sm bg-slate-900/50 border-b border-[#E36E42]/20">
        <div className="flex items-center gap-4">
          <div className="w-2 h-12 bg-gradient-to-b from-[#E36E42] to-amber-500 rounded-full shadow-lg shadow-[#E36E42]/50"></div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#E36E42] via-orange-400 to-amber-400 bg-clip-text text-transparent">
            {channel.name}
          </h1>
        </div>
        <div className="text-slate-400 text-lg font-medium">
          {new Date().toLocaleString('ko-KR')}
        </div>
      </header>

      {/* Spotlight Section */}
      {spotlightPost && (
        <div className={`fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-500 ${spotlightExiting ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`relative ${spotlightExiting ? 'spotlight-exit' : ''}`}>
            {/* Glow effect - 브랜드 컬러 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#E36E42] via-orange-400 to-amber-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>

            {/* Content */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-16 rounded-3xl max-w-5xl mx-4 text-center border-2 border-[#E36E42]/30 shadow-2xl shadow-[#E36E42]/20">
              <div className="text-7xl font-black mb-10 bg-gradient-to-r from-[#E36E42] via-orange-400 to-amber-400 bg-clip-text text-transparent animate-in slide-in-from-top duration-700">
                새로운 메시지! ✨
              </div>
              <div className="text-5xl font-bold mb-8 text-white break-words leading-tight animate-in slide-in-from-bottom duration-700 delay-200">
                {spotlightPost.content}
              </div>
              {spotlightPost.submitter && (
                <div className="text-2xl text-[#E36E42] mt-8 font-semibold animate-in fade-in duration-700 delay-500">
                  - {spotlightPost.submitter}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wall Section - Flowing Cards */}
      <main className="relative z-10 h-[calc(100vh-120px)] overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-8xl mb-8 animate-bounce">
              💭
            </div>
            <div className="text-4xl font-bold text-white mb-4">
              첫 번째 메시지를 기다리고 있어요!
            </div>
            <div className="text-xl text-slate-400">
              QR 코드를 스캔해서 메시지를 남겨보세요
            </div>
          </div>
        ) : (
          <div className="flowing-lanes-container">
            {/* 5개의 레인으로 나눔 - 더 많은 카드 */}
            {[0, 1, 2, 3, 4].map(lane => (
              <div key={lane} className="flow-lane" style={{ top: `${lane * 20}%` }}>
                {posts
                  .filter((_, idx) => idx % 5 === lane)
                  .map((post, laneIndex) => {
                    const seed = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                    const rotation = ((seed % 13) - 6) * 2.5 // -15deg ~ 15deg
                    const scale = 0.90 + ((seed % 16) / 100) // 0.90 ~ 1.06
                    const animationDuration = 35 + (seed % 25) // 35~60초 (더 빠르게)
                    const verticalOffset = ((seed % 5) - 2) * 12 // -24px ~ 24px 세로 흔들림 (더 적게)

                    return (
                      <div
                        key={post.id}
                        className="flow-card"
                        style={{
                          '--rotation': `${rotation}deg`,
                          '--scale': scale,
                          '--vertical-offset': `${verticalOffset}px`,
                          '--delay': `${laneIndex * 2.5}s`,
                          animationDuration: `${animationDuration}s`,
                          animationDelay: `${laneIndex * 2.5}s`
                        } as React.CSSProperties}
                      >
                        <div className="card-inner group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-[#E36E42]/70 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-[#E36E42]/30 hover:z-50">
                          {/* Gradient accent - 브랜드 컬러 */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E36E42] via-orange-400 to-amber-500 rounded-t-2xl"></div>

                          <div className="text-lg font-semibold mb-3 text-white break-words leading-relaxed">
                            {post.content}
                          </div>

                          <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-700">
                            <span className="font-medium text-[#E36E42]">{post.submitter || '익명'}</span>
                            <span>{new Date(post.created_at).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        /* 오른쪽으로 흐르는 애니메이션 */
        @keyframes flowRight {
          0% {
            transform: translateX(100vw) translateY(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-400px) translateY(0);
            opacity: 0;
          }
        }

        /* Spotlight에서 담벼락으로 들어가는 애니메이션 */
        @keyframes shrinkToWall {
          0% {
            transform: scale(1) translateX(0) translateY(0);
            opacity: 1;
          }
          50% {
            transform: scale(0.5) translateX(50vw) translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.2) translateX(100vw) translateY(0);
            opacity: 0;
          }
        }

        .flowing-lanes-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .flow-lane {
          position: absolute;
          width: 100%;
          height: 33.33%;
          overflow: visible;
        }

        .flow-card {
          position: absolute;
          width: 320px;
          animation: flowInLane linear infinite;
          will-change: transform, opacity;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
        }

        .flow-card:hover {
          animation-play-state: paused;
          z-index: 100;
        }

        /* 레인 안에서 흐르는 애니메이션 (절대 겹치지 않음) */
        @keyframes flowInLane {
          0% {
            left: 100vw;
            opacity: 0;
            transform: translateY(var(--vertical-offset)) rotate(var(--rotation)) scale(var(--scale));
          }
          2% {
            opacity: 1;
          }
          98% {
            opacity: 1;
          }
          100% {
            left: -400px;
            opacity: 0;
            transform: translateY(var(--vertical-offset)) rotate(var(--rotation)) scale(var(--scale));
          }
        }

        .card-inner {
          transform-origin: center;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Spotlight 종료 시 애니메이션 */
        .spotlight-exit {
          animation: shrinkToWall 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  )
}