export interface Post {
  id: string
  channel_id: string
  content: string
  media_url?: string
  status: 'pending' | 'approved' | 'blocked'
  spotlight_at?: string
  created_at: string
  submitter?: string
}

export interface Channel {
  id: string
  name: string
  theme: {
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontSize?: string
  }
  spotlight_duration: number
  wall_layout: 'masonry' | 'list'
  created_at: string
}

export interface ModerationRule {
  channel_id: string
  banned_keywords: string[]
  allow_auto_approve: boolean
}