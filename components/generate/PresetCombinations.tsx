"use client";

import { motion } from "framer-motion";
import type { Preset } from "@/lib/types";

interface Props {
  presets: Preset[];
}

export default function PresetCombinations({ presets }: Props) {
  if (presets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-[15px] font-semibold text-[var(--accent-lime)]">이미지 조합</h3>
      <div className="rounded-[22px] border border-[var(--border)] bg-[#1d1d1c] px-8 py-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {presets.map((preset, idx) => (
            <div
              key={preset.preset_id}
              className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4"
            >
              <div className="mb-1 flex items-center gap-3">
                <span className="inline-flex min-w-[42px] items-center justify-center rounded-full bg-[#f3f2ef] px-3 py-1 text-xs font-semibold text-[#2d2d2b]">
                  #{idx + 1}
                </span>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {preset.axis1_name || preset.display_label || preset.axis1}
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {preset.axis2_name || preset.axis2}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
