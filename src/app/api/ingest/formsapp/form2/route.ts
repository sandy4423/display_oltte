import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forms App webhook 구조 파싱 (Form 2: 실시간 응원 담벼락)
    const { form, answer } = body

    // 답변에서 데이터 추출
    let postContent = ''
    let last4Digits = ''

    if (answer && answer.answers) {
      // 각 질문의 답변 추출
      for (const answerItem of answer.answers) {
        // 텍스트 답변 (응원메시지)
        if (answerItem.t && answerItem.t.trim()) {
          postContent = answerItem.t
        }

        // 숫자 답변 (전화번호 뒤 4자리)
        if (answerItem.n !== undefined && answerItem.n !== null) {
          last4Digits = String(answerItem.n)
        }
      }
    }

    // 기본 메시지가 없으면 기본 문구 사용
    if (!postContent || !postContent.trim()) {
      postContent = '올때만두를 응원합니다! 🥟'
    }

    // 전화번호 뒷자리 4자리 사용
    const postSubmitter = last4Digits || '익명'

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
      media_url: null,
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
    console.error('Forms App Form2 ingest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
