"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PROGRESS_STEPS, type ProgressStep } from "@/lib/types";

interface Props {
  currentIndex: number; // 0-based, 현재 활성 스텝
}

export default function ProgressSteps({ currentIndex }: Props) {
  return (
    <div className="flex items-center gap-0">
      {PROGRESS_STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <div key={step} className="flex items-center">
            {/* 원 */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isDone
                    ? "#4f6ef7"
                    : isActive
                    ? "#4f6ef7"
                    : "transparent",
                  borderColor: isDone || isActive ? "#4f6ef7" : "#4b5272",
                }}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                style={{ color: isDone || isActive ? "#fff" : "#4b5272" }}
              >
                {isDone ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </motion.div>
              <span
                className="text-[10px] whitespace-nowrap"
                style={{
                  color:
                    isDone || isActive ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {step}
              </span>
            </div>

            {/* 연결선 */}
            {idx < PROGRESS_STEPS.length - 1 && (
              <div className="w-5 h-px mb-5 mx-0.5 relative overflow-hidden bg-[var(--border)]">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                  initial={false}
                  animate={{ width: idx < currentIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
