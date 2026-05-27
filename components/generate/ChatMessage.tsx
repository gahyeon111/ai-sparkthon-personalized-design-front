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
      className={`flex items-end gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <Image
            src="/chat-logo.png"
            alt="AI agent"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
        </div>
      )}

      <div className={`flex flex-col gap-3 ${isAssistant ? "max-w-[84%] items-start" : "max-w-[76%] items-end self-end"}`}>
        {/* 말풍선 */}
        <div
          className={`text-[13px] leading-relaxed ${
            isAssistant
              ? "rounded-[20px] rounded-tl-[6px] border border-[#d7d7d1] bg-[#f3f2ef] px-3.5 py-2.5 text-[#2d2d2b] shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
              : "w-full rounded-[16px] bg-[var(--accent)] px-3.5 py-2 text-white shadow-[0_12px_24px_rgba(19,100,254,0.26)]"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-1 text-[#6e6e68]">
              <span className="animate-bounce delay-0">·</span>
              <span className="animate-bounce delay-75">·</span>
              <span className="animate-bounce delay-150">·</span>
            </span>
          ) : (
            <span className="whitespace-pre-wrap">{content}</span>
          )}
          {channelOptions && channelOptions.length > 0 && onQuickReply && (
            <div className="mt-3 flex flex-wrap gap-2">
              {channelOptions.map((ch) => (
                <button
                  key={ch}
                  onClick={() => onQuickReply(ch)}
                  className="rounded-full border border-[#a8a8a2] bg-white px-3 py-1.5 text-[12px] font-medium text-[#343432] transition-colors hover:border-[#80807a]"
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
                  className="rounded-full border border-[#a8a8a2] bg-white px-3 py-1.5 text-[12px] font-medium text-[#343432] transition-colors hover:border-[#80807a]"
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
                className="inline-flex items-center gap-1.5 rounded-full border border-[#111111] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111111] transition-transform hover:-translate-y-0.5"
              >
                <Sparkles size={12} />
                검수하기
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
