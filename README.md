# Forms Wall Display System

Forms App 기반 실시간 담벼락 디스플레이 시스템입니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── screen/[channel]/     # 매장 디스플레이 화면
│   ├── admin/                # 관리자 대시보드
│   ├── api/
│   │   ├── posts/           # 게시물 관리 API
│   │   ├── admin/           # 관리자 API
│   │   └── ingest/formsapp/ # Forms App 데이터 수신
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/              # 재사용 가능한 컴포넌트
├── lib/
│   └── supabase.ts         # Supabase 클라이언트 설정
└── types/
    └── index.ts            # TypeScript 타입 정의

database/
└── schema.sql              # 데이터베이스 스키마
```

## 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 데이터베이스 설정

1. Supabase 프로젝트 생성
2. `database/schema.sql` 파일의 내용을 SQL 편집기에서 실행
3. Realtime 기능이 `posts` 테이블에서 활성화되었는지 확인

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

## 주요 기능

### 디스플레이 화면 (`/screen/[channel]`)
- 실시간 새 게시물 Spotlight 표시
- 승인된 게시물 Wall 형태로 표시
- 채널별 테마 적용

### 관리자 대시보드 (`/admin`)
- 게시물 승인/차단 관리
- 금칙어 설정
- 자동 승인 설정
- 실시간 통계

### API 엔드포인트

#### 게시물 API
- `GET /api/posts` - 게시물 목록 조회
- `POST /api/posts` - 새 게시물 생성

#### Forms App 연동
- `POST /api/ingest/formsapp` - Forms App 데이터 수신

#### 관리자 API
- `PATCH /api/admin/posts/[id]` - 게시물 상태 변경
- `PATCH /api/admin/channels/[id]` - 채널 설정 변경
- `PATCH /api/admin/moderation/[channelId]` - 모더레이션 규칙 변경

## Forms App 연동

Forms App에서 다음 URL로 Webhook을 설정하세요:

```
POST https://your-domain.com/api/ingest/formsapp
```

지원하는 데이터 형식:
```json
{
  "message": "게시물 내용",
  "name": "작성자명",
  "image": "이미지 URL (선택)",
  "channel": "채널 ID (기본값: main)"
}
```

## 매장 디스플레이 운영

1. 크롬 브라우저에서 `/screen/main` 접속
2. F11로 전체화면 모드 실행
3. 자동 새로고침을 위한 스케줄러 설정 (Windows 작업 스케줄러 등)

## 기술 스택

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel (권장)

## 라이선스

Private License