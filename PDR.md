# PRD: Forms App 기반 실시간 담벼락 디스플레이 시스템

## 1. 개요

고객이 **Forms App**을 통해 남긴 글을, 매장 내 모니터(스크린)에 실시간으로 표시하는 **웹 기반 담벼락 서비스**를 구축한다.

고객이 글을 남기면, 잠시 동안 강조(Spotlight) 형태로 크게 표시되고, 이후 담벼락(Wall) 형태로 저장되어 순환 노출된다.

---

## 2. 목표

* Forms App 데이터를 별도 개발 없이 연동 (Webhook 또는 커넥터 이용)
* 별도 설치 없이 브라우저(크롬)만으로 작동
* 실시간 반응 및 자동 전환 애니메이션 제공
* 관리자 승인/차단, 금칙어 필터링 지원

---

## 3. 사용자 시나리오

### 고객 (Forms App 이용자)

1. QR코드 스캔 → Forms App 입력폼 열기
2. 텍스트(및 이미지) 작성 후 제출
3. 매장 스크린에 자신의 메시지가 바로 띄워짐
4. 일정 시간이 지나면 담벼락 모드에서 카드 형태로 유지

### 매장 관리자

1. `/admin` 페이지에서 승인/차단/금칙어 관리
2. 테마, 글자 크기, Spotlight 지속 시간 설정

### 매장 스크린

1. 상시 실행되는 브라우저 탭(크롬 전체화면)
2. 새로운 글이 오면 Spotlight 모드로 전환 (5~10초)
3. 이후 Wall에 자동 합류, 카드 리스트 또는 모자이크 형태로 순환

---

## 4. 시스템 아키텍처

```
[고객 모바일]
   └─ Forms App (기존 폼)
        │  (제출)
        ▼
[인제스트 계층]
   └─ Webhook/노코드 커넥터(Zapier/Make) → /api/ingest/formsapp
        │  (JSON 매핑/필터)
        ▼
[백엔드 & DB]
   └─ Next.js API (App Router)
       ├─ 금칙어/승인 로직
       ├─ Posts 저장 (Supabase Postgres)
       └─ 실시간 브로드캐스트 (Supabase Realtime)
        │
        ├─ /api/admin/* (승인/차단/설정)
        └─ /api/posts (목록/조회)
        ▼
[프런트엔드]
   ├─ Screen(키오스크) /screen/:channel
   │   ├─ 실시간 구독(신규 글 수신)
   │   ├─ Spotlight N초 노출
   │   └─ 이후 Wall(담벼락) 카드로 순환
   │
   └─ Admin 대시보드 /admin
       ├─ 대기/승인/차단 관리
       ├─ 금칙어·테마·레이아웃 설정
       └─ 채널(매장 화면) 관리

[디스플레이 운영]
   └─ 크롬 전체화면/키오스크 모드(자동 실행·오토 리로드)
```

---

## 5. 기능 요구사항

| 구분  | 기능           | 설명                                |
| --- | ------------ | --------------------------------- |
| 입력  | Forms App 연동 | Webhook 또는 Zapier/Make로 폼 데이터 전송  |
| 필터링 | 금칙어 필터       | 욕설, 스팸 단어 감지 후 자동 차단              |
| 승인  | 자동/수동 승인     | 관리자 설정에 따라 자동 승인 가능               |
| 표시  | Spotlight 모드 | 새 글 도착 시 화면 중앙에 N초 표시             |
| 표시  | Wall 모드      | 승인된 모든 글을 카드 형태로 순환 노출            |
| 표시  | 이미지 첨부       | 텍스트와 함께 이미지 노출 지원                 |
| 관리  | 관리자 페이지      | 승인/차단, 테마, 글자 크기, 레이아웃 설정         |
| 시스템 | 실시간 갱신       | Supabase Realtime 혹은 WebSocket 기반 |
| 시스템 | 오프라인 복구      | 네트워크 끊김 시 자동 재연결 및 리로드            |

---

## 6. 데이터 모델

### `channels`

| 필드                 | 타입          | 설명                        |
| ------------------ | ----------- | ------------------------- |
| id                 | text        | 채널 ID (예: store-main)     |
| name               | text        | 채널명                       |
| theme              | jsonb       | 테마 색상, 폰트 등               |
| spotlight_duration | int         | Spotlight 표시 시간(초)        |
| wall_layout        | text        | wall 표시 방식 (masonry/list) |
| created_at         | timestamptz | 생성 시각                     |

### `posts`

| 필드           | 타입          | 설명                           |
| ------------ | ----------- | ---------------------------- |
| id           | uuid        | 게시물 ID                       |
| channel_id   | text        | 채널 ID                        |
| content      | text        | 게시 내용                        |
| media_url    | text        | 이미지 URL                      |
| status       | text        | pending / approved / blocked |
| spotlight_at | timestamptz | Spotlight 표시 시각              |
| created_at   | timestamptz | 생성 시각                        |
| submitter    | text        | 작성자(닉네임/익명)                  |

### `moderation_rules`

| 필드                 | 타입     | 설명       |
| ------------------ | ------ | -------- |
| channel_id         | text   | 채널 ID    |
| banned_keywords    | text[] | 금칙어 배열   |
| allow_auto_approve | bool   | 자동 승인 여부 |

---

## 7. 기술 스택

* **Frontend**: Next.js (React 18), Tailwind CSS
* **Backend**: Next.js API Routes (App Router)
* **Database**: Supabase (Postgres + Realtime)
* **Infra**: Vercel Hosting
* **Webhook Integration**: Forms App → Zapier/Make → /api/ingest/formsapp
* **Display**: Chrome Kiosk Mode / Android TV Kiosk Browser

---

## 8. 동작 흐름

1. 고객이 Forms App 제출
2. Zapier/Make가 `POST /api/ingest/formsapp` 호출
3. 백엔드에서 내용 필터링 및 저장
4. Supabase Realtime이 신규 승인된 글을 구독자(Screen)에 broadcast
5. Screen이 Spotlight 모드로 글 표시 후 Wall로 이동
6. Admin은 대시보드에서 승인/차단/테마 설정 가능

---

## 9. UI 구성

### Screen

* 상단: 브랜드명 / 시간 / QR 안내
* 본문:

  * Spotlight (글자 크게, 중앙 강조)
  * Wall (카드 3열, 자동 슬라이드)
* 테마: 베이지 배경(E36E42 팔레트), 검정 폰트

### Admin

* 승인/차단 탭
* 금칙어 목록 관리
* 채널(매장)별 설정
* 실시간 미리보기

---

## 10. 운영 및 유지보수

* 크롬 키오스크 모드 자동 실행
* 새벽 4시 자동 새로고침(Windows 스케줄러)
* DB 백업 주기: 1일 1회
* 금칙어/자동 승인 규칙 주기적 검토
* 로그/모니터링: Supabase Log + Vercel Analytics

---

## 11. 향후 확장

* 이미지 업로드 기능 (Cloudflare R2 / Supabase Storage)
* 댓글/좋아요 기능
* Wall 배경 음악/슬라이드 전환 애니메이션

---

## 12. 핵심 지표 (KPI)

| 구분            | 목표                  |
| ------------- | ------------------- |
| 평균 반영 시간      | < 3초                |
| 가동 시간(Uptime) | 99.5% 이상            |
| 고객 참여율        | 일평균 20건 이상 입력       |
| 관리자 개입률       | < 10% (자동 승인 비율 높음) |

---

**작성일:** 2025-10-14
**작성자:** 채승우
**프로젝트명:** Forms App 기반 실시간 담벼락 디스플레이 시스템
