"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import AppShell from "@/components/AppShell";
import { getCampaigns, getImageStatus, type CampaignSummary } from "@/lib/api";
import type { GeneratedImage } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  processing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  done: "text-green-400 bg-green-400/10 border-green-400/20",
  finalized: "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
};

function ImageRow({ campaignId }: { campaignId: string }) {
  const [images, setImages] = useState<GeneratedImage[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImageStatus(campaignId)
      .then((response) => setImages(response.images))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-[var(--text-secondary)]">
        <Loader2 size={13} className="animate-spin" /> 이미지 로딩 중...
      </div>
    );
  }

  if (!images || images.length === 0) {
    return <p className="py-3 text-xs text-[var(--text-secondary)]">생성된 이미지 없음</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-3 pt-3">
      {images.map((image, index) => (
        <div key={image.id} className="flex flex-col gap-1">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]">
            {image.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.image_url} alt={image.tag} className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={20} className="text-[var(--text-secondary)]" />
              </div>
            )}
            <span
              className={`absolute top-1.5 right-1.5 rounded-full border px-1.5 py-0.5 text-[9px] ${
                image.status === "done"
                  ? "border-green-400/20 bg-green-400/10 text-green-400"
                  : "border-yellow-400/20 bg-yellow-400/10 text-yellow-400"
              }`}
            >
              {image.status}
            </span>
          </div>
          <p className="truncate text-[10px] text-[var(--text-secondary)]">
            #{index + 1} {image.tag}
          </p>
          {image.image_prompt ? (
            <p className="line-clamp-3 text-[9px] leading-relaxed text-[var(--text-secondary)] opacity-70">
              {image.image_prompt}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: CampaignSummary }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
      >
        {open ? (
          <ChevronDown size={14} className="shrink-0 text-[var(--text-secondary)]" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-[var(--text-secondary)]" />
        )}
        <span className="shrink-0 font-mono text-xs text-[var(--text-secondary)]">
          {campaign.id.slice(0, 13)}
        </span>
        <span className="flex-1 truncate text-sm text-[var(--text-primary)]">
          {campaign.campaign_text}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] ${
            STATUS_COLOR[campaign.status] ??
            "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-secondary)]"
          }`}
        >
          {campaign.status}
        </span>
        <span className="shrink-0 text-[10px] text-[var(--text-secondary)]">
          {campaign.width}×{campaign.height}
        </span>
        <span className="shrink-0 text-[10px] text-[var(--text-secondary)]">
          {campaign.created_at?.slice(0, 16)}
        </span>
      </button>

      {open ? (
        <div className="border-t border-[var(--border)] px-4 pb-4">
          <ImageRow campaignId={campaign.id} />
        </div>
      ) : null}
    </div>
  );
}

export default function ProjectsPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = () => {
    setLoading(true);
    setError(null);
    getCampaigns()
      .then(setCampaigns)
      .catch((errorValue) => setError(String(errorValue)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getCampaigns()
      .then(setCampaigns)
      .catch((errorValue) => setError(String(errorValue)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[var(--bg-main)]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">프로젝트 관리</h1>
            <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)]">
              {campaigns.length}개
            </span>
            <button
              onClick={loadCampaigns}
              disabled={loading}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-40"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              새로고침
            </button>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-[var(--text-secondary)]">
              <Loader2 size={20} className="mr-2 animate-spin" /> 로딩 중...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-20 text-center text-sm text-[var(--text-secondary)]">
              캠페인이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
