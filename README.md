# Frontend — Personalized Card Banner

Next.js 기반 캠페인 생성/대시보드 프론트엔드.

## 디렉토리 구조

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── generate/page.tsx
│   ├── projects/page.tsx
│   └── dashboard/
│       ├── page.tsx
│       └── [campaignId]/page.tsx
│
├── components/
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── home/
│   │   └── LandingPage.tsx
│   ├── generate/
│   │   ├── GeneratePage.tsx
│   │   ├── ResizableChatLayout.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ImageGrid.tsx
│   │   ├── ProgressSteps.tsx
│   │   ├── CampaignInfo.tsx
│   │   ├── ChannelInfo.tsx
│   │   ├── PresetCombinations.tsx
│   │   └── RecommendedCopies.tsx
│   └── dashboard/
│       └── CampaignDashboardDetail.tsx
│
└── lib/
    ├── api.ts
    ├── types.ts
    └── dashboard.ts
```

## 주요 페이지

### `/generate`

- 캠페인 문구 입력
- 채널 선택
- 프리셋 6개 확인/교체
- 이미지 생성
- 수정 및 검수

### `/dashboard`

- 캠페인 목록 확인
- 상세 페이지 진입

### `/dashboard/[campaignId]`

CTR 시뮬레이션 결과를 보여주는 상세 성과 화면.

현재 표시 항목:
- 발송 고객
- 전체 CTR
- 예상 클릭 수
- 유형별 예상 클릭 수 / CTR / 상태
- 유형별 대표 특성
- 발송된 이미지 6종 모달

## CTR 대시보드 동작 방식

이제 대시보드는 프론트에서 목 CTR을 계산하지 않습니다.

기존:
- `frontend/lib/dashboard.ts` 내부에서 하드코딩된 CTR/발송고객 수 사용

현재:
- `GET /api/campaign/{campaign_id}/simulation` 호출
- 백엔드가 최초 1회 CTR 시뮬레이션 계산
- 이후 `campaign_simulations` 캐시 반환

즉 상세 대시보드는 “계산기”가 아니라 “시뮬레이션 결과 뷰어” 역할만 합니다.

## 백엔드 연동

`lib/api.ts` 기준 주요 호출:

| 함수 | API | 설명 |
|---|---|---|
| `getCampaigns()` | `GET /api/campaign` | 캠페인 목록 |
| `getImageStatus(campaignId)` | `GET /api/image/status/{id}` | 생성 이미지 조회 |
| `getCampaignSimulation(campaignId)` | `GET /api/campaign/{id}/simulation` | CTR 시뮬레이션 결과 조회 |

상세 대시보드에서는:

1. 캠페인 목록 조회
2. 이미지 상태 조회
3. CTR 시뮬레이션 조회
4. 응답을 axis1 타입별 카드/테이블에 매핑

## 타입 구조

`lib/types.ts`에 시뮬레이션 응답 타입이 추가되어 있습니다.

주요 타입:
- `CampaignSimulationResponse`
- `CampaignSimulationRow`

row 기준 주요 필드:
- `type_id`
- `type_name`
- `audience`
- `predicted_ctr`
- `predicted_clicks`
- `status`
- `image_analysis`

## 실행 방법

```bash
cd frontend
npm install
npm run dev
```

기본 백엔드 주소:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

백엔드가 먼저 실행 중이어야 합니다.

## 참고

- 대시보드 첫 진입 시 백엔드가 CTR 시뮬레이션을 아직 계산하지 않았다면 응답이 약간 느릴 수 있습니다.
- 새로고침 버튼은 캠페인 목록과 시뮬레이션을 다시 조회합니다.
- `?force=true` 재계산 API는 프론트 기본 흐름에서는 직접 노출하지 않지만, 백엔드에서 지원합니다.
