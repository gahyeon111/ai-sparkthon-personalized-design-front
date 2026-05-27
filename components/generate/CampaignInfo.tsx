"use client";

import { motion } from "framer-motion";

interface Props {
  campaignId: string | null;
  campaignText: string | null;
}

function formatCampaignId(id: string): string {
  return id.slice(0, 13); // UUID 앞 두 세그먼트 (e.g. a0ea57b1-66bb)
}

export default function CampaignInfo({ campaignId, campaignText }: Props) {
  if (!campaignId && !campaignText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-[15px] font-semibold text-[var(--accent-lime)]">
        캠페인 기본 정보
      </h3>
      <div className="rounded-[22px] border border-[var(--border)] bg-[#1d1d1c] px-8 py-7">
        <div className="grid grid-cols-[140px_1fr] gap-y-7 text-sm">
          <span className="text-[var(--text-secondary)]">캠페인 ID</span>
          <span className="text-[var(--text-primary)]">
            {campaignId ? formatCampaignId(campaignId) : "-"}
          </span>

          <span className="text-[var(--text-secondary)]">캠페인 내용</span>
          <span className="text-[var(--text-primary)] leading-relaxed">
            {campaignText || "-"}
          </span>

          <span className="text-[var(--text-secondary)]">대상 고객</span>
          <span className="text-[var(--text-primary)]">18,500명</span>
        </div>
      </div>
    </motion.div>
  );
}
