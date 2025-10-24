// Forms App 실제 webhook 데이터로 테스트

const testData = {
  "form": {
    "_id": "66e3f48d7dbdbc2ffb4cf1ff",
    "title": "올때만두 사전등록 이벤트"
  },
  "answer": {
    "formTitle": "올때만두 사전등록 이벤트",
    "answers": [
      {
        "q": "68ebdda7e98858554bbb1678",
        "p": {
          "p": "01085355548"
        }
      },
      {
        "q": "68ec4deae063812ad6083d9e",
        "t": "만두 너무 기대돼요! 화이팅하세요!"
      }
    ]
  }
}

async function testFormsAppWebhook() {
  console.log('🔍 Forms App Webhook 실제 데이터 테스트...\n')

  try {
    const response = await fetch('http://localhost:3003/api/ingest/formsapp', {
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

testFormsAppWebhook()
