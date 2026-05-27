"use client";

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
      className={`flex items-end gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div className="w-7 h-7 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center shrink-0 mb-0.5">
          <Sparkles size={13} className="text-[var(--accent)]" />
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col gap-2 ${isAssistant ? "items-start" : "items-end"}`}>
        {/* 말풍선 */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAssistant
              ? "bg-[var(--bg-card)] text-[var(--text-primary)] rounded-bl-sm border border-[var(--border)]"
              : "bg-[var(--accent)] text-white rounded-br-sm"
          }`}
        >
          {isLoading ? (
            <span className="flex gap-1 items-center text-[var(--text-secondary)]">
              <span className="animate-bounce delay-0">·</span>
              <span className="animate-bounce delay-75">·</span>
              <span className="animate-bounce delay-150">·</span>
            </span>
          ) : (
            <span className="whitespace-pre-wrap">{content}</span>
          )}
        </div>

        {/* 프리셋 목록 */}
        {presets && presets.length > 0 && (
          <div className="w-full space-y-1.5">
            {presets.map((p, i) => (
              <div
                key={p.preset_id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[var(--accent)]">
                    #{i + 1}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {p.display_label}
                  </span>
                  <span className="ml-auto text-[10px] text-[var(--text-secondary)]">
                    {(p.similarity_score * 100).toFixed(0)}% 유사
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {p.display_description}
                </p>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {[p.axis1, p.axis2, p.axis3].filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-full bg-[var(--border)] text-[10px] text-[var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 채널 선택 버튼 */}
        {channelOptions && channelOptions.length > 0 && onQuickReply && (
          <div className="flex flex-col gap-1.5 w-full">
            {channelOptions.map((ch) => (
              <button
                key={ch}
                onClick={() => onQuickReply(ch)}
                className="w-full text-left px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                {ch}
                <span className="ml-2 text-xs text-[var(--text-secondary)]">
                  {ch === "메인 배너" && "1024 × 720"}
                  {ch === "이벤트 배너" && "960 × 960"}
                  {ch === "로그인 팝업" && "1024 × 960"}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 범용 빠른 답장 버튼 */}
        {quick_replies && quick_replies.length > 0 && onQuickReply && (
          <div className="flex flex-wrap gap-1.5 w-full">
            {quick_replies.map((qr) => (
              <button
                key={qr}
                onClick={() => onQuickReply(qr)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* 검수하기 버튼 */}
        {showFinalizeButton && onFinalize && (
          <button
            onClick={onFinalize}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-lime)] text-black text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <Sparkles size={14} />
            검수하기
          </button>
        )}
      </div>
    </motion.div>
  );
}
