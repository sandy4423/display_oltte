// 채널 이름 업데이트 스크립트
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateChannelName() {
  console.log('📝 채널 이름 업데이트 중...\n')

  try {
    const { data, error } = await supabase
      .from('channels')
      .update({ name: '올때만두 실시간 응원 담벼락' })
      .eq('id', 'main')
      .select()

    if (error) {
      console.error('❌ 오류:', error.message)
      return
    }

    console.log('✅ 채널 이름 업데이트 완료!')
    console.log('   변경된 채널:', data[0])
    console.log('\n💡 화면을 새로고침하면 새 이름이 표시됩니다!')
  } catch (error) {
    console.error('❌ 업데이트 실패:', error.message)
  }
}

updateChannelName()
