import type {
  ChatMessageResponse,
  ChatSession,
  ImageStatusResponse,
  Campaign,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
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

export async function getCampaign(campaignId: string): Promise<Campaign> {
  return request(`/api/campaign/${campaignId}`);
}

export async function finalizeCampaign(
  campaignId: string
): Promise<{ campaign_id: string; status: string; message: string }> {
  return request(`/api/campaign/${campaignId}/finalize`, { method: "POST" });
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
