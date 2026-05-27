"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getCampaigns, type CampaignSummary } from "@/lib/api";
import { inferCampaignName, inferChannel } from "@/lib/dashboard";
import { BarChart3, ChevronRight, Loader2, RefreshCw } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    processing: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    done: "border-green-400/20 bg-green-400/10 text-green-300",
    finalized: "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-white",
    failed: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        colorMap[status] ?? "border-[var(--border)] bg-white/5 text-[var(--text-secondary)]"
      }`}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = () => {
    setLoading(true);
    setError(null);
    getCampaigns()
      .then((items) => setCampaigns(items))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getCampaigns()
      .then((items) => setCampaigns(items))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[#0B1016]">
        <div className="mx-auto max-w-[1420px] px-8 py-7">
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="text-[13px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                Campaign Dashboard
              </p>
              <h1 className="mt-3 text-[42px] font-semibold leading-none tracking-[-0.04em] text-white">
                대시보드
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadCampaigns}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/80 transition-colors hover:text-white disabled:opacity-40"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                새로고침
              </button>
              <button className="rounded-full bg-[#E8E8E6] px-6 py-3 text-sm font-medium text-[#131313]">
                C2012531
              </button>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-[24px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-32 text-[var(--text-secondary)]">
              <Loader2 size={20} className="mr-2 animate-spin" /> 로딩 중...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-[32px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-8 py-24 text-center text-sm text-[var(--text-secondary)]">
              캠페인이 없습니다
            </div>
          ) : (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-2 text-white">
                  <BarChart3 size={18} />
                  <h2 className="text-[28px] font-semibold tracking-[-0.03em]">생성 캠페인</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)]">
                  총 {campaigns.length}개
                </span>
              </div>
              <div className="grid gap-4 xl:grid-cols-3">
                {campaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/dashboard/${campaign.id}`}
                    className="group rounded-[28px] border border-white/8 bg-white/4 px-5 py-5 text-left transition-all hover:border-white/16 hover:bg-white/6 hover:shadow-[0_16px_40px_rgba(19,100,254,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                          {campaign.id.slice(0, 13)}
                        </p>
                        <p className="mt-3 text-[22px] font-semibold leading-snug tracking-[-0.03em] text-white">
                          {inferCampaignName(campaign)}
                        </p>
                      </div>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="mt-6 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                      <span>{inferChannel(campaign)}</span>
                      <span>{campaign.created_at.slice(0, 10)}</span>
                    </div>
                    <div className="mt-4 line-clamp-2 text-sm leading-6 text-white/72">
                      {campaign.campaign_text}
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
                      세부 캠페인 보기
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
