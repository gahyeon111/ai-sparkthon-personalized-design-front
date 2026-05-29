"use client";

import { motion } from "framer-motion";
import type { RecommendedCopy } from "@/lib/types";

interface Props {
  items: RecommendedCopy[];
  isLoading?: boolean;
}

export default function RecommendedCopies({ items, isLoading = false }: Props) {
  if (items.length === 0 && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[var(--accent-lime)]">추천 문구</h3>
        {isLoading && (
          <span className="text-xs text-[var(--text-secondary)]">
            유형별 문구를 정리하고 있습니다...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.preset_id}
            className="rounded-[22px] border border-[var(--border)] bg-[#1d1d1c] px-6 py-5"
          >
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-3 w-3 rounded-full"
                  style={{ backgroundColor: "#f3f2ef" }}
                />
                <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                  {item.axis1_name}
                </p>
              </div>
              {item.copy_tone && (
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {item.copy_tone}
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-[var(--bg-card)] px-4 py-3 text-[14px] leading-relaxed text-[var(--text-primary)]">
              {item.recommendation ?? item.recommendations[0] ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
