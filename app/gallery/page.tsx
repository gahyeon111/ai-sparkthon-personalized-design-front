"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getAllImages, resolveImageUrl, type GalleryImage } from "@/lib/api";
import { ChevronDown, ExternalLink, RefreshCw, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "ctr_desc", label: "반응율 높은 순" },
  { value: "newest", label: "최신순" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// ─── 이미지 상세 모달 ──────────────────────────────────────────────────────

function dDayLabel(campaignCreatedAt: string): string {
  try {
    const created = new Date(campaignCreatedAt);
    const days = Math.floor((Date.now() - created.getTime()) / 86400000);
    return `D+${days}일`;
  } catch {
    return "D+?일";
  }
}

function ImageModal({ img, onClose }: { img: GalleryImage; onClose: () => void }) {
  const src = resolveImageUrl(img.image_url);
  const ctr = img.image_ctr != null ? (img.image_ctr * 100).toFixed(1) + "%" : "—";
  const dday = dDayLabel(img.campaign_created_at);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm px-6 sm:items-center sm:p-6 md:left-[280px]"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#141412] shadow-2xl mt-6 max-h-[calc(100vh-6rem-1rem)] sm:mt-0 sm:max-h-[90vh] sm:flex-row">

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X size={15} />
        </button>

        {/* 상단(모바일) / 좌(PC): 이미지 */}
        <div className="flex h-[220px] items-center justify-center bg-[#0e0e0c] sm:h-auto sm:flex-1 sm:min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={img.tag}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* 하단(모바일) / 우(PC): 정보 패널 */}
        <div className="flex flex-1 flex-col gap-0 overflow-y-auto border-t border-white/8 sm:w-[320px] sm:flex-none sm:border-l sm:border-t-0">

          {/* 태그 헤더 */}
          <div className="px-6 pt-6 pb-5 border-b border-white/8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Generated Image
            </p>
            <p className="mt-2 text-[17px] font-semibold text-white leading-snug">
              {img.tag || "이미지"}
            </p>
          </div>

          {/* 메타 */}
          <div className="px-6 py-5 border-b border-white/8 grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">캠페인 ID</p>
              <p className="text-[13px] font-medium text-white font-mono">
                {img.campaign_id.slice(0, 10).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">클릭율 ({dday})</p>
              <p className="text-[13px] font-medium text-white">{ctr}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">생성일</p>
              <p className="text-[13px] text-white">{img.created_at.slice(0, 10)}</p>
            </div>
          </div>

          {/* 캠페인 텍스트 */}
          <div className="px-6 py-5 border-b border-white/8">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">
              캠페인 내용
            </p>
            <p className="text-[13px] leading-6 text-white/80">
              {img.campaign_text || "—"}
            </p>
          </div>

          {/* 이미지 생성 프롬프트 */}
          <div className="px-6 py-5 flex-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">
              이미지 생성 프롬프트
            </p>
            {img.image_prompt ? (
              <p className="text-[13px] leading-6 text-white/80 whitespace-pre-wrap break-words">
                {img.image_prompt}
              </p>
            ) : (
              <p className="text-[13px] text-white/30">프롬프트 정보 없음</p>
            )}
          </div>

          {/* 대시보드 바로가기 */}
          <div className="px-6 pb-6 pt-2">
            <Link
              href={`/dashboard/${img.campaign_id}`}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              <ExternalLink size={13} />
              캠페인 대시보드 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 이미지 카드 ───────────────────────────────────────────────────────────

function ImageCard({ img, onClick }: { img: GalleryImage; onClick: () => void }) {
  const src = resolveImageUrl(img.image_url);
  const ctr = img.image_ctr != null ? (img.image_ctr * 100).toFixed(1) + "%" : "—";
  const dday = dDayLabel(img.campaign_created_at);
  const shortId = img.campaign_id.slice(0, 10).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group block w-full text-left rounded-[20px] overflow-hidden border border-white/8 bg-white/4 transition-all hover:border-white/16 hover:shadow-[0_12px_32px_rgba(19,100,254,0.12)]"
    >
      <div className="relative bg-[#1e1e1c]" style={{ aspectRatio: "1 / 1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={img.tag}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-x-3 gap-y-0.5">
        <p className="text-[11px] text-[var(--text-secondary)]">캠페인 ID</p>
        <p className="text-[11px] text-[var(--text-secondary)]">클릭율({dday})</p>
        <p className="text-[13px] font-medium text-white truncate">{shortId}</p>
        <p className="text-[13px] font-medium text-white">{ctr}</p>
      </div>
    </button>
  );
}

// ─── 갤러리 페이지 ─────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [sort, setSort] = useState<SortValue>("ctr_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const load = (s: SortValue) => {
    setLoading(true);
    setError(null);
    getAllImages(s)
      .then(setImages)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(sort); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (s: SortValue) => {
    setSort(s);
    setSortOpen(false);
    load(s);
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "";

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[#0B1016]" onClick={() => setSortOpen(false)}>
        <div className="mx-auto max-w-[1420px] px-8 py-7">

          {/* 헤더 */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="text-[13px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                Image Gallery
              </p>
              <h1 className="mt-3 text-[42px] font-semibold leading-tight tracking-[-0.04em] text-white">
                전체 이미지
              </h1>
              <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
                생성된 이미지를 확인하시고, 어떤 캠페인 프롬프트가 입력되었는지 확인해세요.
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]/70">
                클릭율(CTR) 값이 — 로 표시되는 경우{" "}
                <Link href="/dashboard" className="underline underline-offset-2 hover:text-white transition-colors">
                  대시보드
                </Link>
                에서 해당 캠페인을 먼저 확인해주세요.
              </p>
            </div>

          </div>

          {/* 정렬 컨트롤 */}
          <div className="mb-6 flex justify-end" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSortOpen((p) => !p)}
                className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white transition-colors hover:bg-white/8"
              >
                {currentSortLabel}
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border border-white/10 bg-[#1a1a18] py-1.5 shadow-xl">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSort(opt.value)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/6 ${
                        sort === opt.value ? "text-[var(--accent-lime)]" : "text-white/80"
                      }`}
                    >
                      {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          {error && (
            <div className="mb-6 rounded-[20px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-[20px] overflow-hidden border border-white/8 bg-white/4">
                  <div className="animate-pulse bg-[#1e1e1c]" style={{ aspectRatio: "1 / 1" }} />
                  <div className="px-4 py-3 space-y-2">
                    <div className="h-3 w-20 rounded-full bg-white/8 animate-pulse" />
                    <div className="h-4 w-24 rounded-full bg-white/12 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-[var(--border)] bg-white/3 py-32 text-center">
              <p className="text-[var(--text-secondary)]">생성된 이미지가 없습니다.</p>
              <Link
                href="/generate"
                className="mt-4 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
              >
                이미지 생성하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
              {images.map((img) => (
                <ImageCard key={img.id} img={img} onClick={() => setSelected(img)} />
              ))}
            </div>
          )}

          {!loading && images.length > 0 && (
            <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
              총 {images.length}개 이미지
            </p>
          )}
        </div>
      </div>

      {selected && (
        <ImageModal img={selected} onClose={() => setSelected(null)} />
      )}
    </AppShell>
  );
}
