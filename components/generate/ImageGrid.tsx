"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { GeneratedImage } from "@/lib/types";

interface Props {
  images: GeneratedImage[];
  selectedImageId: string | null;
  onSelect?: (id: string) => void;
  canSelect?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  /** 이미지 없이 섹션 제목만 표시 (프리셋 컨펌 대기 등) */
  idleMessage?: string;
  completed?: number;
  total?: number;
}

export default function ImageGrid({
  images,
  selectedImageId,
  onSelect,
  canSelect = true,
  isLoading = false,
  loadingLabel = "이미지 생성 중입니다...",
  idleMessage,
  completed = 0,
  total = 0,
}: Props) {
  if (images.length === 0 && !isLoading && !idleMessage) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[var(--accent-lime)]">
          이미지 생성
        </h3>
        {(isLoading || total > 0) && (
          <span className="text-xs text-[var(--text-secondary)]">
            {total > 0 ? `${completed}/${total} 완료` : loadingLabel}
          </span>
        )}
      </div>
      {images.length === 0 && !isLoading && idleMessage && (
        <div className="rounded-[22px] border border-[var(--border)] bg-[#1d1d1c] px-5 py-5">
          <p className="text-[13px] text-[var(--text-secondary)]">{idleMessage}</p>
        </div>
      )}
      {images.length === 0 && isLoading && (
        <div className="rounded-[22px] border border-[var(--border)] bg-[#1d1d1c] px-5 py-5">
          <div className="mb-4 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <Loader2 size={18} className="animate-spin text-[var(--accent-lime)]" />
            <span>{loadingLabel}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
                style={{ aspectRatio: "1 / 1" }}
              >
                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,#2c2c2a_0%,#3b3b39_50%,#2c2c2a_100%)]" />
              </div>
            ))}
          </div>
        </div>
      )}
      {images.length > 0 && (
        <>
      <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3 sr-only">
        이미지 생성
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence>
          {images.map((img, idx) => {
            const isSelected = img.id === selectedImageId;
            const isDone = img.status === "done" && img.image_url;
            const clickable = isDone && canSelect && !!onSelect;

            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                onClick={() => clickable && onSelect!(img.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  clickable ? "cursor-pointer" : "cursor-default"
                } ${
                  isSelected
                    ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20"
                    : clickable
                    ? "border-[var(--border)] hover:border-[var(--accent)]/50"
                    : "border-[var(--border)]"
                }`}
                style={{ aspectRatio: "1 / 1" }}
              >
                {/* 이미지 영역 */}
                <div className="absolute inset-0 bg-[var(--bg-card)] flex items-center justify-center">
                  {isDone && img.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.image_url}
                      alt={img.tag}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Loader2
                      size={20}
                      className="text-[var(--text-secondary)] animate-spin"
                    />
                  )}
                </div>

                {/* 선택 오버레이 */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-[var(--accent)]/10 pointer-events-none"
                  />
                )}

                {/* 하단 태그 */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[10px] text-white/80 truncate">
                    #{idx + 1}{" "}
                    <span className="text-white/50">
                      {img.tag || "생성 중..."}
                    </span>
                  </p>
                </div>

                {/* 선택 뱃지 */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-[var(--accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    선택됨
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {selectedImageId && canSelect && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          이미지를 선택했습니다. 채팅에서 수정을 요청하세요.
        </p>
      )}
        </>
      )}
    </div>
  );
}
