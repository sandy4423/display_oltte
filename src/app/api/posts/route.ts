import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get('channel') || 'main'
  const status = searchParams.get('status') || 'approved'
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('channel_id', channelId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel_id, content, media_url, submitter } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check moderation rules
    const { data: rules } = await supabase
      .from('moderation_rules')
      .select('*')
      .eq('channel_id', channel_id || 'main')
      .single()

    let status = 'pending'
    
    if (rules?.allow_auto_approve) {
      // Check banned keywords
      const hasBannedWord = rules.banned_keywords.some(keyword =>
        content.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (!hasBannedWord) {
        status = 'approved'
      }
    }

    const postData = {
      channel_id: channel_id || 'main',
      content,
      media_url,
      submitter,
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

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}