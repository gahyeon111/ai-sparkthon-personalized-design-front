"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type RefImageUsage =
  | "STYLE_REFERENCE"
  | "LOGO_EXTRACTION"
  | "COMPOSITION_REFERENCE"
  | "COLOR_REFERENCE";

export interface AttachedImage {
  file: File;
  previewUrl: string;
  usage_type: RefImageUsage;
}

const USAGE_OPTIONS: { value: RefImageUsage; label: string }[] = [
  { value: "STYLE_REFERENCE", label: "스타일 참고" },
  { value: "LOGO_EXTRACTION", label: "로고 추출" },
  { value: "COMPOSITION_REFERENCE", label: "구도 참고" },
  { value: "COLOR_REFERENCE", label: "색감 참고" },
];

interface Props {
  onSend: (message: string, attachments?: AttachedImage[]) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedImageTag?: string | null;
}

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "메시지를 입력하세요",
  selectedImageTag,
}: Props) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<AttachedImage[]>([]);
  const [showUsagePicker, setShowUsagePicker] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, attachments.length > 0 ? attachments : undefined);
    setValue("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowUsagePicker(true);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const confirmUsage = (usage: RefImageUsage) => {
    if (!pendingFile) return;
    const previewUrl = URL.createObjectURL(pendingFile);
    setAttachments((prev) => [...prev, { file: pendingFile, previewUrl, usage_type: usage }]);
    setPendingFile(null);
    setShowUsagePicker(false);
  };

  const removeAttachment = (idx: number) => {
    URL.revokeObjectURL(attachments[idx].previewUrl);
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="shrink-0 bg-transparent px-5 pb-5 pt-4">
      {/* 선택된 이미지 표시 (수정 모드) */}
      {selectedImageTag && (
        <div className="mb-3 flex items-center gap-1.5 rounded-full border border-[var(--accent-lime)]/30 bg-[var(--accent-lime)]/10 px-3 py-1.5 text-xs text-[var(--accent-lime)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          수정 대상: {selectedImageTag}
        </div>
      )}

      {/* 첨부 이미지 미리보기 */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.previewUrl}
                  alt="참조 이미지"
                  className="w-14 h-14 rounded-lg object-cover border border-[var(--border)]"
                />
                <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white rounded-b-lg py-0.5 truncate px-1">
                  {USAGE_OPTIONS.find((o) => o.value === att.usage_type)?.label}
                </span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--border)] text-[var(--text-secondary)] hidden group-hover:flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* usage type 선택 팝업 */}
      <AnimatePresence>
        {showUsagePicker && pendingFile && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-3 rounded-[24px] border border-[#41413d] bg-[#12171e] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={13} className="text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--text-primary)] font-medium">{pendingFile.name}</span>
                — 이미지 활용 방식을 선택하세요
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {USAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => confirmUsage(opt.value)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => { setPendingFile(null); setShowUsagePicker(false); }}
                className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                취소
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 입력 영역 */}
      <div className="rounded-[28px] border-2 border-[var(--accent-lime)] bg-white px-5 py-4 shadow-[0_24px_64px_rgba(0,0,0,0.32)] transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[88px] w-full resize-none bg-transparent pr-2 text-[15px] leading-relaxed text-[#1f1f1d] placeholder:text-[#8b8b84] outline-none"
          style={{ maxHeight: "168px" }}
        />

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7d7d1] text-[#4a4a46] transition-colors hover:border-[#b6b6b0] hover:text-[#111111] disabled:opacity-30"
            title="참조 이미지 첨부"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-[#f3f3ee] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp size={24} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
