// Supabase 연결 및 데이터베이스 테스트 스크립트
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...\n')

  try {
    // 1. Channels 테이블 확인
    console.log('1️⃣ Channels 테이블 확인...')
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*')

    if (channelsError) {
      console.error('❌ Channels 테이블 오류:', channelsError.message)
    } else {
      console.log('✅ Channels 테이블 확인:', channels.length, '개의 채널')
      if (channels.length > 0) {
        console.log('   - 첫 번째 채널:', channels[0])
      }
    }

    // 2. Posts 테이블 확인
    console.log('\n2️⃣ Posts 테이블 확인...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5)

    if (postsError) {
      console.error('❌ Posts 테이블 오류:', postsError.message)
    } else {
      console.log('✅ Posts 테이블 확인:', posts.length, '개의 게시물')
    }

    // 3. Moderation Rules 테이블 확인
    console.log('\n3️⃣ Moderation Rules 테이블 확인...')
    const { data: rules, error: rulesError } = await supabase
      .from('moderation_rules')
      .select('*')

    if (rulesError) {
      console.error('❌ Moderation Rules 테이블 오류:', rulesError.message)
    } else {
      console.log('✅ Moderation Rules 테이블 확인:', rules.length, '개의 규칙')
      if (rules.length > 0) {
        console.log('   - 첫 번째 규칙:', rules[0])
      }
    }

    console.log('\n🎉 데이터베이스 연결 테스트 완료!')

  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message)
    process.exit(1)
  }
}

testConnection()
