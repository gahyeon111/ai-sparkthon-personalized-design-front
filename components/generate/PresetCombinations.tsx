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
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          {presets.map((preset, idx) => (
            <div key={preset.preset_id} className="flex items-center gap-5">
              <span className="inline-flex min-w-[74px] items-center justify-center rounded-full border border-white px-4 py-2 text-[16px] font-medium text-white">
                #{idx + 1}
              </span>
              <span className="text-[15px] text-[var(--text-primary)]">
                {preset.display_label || [preset.axis1, preset.axis2, preset.axis3].filter(Boolean).join(" / ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
