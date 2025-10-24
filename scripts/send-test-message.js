// 실시간 테스트 메시지 전송 스크립트

async function sendTestMessage(message, name = null) {
  const baseUrl = 'http://localhost:3003'

  try {
    const response = await fetch(`${baseUrl}/api/ingest/formsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        name,
        channel: 'main'
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ 메시지 전송 성공!')
      console.log(`   내용: "${message}"`)
      console.log(`   작성자: ${name || '익명'}`)
      console.log(`   상태: ${result.data.status}`)
      console.log(`\n💡 http://localhost:3001/screen/main 에서 Spotlight를 확인하세요!\n`)
    } else {
      console.log('❌ 전송 실패:', result)
    }
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }
}

// 커맨드라인 인자로 메시지 받기
const args = process.argv.slice(2)
const message = args[0] || '테스트 메시지입니다!'
const name = args[1] || null

console.log('📤 실시간 테스트 메시지 전송 중...\n')
sendTestMessage(message, name)
