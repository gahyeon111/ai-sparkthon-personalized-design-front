// ─── Chat ─────────────────────────────────────────────────────────────────

export type ChatStep =
  | "init"
  | "channel_select"
  | "ref_image_query"
  | "resolving"
  | "preset_confirm"
  | "generating"
  | "edit"
  | "review"
  | "matching"
  | "done";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Preset {
  preset_id: string;
  axis1: string;
  axis2: string;
  axis3?: string;
  display_label: string;
  display_description: string;
  image_prompt: string;
  similarity_score: number;
}

export interface ChatMessageResponse {
  channel_options?: string[];
  quick_replies?: string[];
  reply: string;
  step: ChatStep;
  campaign_id?: string;
  presets?: Preset[];
}

export interface ChatSession {
  session_id: string;
  step: ChatStep;
  messages: ChatMessage[];
}

// ─── Channel ──────────────────────────────────────────────────────────────

export type ChannelType = "메인 배너" | "이벤트 배너" | "로그인 팝업";

export const CHANNEL_SIZES: Record<ChannelType, { width: number; height: number }> = {
  "메인 배너": { width: 1024, height: 720 },
  "이벤트 배너": { width: 960, height: 960 },
  "로그인 팝업": { width: 1024, height: 960 },
};

// ─── Progress Steps ───────────────────────────────────────────────────────

export type ProgressStep =
  | "캠페인 입력"
  | "채널 선택"
  | "이미지 업로드"
  | "캠페인 분석"
  | "생성 조합"
  | "수정"
  | "검수"
  | "고객 매칭"
  | "발송";

export const PROGRESS_STEPS: ProgressStep[] = [
  "캠페인 입력",
  "채널 선택",
  "이미지 업로드",
  "캠페인 분석",
  "생성 조합",
  "수정",
  "검수",
  "고객 매칭",
  "발송",
];

export function chatStepToProgressIndex(step: ChatStep): number {
  switch (step) {
    case "init":          return 0; // 캠페인 입력
    case "channel_select": return 1; // 채널 선택
    case "ref_image_query": return 2; // 이미지 업로드
    case "resolving":     return 3; // 캠페인 분석
    case "preset_confirm": return 4; // 생성 조합
    case "generating":    return 5; // 수정
    case "edit":          return 5; // 수정
    case "review":        return 6; // 검수
    case "matching":      return 7; // 고객 매칭
    case "done":          return 8; // 발송
    default:              return 0;
  }
}

// ─── Images ───────────────────────────────────────────────────────────────

export interface GeneratedImage {
  id: string;
  tag: string;
  image_url: string | null;
  meta: Record<string, unknown>;
  status: "done" | "pending";
}

export interface ImageStatusResponse {
  campaign_status: string;
  total: number;
  completed: number;
  images: GeneratedImage[];
}

// ─── Campaign ─────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  campaign_text: string;
  preset_ids: string[];
  width: number;
  height: number;
  status: string;
}
