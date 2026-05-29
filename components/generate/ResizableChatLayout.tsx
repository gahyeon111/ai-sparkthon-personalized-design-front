"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_WIDTH = 400;

interface Props {
  main: ReactNode;
  chat: ReactNode;
}

export default function ResizableChatLayout({ main, chat }: Props) {
  const [activeTab, setActiveTab] = useState<"main" | "chat">("chat");

  return (
    <>
      {/* 모바일 레이아웃 */}
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:hidden">
        {/* 탭 바 */}
        <div className="shrink-0 flex justify-center px-4 py-3">
          <div className="inline-flex rounded-full bg-white/8 p-1">
            {(["chat", "main"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative rounded-full px-5 py-2 text-[13px] font-medium"
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-[var(--accent-lime)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-150 ${activeTab === tab ? "text-[#0b1118]" : "text-white/50"}`}>
                  {tab === "chat" ? "이미지 생성" : "결과 확인"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 패널 */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === "chat" ? chat : main}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* PC 레이아웃 */}
      <div className="hidden h-full min-h-0 overflow-hidden lg:flex">
        <div className="min-w-0 flex-1 flex flex-col overflow-hidden">{main}</div>
        <div
          className="flex shrink-0 flex-col overflow-hidden bg-[var(--bg-main)]"
          style={{ width: DEFAULT_WIDTH }}
        >
          {chat}
        </div>
      </div>
    </>
  );
}
