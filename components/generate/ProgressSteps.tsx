"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PROGRESS_STEPS } from "@/lib/types";

interface Props {
  currentIndex: number;
}

export default function ProgressSteps({ currentIndex }: Props) {
  return (
    <div className="relative w-full max-w-[720px]">
      <div className="absolute left-4 right-4 top-4 z-0 h-px bg-[#6a6a67]" />

      <div className="relative z-10 flex justify-between gap-2">
        {PROGRESS_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step} className="flex min-w-0 flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isDone || isActive ? "#1364FE" : "transparent",
                  borderColor: isDone || isActive ? "#1364FE" : "#5b5b58",
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-[var(--bg-main)] text-[13px] font-medium"
                style={{ color: isDone ? "#fff" : isActive ? "#fff" : "#1364FE" }}
              >
                {isDone ? (
                  <Check size={14} strokeWidth={2.4} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </motion.div>
              <span
                className="text-center text-[9px] whitespace-nowrap"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
