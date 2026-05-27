"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getCampaigns, getImageStatus, type CampaignSummary } from "@/lib/api";
import type { GeneratedImage } from "@/lib/types";
import { ChevronDown, ChevronRight, RefreshCw, ImageIcon, Loader2 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  processing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  done:        "text-green-400 bg-green-400/10 border-green-400/20",
  finalized:   "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20",
  failed:      "text-red-400 bg-red-400/10 border-red-400/20",
};

function ImageRow({ campaignId }: { campaignId: string }) {
  const [images, setImages] = useState<GeneratedImage[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImageStatus(campaignId)
      .then((r) => setImages(r.images))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) return (
    <div className="flex items-center gap-2 py-3 text-xs text-[var(--text-secondary)]">
      <Loader2 size={13} className="animate-spin" /> 이미지 로딩 중...
    </div>
  );
  if (!images || images.length === 0) return (
    <p className="py-3 text-xs text-[var(--text-secondary)]">생성된 이미지 없음</p>
  );

  return (
    <div className="pt-3 grid grid-cols-4 gap-3">
      {images.map((img, i) => (
        <div key={img.id} className="flex flex-col gap-1">
          <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-primary)] aspect-square">
            {img.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.image_url} alt={img.tag} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={20} className="text-[var(--text-secondary)]" />
              </div>
            )}
            <span className={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full border ${img.status === "done" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"}`}>
              {img.status}
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] truncate">#{i + 1} {img.tag}</p>
          {img.image_prompt && (
            <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed opacity-70 line-clamp-3">{img.image_prompt}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function CampaignRow({ c }: { c: CampaignSummary }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        {open ? <ChevronDown size={14} className="text-[var(--text-secondary)] shrink-0" /> : <ChevronRight size={14} className="text-[var(--text-secondary)] shrink-0" />}
        <span className="font-mono text-xs text-[var(--text-secondary)] shrink-0">{c.id.slice(0, 13)}</span>
        <span className="flex-1 text-sm text-[var(--text-primary)] truncate">{c.campaign_text}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLOR[c.status] ?? "text-[var(--text-secondary)] bg-[var(--bg-input)] border-[var(--border)]"}`}>
          {c.status}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)] shrink-0">{c.width}×{c.height}</span>
        <span className="text-[10px] text-[var(--text-secondary)] shrink-0">{c.created_at?.slice(0, 16)}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-[var(--border)]">
          <ImageRow campaignId={c.id} />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getCampaigns()
      .then(setCampaigns)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[var(--bg-main)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">캠페인 현황</h1>
            <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-2 py-1 rounded-lg">
              {campaigns.length}개
            </span>
            <button
              onClick={load}
              disabled={loading}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              새로고침
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-red-400/20 bg-red-400/10 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-[var(--text-secondary)]">
              <Loader2 size={20} className="animate-spin mr-2" /> 로딩 중...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-secondary)] text-sm">
              캠페인이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((c) => <CampaignRow key={c.id} c={c} />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
