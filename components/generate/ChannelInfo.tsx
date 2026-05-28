"use client";

import { motion } from "framer-motion";
import { type ChannelType, CHANNEL_SIZES } from "@/lib/types";

interface Props {
  channel: ChannelType | null;
}

export default function ChannelInfo({ channel }: Props) {
  if (!channel) return null;

  const size = CHANNEL_SIZES[channel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-[15px] font-semibold text-[var(--accent-lime)]">채널</h3>
      <div className="inline-flex items-center gap-5 rounded-[18px] border border-[var(--border)] bg-[#1d1d1c] px-7 py-5 text-sm">
        <span className="text-[var(--text-secondary)]">{channel}</span>
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {size.width} X {size.height}
        </span>
      </div>
    </motion.div>
  );
}
