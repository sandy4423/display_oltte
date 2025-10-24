'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Post, Channel, ModerationRule } from '@/types'

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>('main')
  const [moderationRule, setModerationRule] = useState<ModerationRule | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChannels()
    loadPosts()
    loadModerationRule()
  }, [selectedChannel])

  const loadChannels = async () => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .order('created_at')
    
    if (data) setChannels(data)
  }

  const loadPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('channel_id', selectedChannel)
      .order('created_at', { ascending: false })
    
    if (data) setPosts(data)
    setLoading(false)
  }

  const loadModerationRule = async () => {
    const { data } = await supabase
      .from('moderation_rules')
      .select('*')
      .eq('channel_id', selectedChannel)
      .single()
    
    if (data) setModerationRule(data)
  }

  const updatePostStatus = async (postId: string, status: 'approved' | 'blocked') => {
    const updates: any = { status }
    
    if (status === 'approved') {
      updates.spotlight_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)

    if (!error) {
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      ))
    }
  }

  const updateModerationRule = async (updates: Partial<ModerationRule>) => {
    const { error } = await supabase
      .from('moderation_rules')
      .update(updates)
      .eq('channel_id', selectedChannel)

    if (!error && moderationRule) {
      setModerationRule({ ...moderationRule, ...updates })
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      pending: '대기중',
      approved: '승인됨',
      blocked: '차단됨'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <div className="mt-4">
            <select 
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">게시물 관리</h2>
            </div>
            <div className="p-6">
              {posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  게시물이 없습니다
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-medium mb-2 break-words">
                            {post.content}
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.submitter || '익명'} • {new Date(post.created_at).toLocaleString('ko-KR')}
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(post.status)}
                        </div>
                      </div>
                      
                      {post.media_url && (
                        <img 
                          src={post.media_url} 
                          alt="첨부 이미지"
                          className="w-32 h-32 object-cover rounded mb-3"
                        />
                      )}
                      
                      {post.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updatePostStatus(post.id, 'approved')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            승인
                          </button>
                          <button 
                            onClick={() => updatePostStatus(post.id, 'blocked')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            차단
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          {/* Moderation Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">모더레이션 설정</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={moderationRule?.allow_auto_approve || false}
                    onChange={(e) => updateModerationRule({ allow_auto_approve: e.target.checked })}
                    className="mr-2"
                  />
                  자동 승인
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  금칙어 (쉼표로 구분)
                </label>
                <textarea 
                  value={moderationRule?.banned_keywords.join(', ') || ''}
                  onChange={(e) => updateModerationRule({ 
                    banned_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="욕설, 스팸, 광고"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">통계</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span>전체 게시물</span>
                <span className="font-semibold">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>승인 대기</span>
                <span className="font-semibold text-yellow-600">
                  {posts.filter(p => p.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>승인됨</span>
                <span className="font-semibold text-green-600">
                  {posts.filter(p => p.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>차단됨</span>
                <span className="font-semibold text-red-600">
                  {posts.filter(p => p.status === 'blocked').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}