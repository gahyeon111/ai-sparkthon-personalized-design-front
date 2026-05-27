"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PROGRESS_STEPS } from "@/lib/types";

interface Props {
  currentIndex: number;
}

export default function ProgressSteps({ currentIndex }: Props) {
  return (
    <div className="relative w-full max-w-[780px]">
      <div className="absolute left-5 right-5 top-5 z-0 h-px bg-[#6a6a67]" />

      <div className="relative z-10 flex justify-between gap-3">
        {PROGRESS_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step} className="flex min-w-0 flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isDone || isActive ? "#1364FE" : "transparent",
                  borderColor: isDone || isActive ? "#1364FE" : "#5b5b58",
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-[var(--bg-main)] text-[18px] font-medium"
                style={{ color: isDone ? "#fff" : isActive ? "#fff" : "#1364FE" }}
              >
                {isDone ? (
                  <Check size={16} strokeWidth={2.4} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </motion.div>
              <span
                className="text-center text-[10px] whitespace-nowrap"
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
