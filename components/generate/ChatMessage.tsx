"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Preset } from "@/lib/types";

interface Props {
  role: "user" | "assistant";
  content: string;
  presets?: Preset[];
  showFinalizeButton?: boolean;
  onFinalize?: () => void;
  isLoading?: boolean;
  channelOptions?: string[];
  onQuickReply?: (text: string) => void;
  quick_replies?: string[];
}

export default function ChatMessage({
  role,
  content,
  presets,
  showFinalizeButton,
  onFinalize,
  isLoading,
  channelOptions,
  onQuickReply,
  quick_replies,
}: Props) {
  const isAssistant = role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-3.5 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center">
          <Image
            src="/chat-logo.png"
            alt="AI agent"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </div>
      )}

      <div className={`flex flex-col gap-3 ${isAssistant ? "max-w-[84%] items-start" : "max-w-[76%] items-end self-end"}`}>
        {/* 말풍선 */}
        <div
          className={`text-sm leading-relaxed ${
            isAssistant
              ? "rounded-[24px] rounded-tl-[8px] border border-[#d7d7d1] bg-[#f3f2ef] px-6 py-5 text-[#2d2d2b] shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
              : "w-full rounded-[18px] bg-[var(--accent)] px-5 py-3.5 text-white shadow-[0_12px_24px_rgba(19,100,254,0.26)]"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-1 text-[#6e6e68]">
              <span className="animate-bounce delay-0">·</span>
              <span className="animate-bounce delay-75">·</span>
              <span className="animate-bounce delay-150">·</span>
            </span>
          ) : (
            <span className={`whitespace-pre-wrap ${isAssistant ? "text-[15px] font-medium" : "text-[15px] font-medium"}`}>{content}</span>
          )}
          {presets && presets.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {presets.map((p, i) => (
                <div
                  key={p.preset_id}
                  className="rounded-[18px] border border-[#d9d9d4] bg-white/72 px-3.5 py-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--accent)]">
                      #{i + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#2d2d2b]">
                      {p.display_label}
                    </span>
                    <span className="ml-auto text-[10px] text-[#6e6e68]">
                      {(p.similarity_score * 100).toFixed(0)}% 유사
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#6e6e68]">
                    {p.display_description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[p.axis1, p.axis2, p.axis3].filter(Boolean).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#c7c7c0] px-2 py-0.5 text-[10px] text-[#555551]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {channelOptions && channelOptions.length > 0 && onQuickReply && (
            <div className="mt-3 flex flex-wrap gap-2">
              {channelOptions.map((ch) => (
                <button
                  key={ch}
                  onClick={() => onQuickReply(ch)}
                  className="rounded-full border border-[#a8a8a2] bg-white px-4 py-2 text-sm font-medium text-[#343432] transition-colors hover:border-[#80807a]"
                >
                  {ch}
                </button>
              ))}
            </div>
          )}

          {quick_replies && quick_replies.length > 0 && onQuickReply && (
            <div className="mt-3 flex flex-wrap gap-2">
              {quick_replies.map((qr) => (
                <button
                  key={qr}
                  onClick={() => onQuickReply(qr)}
                  className="rounded-full border border-[#a8a8a2] bg-white px-4 py-2 text-sm font-medium text-[#343432] transition-colors hover:border-[#80807a]"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {showFinalizeButton && onFinalize && (
            <div className="mt-3">
              <button
                onClick={onFinalize}
                className="inline-flex items-center gap-2 rounded-full border border-[#111111] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition-transform hover:-translate-y-0.5"
              >
                <Sparkles size={14} />
                검수하기
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
