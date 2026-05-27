"use client";

import { motion } from "framer-motion";
import { type ChannelType, CHANNEL_SIZES } from "@/lib/types";

interface Props {
  campaignId: string | null;
  campaignText: string | null;
  channel: ChannelType | null;
}

function formatCampaignId(id: string): string {
  return id.slice(0, 13); // UUID 앞 두 세그먼트 (e.g. a0ea57b1-66bb)
}

export default function CampaignInfo({ campaignId, campaignText, channel }: Props) {
  if (!campaignId && !campaignText) return null;

  const size = channel ? CHANNEL_SIZES[channel] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* 현재 캠페인 */}
      {campaignText && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-medium text-[var(--text-secondary)]">
              현재 캠페인
            </h3>
            {campaignId && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[10px] font-mono text-[var(--accent)] tracking-wider">
                {formatCampaignId(campaignId)}
              </span>
            )}
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
            <span className="text-sm text-[var(--text-primary)] leading-relaxed">
              {campaignText}
            </span>
          </div>
        </div>
      )}

      {/* 채널 */}
      {channel && size && (
        <div>
          <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">
            채널
          </h3>
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm">
            <span className="text-[var(--text-primary)] font-medium">{channel}</span>
            <span className="text-[var(--text-secondary)] text-xs">
              {size.width} × {size.height}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
