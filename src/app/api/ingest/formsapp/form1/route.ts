import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forms App webhook 구조 파싱
    const { form, answer } = body

    // 답변에서 데이터 추출
    let postContent = ''
    let phoneNumber = ''

    if (answer && answer.answers) {
      // 각 질문의 답변 추출
      for (const answerItem of answer.answers) {
        // 전화번호 질문 (questionType: "phone")
        if (answerItem.p && answerItem.p.p) {
          phoneNumber = answerItem.p.p
        }

        // 텍스트 답변 (응원의 한마디)
        if (answerItem.t && answerItem.t.trim()) {
          postContent = answerItem.t
        }
      }
    }

    // 기본 메시지가 없으면 기본 문구 사용
    if (!postContent || !postContent.trim()) {
      postContent = '올때만두를 응원합니다! 🥟'
    }

    // 전화번호 뒷자리 4자리만 사용 (개인정보 보호)
    let postSubmitter = '익명'
    if (phoneNumber) {
      // 010-1234-5678 -> 5678
      const last4 = phoneNumber.replace(/[^0-9]/g, '').slice(-4)
      postSubmitter = last4 || '익명'
    }

    const channel = 'main'

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
      media_url: null, // Forms App에서는 이미지를 받지 않음
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