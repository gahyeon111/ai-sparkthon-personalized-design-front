"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PROGRESS_STEPS } from "@/lib/types";

interface Props {
  currentIndex: number;
}

export default function ProgressSteps({ currentIndex }: Props) {
  return (
    <div className="flex w-full max-w-[720px] items-start">
      {PROGRESS_STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        const leftSegmentDone = idx <= currentIndex;
        const rightSegmentDone = idx < currentIndex;

        return (
          <div key={step} className="relative flex min-w-0 flex-1 flex-col items-center gap-1.5">
            {idx > 0 && (
              <motion.div
                initial={false}
                animate={{ backgroundColor: leftSegmentDone ? "#1364FE" : "#6a6a67" }}
                className="absolute left-0 top-4 h-px"
                style={{ right: "calc(50% + 16px)" }}
              />
            )}
            {idx < PROGRESS_STEPS.length - 1 && (
              <motion.div
                initial={false}
                animate={{ backgroundColor: rightSegmentDone ? "#1364FE" : "#6a6a67" }}
                className="absolute right-0 top-4 h-px"
                style={{ left: "calc(50% + 16px)" }}
              />
            )}

            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor:
                    isDone || isActive ? "#1364FE" : "rgba(19, 100, 254, 0)",
                  borderColor: isDone || isActive ? "#1364FE" : "#5b5b58",
                }}
                className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-[var(--bg-main)] text-[13px] font-medium"
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
                style={{ color: "var(--text-primary)" }}
              >
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
