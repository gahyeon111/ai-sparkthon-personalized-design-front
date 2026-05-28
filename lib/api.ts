import type {
  ChatMessageResponse,
  ChatSession,
  ImageStatusResponse,
  Campaign,
  CampaignSimulationResponse,
  CopyRecommendationResponse,
  Preset,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 180_000;
const MAX_RETRIES = 2;

/** Backend static cache or ComfyUI URL → browser-loadable URL */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  if (url.startsWith("/static/")) {
    return `${BASE}${url}`;
  }

  if (url.includes("cloud.comfy.org") || url.includes("/api/view")) {
    try {
      const parsed = new URL(url);
      const filename = parsed.searchParams.get("filename");
      if (filename) {
        return `${BASE}/static/view/${encodeURIComponent(filename)}`;
      }
    } catch {
      // fall through
    }
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return url;
}

function toFriendlyError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
    }
    if (error.message === "Failed to fetch") {
      return new Error(
        "백엔드 서버에 연결할 수 없습니다. http://localhost:8000 이 실행 중인지 확인해주세요."
      );
    }
    return error;
  }
  return new Error("알 수 없는 오류가 발생했습니다.");
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${path} → ${res.status}: ${text}`);
      }

      if (res.status === 204) {
        return undefined as T;
      }

      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      const friendly = toFriendlyError(error);
      const shouldRetry =
        attempt < MAX_RETRIES &&
        (friendly.message.includes("연결할 수 없습니다") ||
          friendly.message.includes("시간이 초과"));

      if (!shouldRetry) {
        throw friendly;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw toFriendlyError(lastError);
}

// ─── Chat ─────────────────────────────────────────────────────────────────

export async function createChatSession(): Promise<{ session_id: string; step: string }> {
  return request("/api/chat/session", { method: "POST" });
}

export async function sendMessage(
  sessionId: string,
  body: {
    message: string;
    width?: number;
    height?: number;
    batch_size?: number;
    reference_images?: Array<{ filename?: string; file_path?: string; usage_type: string }>;
    selected_image_id?: string;
  }
): Promise<ChatMessageResponse> {
  return request(`/api/chat/${sessionId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getSession(sessionId: string): Promise<ChatSession> {
  return request(`/api/chat/${sessionId}`);
}

// ─── Images ───────────────────────────────────────────────────────────────

export async function getImageStatus(
  campaignId: string
): Promise<ImageStatusResponse> {
  return request(`/api/image/status/${campaignId}`);
}

// ─── Campaign ─────────────────────────────────────────────────────────────

export interface CampaignSummary {
  id: string;
  campaign_text: string;
  status: string;
  width: number;
  height: number;
  created_at: string;
}

export async function getCampaigns(): Promise<CampaignSummary[]> {
  return request("/api/campaign");
}

export async function getCampaign(campaignId: string): Promise<Campaign> {
  return request(`/api/campaign/${campaignId}`);
}

export async function getCampaignSimulation(
  campaignId: string,
  options?: { force?: boolean }
): Promise<CampaignSimulationResponse> {
  const query = options?.force ? "?force=true" : "";
  return request(`/api/campaign/${campaignId}/simulation${query}`);
}

export async function finalizeCampaign(
  campaignId: string
): Promise<{ campaign_id: string; status: string; message: string }> {
  return request(`/api/campaign/${campaignId}/finalize`, { method: "POST" });
}

export async function getCopyRecommendations(
  body: {
    campaign_text: string;
    confirmed_presets: Preset[];
  }
): Promise<CopyRecommendationResponse> {
  try {
    return await request("/api/campaign/copy-recommendations", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    // 부가 기능 — 백엔드 재시작/일시 장애 시 UI 흐름은 유지
    return { items: [] };
  }
}

// ─── Gallery ──────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: string;
  campaign_id: string;
  image_url: string;
  tag: string;
  meta: Record<string, unknown>;
  created_at: string;
  campaign_text: string;
  campaign_status: string;
  image_ctr: number | null;
  campaign_created_at: string;
  image_prompt: string;
}

export async function getAllImages(sort: "ctr_desc" | "newest" = "ctr_desc"): Promise<GalleryImage[]> {
  return request(`/api/image/all?sort=${sort}`);
}

// ─── Entities ─────────────────────────────────────────────────────────────

export interface EntityItem {
  id: string;
  source: "builtin" | "user";
  name_kr: string;
  name_en: string;
  aliases?: string[];
  key_color?: string;
  definition?: string;
  image_hint?: string;
  style_vibe?: string;
  trigger_keywords?: string[];
  description?: string;
  icon_hint?: string;
  category?: string;
  logo_assets?: string[];
  display_logo?: string | null;
}

export type EntityType = "brands" | "services" | "benefits" | "samsungcards";

export async function getEntities(type: EntityType): Promise<EntityItem[]> {
  return request(`/api/entities/${type}`);
}

export async function addEntity(
  type: EntityType,
  body: Record<string, unknown>
): Promise<{ entity_id: string }> {
  return request(`/api/entities/${type}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteEntity(
  type: EntityType,
  entityId: string
): Promise<void> {
  await request(`/api/entities/${type.replace(/s$/, "")}/${entityId}`, {
    method: "DELETE",
  });
}

export async function uploadEntityLogo(
  file: File
): Promise<{ logo_path: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/api/entities/upload-logo`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`로고 업로드 실패: ${text}`);
  }
  return res.json();
}

export function resolveLogoUrl(displayLogo: string | null | undefined): string {
  if (!displayLogo) return "";
  return `${BASE}/static/logos/${displayLogo}`;
}

export async function uploadReferenceImage(
  file: File
): Promise<{ filename: string; file_path: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/api/chat/upload-reference`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`참조 이미지 업로드 실패: ${text}`);
  }
  return res.json();
}

// ─── Postprocess ──────────────────────────────────────────────────────────

export async function postprocess(body: {
  image_id: string;
  processing_type: string;
  processing_params?: Record<string, unknown>;
}): Promise<{ image_id: string; result_url: string | null; status: string }> {
  return request("/api/postprocess", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
