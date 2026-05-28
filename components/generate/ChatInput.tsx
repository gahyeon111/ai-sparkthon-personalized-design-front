"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type RefImageUsage =
  | "STYLE_REFERENCE"
  | "LOGO_EXTRACTION"
  | "COMPOSITION_REFERENCE"
  | "COLOR_REFERENCE"
  | "IMAGE_SYNTHESIS";

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
  { value: "IMAGE_SYNTHESIS", label: "이미지 합성" },
];

const PICKER_USAGE_OPTIONS = USAGE_OPTIONS.filter(
  (option) => option.value !== "IMAGE_SYNTHESIS"
);

/** 텍스트 기반으로 usage 추론 — 매칭 안 되면 STYLE_REFERENCE 기본값 */
function inferUsageFromText(text: string): RefImageUsage {
  const t = text.toLowerCase();
  if (t.includes("로고") || t.includes("logo")) return "LOGO_EXTRACTION";
  if (t.includes("구도") || t.includes("레이아웃") || t.includes("layout") || t.includes("composition")) return "COMPOSITION_REFERENCE";
  if (t.includes("색") || t.includes("컬러") || t.includes("color") || t.includes("palette")) return "COLOR_REFERENCE";
  return "STYLE_REFERENCE";
}

interface Props {
  onSend: (message: string, attachments?: AttachedImage[]) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedImageTag?: string | null;
  step?: "init" | "edit" | string;
  campaignExamples?: string[];
  onExampleSelect?: (example: string) => void;
}

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "메시지를 입력하세요",
  selectedImageTag,
  step,
  campaignExamples = [],
  onExampleSelect,
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

    // 이미지 첨부 후 usage 선택 없이 텍스트로 입력하는 경우:
    // 텍스트를 그대로 전송하고, pendingFile은 STYLE_REFERENCE 기본값으로 포함
    if (pendingFile && showUsagePicker) {
      const previewUrl = URL.createObjectURL(pendingFile);
      const inferredUsage = inferUsageFromText(trimmed);
      const newAttachment: AttachedImage = { file: pendingFile, previewUrl, usage_type: inferredUsage };
      onSend(trimmed, [...attachments, newAttachment]);
      setValue("");
      setAttachments([]);
      setPendingFile(null);
      setShowUsagePicker(false);
      return;
    }

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

  // 수정 모드: 최대 1장, 일반 모드: 최대 2장
  const maxAttachments = selectedImageTag ? 1 : 2;
  const atAttachmentLimit = attachments.length >= maxAttachments;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 수정 모드(이미지 선택됨)에서는 usage picker 없이 바로 IMAGE_SYNTHESIS로 추가
    // 이미 1장이면 교체
    if (selectedImageTag) {
      const previewUrl = URL.createObjectURL(file);
      setAttachments((prev) => {
        // 기존 attachment URL 해제
        prev.forEach((a) => URL.revokeObjectURL(a.previewUrl));
        return [{ file, previewUrl, usage_type: "IMAGE_SYNTHESIS" }];
      });
    } else if (attachments.length < maxAttachments) {
      setPendingFile(file);
      setShowUsagePicker(true);
    }
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const confirmUsage = (usage: RefImageUsage) => {
    if (!pendingFile) return;
    const previewUrl = URL.createObjectURL(pendingFile);
    const newAttachment: AttachedImage = { file: pendingFile, previewUrl, usage_type: usage };
    const currentText = value.trim();
    // 텍스트가 이미 있으면 이미지와 함께 즉시 전송, 없으면 usage 라벨을 기본 메시지로 전송
    const messageToSend =
      currentText || USAGE_OPTIONS.find((o) => o.value === usage)?.label || "참조 이미지";
    onSend(messageToSend, [...attachments, newAttachment]);
    setValue("");
    setAttachments([]);
    setPendingFile(null);
    setShowUsagePicker(false);
  };

  const removeAttachment = (idx: number) => {
    URL.revokeObjectURL(attachments[idx].previewUrl);
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="shrink-0 bg-transparent px-5 pb-5 pt-4">
      {step === "init" && campaignExamples.length > 0 && (
        <div className="mb-3 rounded-[20px] border border-[#3a414a] bg-[#12171e] px-4 py-3">
          <p className="mb-2 text-[11px] font-medium text-[var(--text-secondary)]">
            예시 캠페인
          </p>
          <div className="flex flex-wrap gap-2">
            {campaignExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => onExampleSelect?.(example)}
                disabled={disabled}
                className="rounded-full border border-[#48515d] bg-[#18202a] px-3 py-1.5 text-left text-[11px] text-[var(--text-primary)] transition-colors hover:border-[var(--accent-lime)] hover:text-[var(--accent-lime)] disabled:opacity-40"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "edit" && (
        <div className="mb-3 rounded-[16px] border border-[var(--accent-lime)]/25 bg-[var(--accent-lime)]/8 px-3 py-2 text-[11px] text-[var(--text-primary)]">
          가능한 수정: 프롬프트 편집 / 이미지 합성 / 배경 제거
        </div>
      )}

      {/* 선택된 이미지 표시 (수정 모드) */}
      {selectedImageTag && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--accent-lime)]/30 bg-[var(--accent-lime)]/10 px-3 py-1.5 text-xs text-[var(--accent-lime)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            수정 대상: {selectedImageTag}
          </div>
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
            <div className="flex items-center gap-2 mb-2 min-w-0">
              <ImageIcon size={13} className="shrink-0 text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)] min-w-0 flex items-center gap-1 flex-wrap">
                <span className="text-[var(--text-primary)] font-medium max-w-[160px] truncate block" title={pendingFile.name}>
                  {pendingFile.name}
                </span>
                <span className="shrink-0">— 이미지 활용 방식을 선택하세요</span>
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {PICKER_USAGE_OPTIONS.map((opt) => (
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
            <p className="mt-3 text-[11px] text-[var(--text-secondary)]">
              원하는 기능이 없으면 채팅창에 직접 입력해 주세요.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 입력 영역 */}
      <div className="rounded-[14px] border-2 border-[var(--accent-lime)] bg-white px-4 py-3 shadow-[0_24px_64px_rgba(0,0,0,0.32)] transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[36px] w-full resize-none bg-transparent pr-2 text-[13px] font-medium leading-relaxed text-[#1f1f1d] placeholder:text-[#8b8b84] outline-none"
          style={{ maxHeight: "120px" }}
        />

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || atAttachmentLimit}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7d7d1] text-[#4a4a46] transition-colors hover:border-[#b6b6b0] hover:text-[#111111] disabled:opacity-30"
            title={
              atAttachmentLimit
                ? selectedImageTag
                  ? "이미지 합성 시 최대 1장까지 첨부 가능합니다"
                  : "최대 2장까지 첨부 가능합니다"
                : "참조 이미지 첨부"
            }
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all hover:bg-[#222] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
