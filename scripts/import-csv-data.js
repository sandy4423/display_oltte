// CSV 데이터 import 스크립트
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function importCSVData() {
  console.log('📝 CSV 데이터 import 시작...\n')

  try {
    // 1. 기존 posts 데이터 모두 삭제
    console.log('🗑️  기존 posts 데이터 삭제 중...')
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 행 삭제

    if (deleteError) {
      console.error('❌ 삭제 오류:', deleteError.message)
      return
    }
    console.log('✅ 기존 데이터 삭제 완료\n')

    // 2. CSV 파일 읽기
    const csvPath = path.join(__dirname, '..', '기존 답변들.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').slice(1) // 헤더 제외

    // 3. CSV 데이터 파싱
    const posts = []
    for (const line of lines) {
      if (!line.trim()) continue // 빈 줄 건너뛰기

      const [submitter, content] = line.split(',')

      if (content && content.trim()) {
        posts.push({
          channel_id: 'main',
          content: content.trim(),
          media_url: null,
          submitter: submitter ? submitter.trim() : '익명',
          status: 'approved',
          spotlight_at: new Date().toISOString()
        })
      }
    }

    console.log(`📊 총 ${posts.length}개의 메시지 발견`)

    // 4. 배치로 삽입 (한 번에 100개씩)
    const batchSize = 100
    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize)

      const { error: insertError } = await supabase
        .from('posts')
        .insert(batch)

      if (insertError) {
        console.error(`❌ 삽입 오류 (${i}-${i + batch.length}):`, insertError.message)
        return
      }

      console.log(`✅ ${i + batch.length}/${posts.length} 삽입 완료`)
    }

    console.log('\n🎉 모든 데이터 import 완료!')
    console.log(`💡 Screen에서 확인: http://localhost:3003/screen/main`)
  } catch (error) {
    console.error('❌ Import 실패:', error.message)
  }
}

importCSVData()
