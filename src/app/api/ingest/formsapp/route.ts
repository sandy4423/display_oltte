import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forms App 데이터를 우리 형식에 맞게 매핑
    // 실제 Forms App의 데이터 구조에 따라 수정 필요
    const {
      message,
      content, 
      text,
      name,
      submitter,
      image,
      media,
      channel = 'main'
    } = body

    // 여러 가능한 필드명에서 내용 추출
    const postContent = message || content || text
    const postSubmitter = name || submitter
    const postMedia = image || media

    if (!postContent) {
      return NextResponse.json({ error: 'No content found in request' }, { status: 400 })
    }

    // 모더레이션 규칙 확인
    const { data: rules } = await supabase
      .from('moderation_rules')
      .select('*')
      .eq('channel_id', channel)
      .single()

    let status = 'pending'
    
    if (rules?.allow_auto_approve) {
      // 금칙어 확인
      const hasBannedWord = rules.banned_keywords.some(keyword =>
        postContent.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (!hasBannedWord) {
        status = 'approved'
      }
    }

    const postData = {
      channel_id: channel,
      content: postContent,
      media_url: postMedia,
      submitter: postSubmitter,
      status,
      spotlight_at: status === 'approved' ? new Date().toISOString() : null
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: status === 'approved' ? 'Post approved and published' : 'Post received and pending approval'
    }, { status: 201 })
  } catch (error) {
    console.error('Forms App ingest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}