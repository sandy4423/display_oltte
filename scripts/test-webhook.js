// Forms App Webhook API 테스트 스크립트

async function testWebhook() {
  console.log('🔍 Forms App Webhook API 테스트 시작...\n')

  const baseUrl = 'http://localhost:3001'

  // 테스트 케이스 1: 정상적인 메시지
  console.log('1️⃣ 테스트 1: 정상적인 메시지 전송')
  try {
    const response1 = await fetch(`${baseUrl}/api/ingest/formsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '올때만두 최고입니다! 🥟',
        name: '김철수',
        channel: 'main'
      })
    })

    const result1 = await response1.json()
    console.log('✅ 응답:', result1)
    console.log('   상태:', response1.status, response1.statusText)
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }

  console.log('\n2️⃣ 테스트 2: 이미지 포함 메시지')
  try {
    const response2 = await fetch(`${baseUrl}/api/ingest/formsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '만두가 정말 맛있어요!',
        name: '이영희',
        image: 'https://picsum.photos/400/300',
        channel: 'main'
      })
    })

    const result2 = await response2.json()
    console.log('✅ 응답:', result2)
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }

  console.log('\n3️⃣ 테스트 3: content 필드 사용 (다양한 필드명 테스트)')
  try {
    const response3 = await fetch(`${baseUrl}/api/ingest/formsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '친구들과 함께 왔어요!',
        submitter: '박민수'
      })
    })

    const result3 = await response3.json()
    console.log('✅ 응답:', result3)
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }

  console.log('\n4️⃣ 테스트 4: 익명 메시지')
  try {
    const response4 = await fetch(`${baseUrl}/api/ingest/formsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '또 올게요!'
      })
    })

    const result4 = await response4.json()
    console.log('✅ 응답:', result4)
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }

  // 잠시 대기 후 게시물 확인
  console.log('\n5️⃣ 게시물 목록 확인')
  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    const response5 = await fetch(`${baseUrl}/api/posts?channel=main&status=approved&limit=10`)
    const result5 = await response5.json()

    console.log('✅ 승인된 게시물:', result5.data.length, '개')
    result5.data.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.content}" - ${post.submitter || '익명'}`)
    })
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }

  console.log('\n🎉 테스트 완료!')
}

testWebhook()
