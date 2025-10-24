import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await props.params
    const { data, error } = await supabase
      .from('moderation_rules')
      .select('*')
      .eq('channel_id', params.channelId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await props.params
    const body = await request.json()
    const { banned_keywords, allow_auto_approve } = body

    const updates: any = {}
    if (banned_keywords !== undefined) updates.banned_keywords = banned_keywords
    if (allow_auto_approve !== undefined) updates.allow_auto_approve = allow_auto_approve

    const { data, error } = await supabase
      .from('moderation_rules')
      .update(updates)
      .eq('channel_id', params.channelId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}