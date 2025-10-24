// Form 2 실제 webhook 데이터로 테스트

const testData = {
  "form": {
    "_id": "68fbf426579c2d00025c885b",
    "title": "올때만두 실시간 응원 담벼락!"
  },
  "answer": {
    "formTitle": "올때만두 실시간 응원 담벼락!",
    "answers": [
      {
        "q": "68fbf44b00397b9572d4960e",
        "t": "화이팅@@"
      },
      {
        "q": "68fbf46200397b9572d4960f",
        "n": 4423
      }
    ]
  }
}

async function testForm2Webhook() {
  console.log('🔍 Form 2 Webhook 실제 데이터 테스트...\n')

  try {
    const response = await fetch('http://localhost:3003/api/ingest/formsapp/form2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Webhook 처리 성공!')
      console.log('\n📝 저장된 데이터:')
      console.log('   내용:', result.data.content)
      console.log('   작성자:', result.data.submitter)
      console.log('   상태:', result.data.status)
      console.log('\n💡 Screen에서 확인: http://localhost:3003/screen/main')
    } else {
      console.log('❌ 오류:', result)
    }
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message)
  }
}

testForm2Webhook()
