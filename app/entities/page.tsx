"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  getEntities,
  addEntity,
  deleteEntity,
  resolveLogoUrl,
  uploadEntityLogo,
  type EntityItem,
  type EntityType,
} from "@/lib/api";
import { ImagePlus, Plus, RefreshCw, Trash2, X } from "lucide-react";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { key: EntityType; label: string; labelEn: string }[] = [
  { key: "brands",       label: "브랜드",   labelEn: "Partner Brands"  },
  { key: "services",     label: "서비스",   labelEn: "Card Services"   },
  { key: "benefits",     label: "혜택",     labelEn: "Benefit Types"   },
  { key: "samsungcards", label: "삼성카드", labelEn: "Samsung Card"    },
];

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string | string[] | null }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div>
      <p className="text-[11px] text-[var(--text-secondary)] mb-1">{label}</p>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((v) => (
            <span key={v} className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-white/70">
              {v}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-white leading-6">{value}</p>
      )}
    </div>
  );
}

function EntityDetailModal({
  item,
  tab,
  onClose,
  onDelete,
}: {
  item: EntityItem;
  tab: EntityType;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoSrc = resolveLogoUrl(item.display_logo);
  const isBenefit = tab === "benefits";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 md:left-[280px]"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative flex w-full max-w-4xl max-h-[90vh] rounded-[28px] overflow-hidden border border-white/10 bg-[#141412] shadow-2xl">

        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X size={15} />
        </button>

        {/* 좌: 로고 / 시각 영역 */}
        <div className="flex flex-1 items-center justify-center bg-[#e8e8e6] min-w-0">
          {!isBenefit && logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt={item.name_en}
              loading="lazy"
              decoding="async"
              className="max-h-[55%] max-w-[55%] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-10 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#d0d0ce]">
                <span className="text-[36px] font-bold text-[#888]">
                  {(item.name_kr || item.name_en || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              {isBenefit && item.icon_hint && (
                <p className="text-[13px] text-[#999] leading-6 max-w-[240px]">{item.icon_hint}</p>
              )}
            </div>
          )}
        </div>

        {/* 우: 정보 패널 */}
        <div className="flex w-[340px] shrink-0 flex-col overflow-y-auto border-l border-white/8">

          {/* 헤더 */}
          <div className="px-6 pt-6 pb-5 border-b border-white/8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              {TABS.find((t) => t.key === tab)?.labelEn}
            </p>
            <p className="mt-2 text-[20px] font-semibold text-white leading-snug">
              {item.name_kr || item.name_en}
            </p>
            {item.name_en && item.name_en !== item.name_kr && (
              <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{item.name_en}</p>
            )}
          </div>

          {/* 기본 메타 */}
          <div className="px-6 py-5 border-b border-white/8 grid grid-cols-2 gap-y-4">
            <div className="col-span-2">
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">엔티티 ID</p>
              <p className="text-[13px] font-medium text-white font-mono">{item.id}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">출처</p>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                item.source === "user"
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "bg-white/8 text-white/60"
              }`}>
                {item.source === "user" ? "직접 추가" : "기본 데이터"}
              </span>
            </div>
            {item.key_color && (
              <div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-1">주요 색상</p>
                <p className="text-[13px] text-white">{item.key_color}</p>
              </div>
            )}
            {item.category && (
              <div className="col-span-2">
                <p className="text-[11px] text-[var(--text-secondary)] mb-1">카테고리</p>
                <p className="text-[13px] text-white">{item.category}</p>
              </div>
            )}
          </div>

          {/* 상세 정보 */}
          <div className="px-6 py-5 flex flex-col gap-5 flex-1">

            {(item.aliases && item.aliases.length > 0) && (
              <DetailRow label="별칭 / 키워드" value={item.aliases} />
            )}

            {(item.trigger_keywords && item.trigger_keywords.length > 0) && (
              <DetailRow label="트리거 키워드" value={item.trigger_keywords} />
            )}

            {item.definition && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">정의</p>
                <p className="text-[13px] leading-6 text-white/80">{item.definition}</p>
              </div>
            )}

            {item.description && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">설명</p>
                <p className="text-[13px] leading-6 text-white/80">{item.description}</p>
              </div>
            )}

            {item.image_hint && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">이미지 힌트</p>
                <p className="text-[13px] leading-6 text-white/80">{item.image_hint}</p>
              </div>
            )}

            {item.icon_hint && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">아이콘 힌트</p>
                <p className="text-[13px] leading-6 text-white/80">{item.icon_hint}</p>
              </div>
            )}

            {item.style_vibe && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">스타일 & 분위기</p>
                <p className="text-[13px] leading-6 text-white/80">{item.style_vibe}</p>
              </div>
            )}

            {item.logo_assets && item.logo_assets.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">로고 에셋</p>
                <div className="flex flex-col gap-1">
                  {item.logo_assets.map((a) => (
                    <p key={a} className="text-[11px] font-mono text-white/50 truncate">{a}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 삭제 버튼 (사용자 추가 항목만) */}
          {item.source === "user" && onDelete && (
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={onDelete}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400/20 py-2.5 text-sm text-red-400/70 transition-colors hover:border-red-400/40 hover:text-red-400"
              >
                <Trash2 size={13} />
                항목 삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Entity card ──────────────────────────────────────────────────────────────

function EntityCard({
  item,
  onClick,
}: {
  item: EntityItem;
  onClick: () => void;
}) {
  const logoSrc = resolveLogoUrl(item.display_logo);

  return (
    <button
      onClick={onClick}
      className="group block w-full text-left rounded-[20px] border border-white/8 bg-white/4 overflow-hidden transition-all hover:border-white/20 hover:shadow-[0_12px_32px_rgba(19,100,254,0.12)]"
    >
      <div className="flex items-center justify-center bg-[#e8e8e6] transition-transform duration-300 group-hover:scale-[1.01]" style={{ aspectRatio: "4/3" }}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt={item.name_en}
            loading="lazy"
            decoding="async"
            className="max-h-[65%] max-w-[65%] object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d0d0ce] text-[20px] font-bold text-[#888]">
            {(item.name_kr || item.name_en || "?").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <p className="text-[13px] font-semibold text-white leading-snug truncate">{item.name_kr || item.name_en}</p>
        {item.name_en && item.name_en !== item.name_kr && (
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">{item.name_en}</p>
        )}
        {item.source === "user" && (
          <span className="mt-2 inline-block rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-[10px] text-[var(--accent)]">
            추가됨
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Benefit card ─────────────────────────────────────────────────────────────

function BenefitCard({
  item,
  onClick,
}: {
  item: EntityItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group block w-full text-left rounded-[20px] border border-white/8 bg-white/4 overflow-hidden transition-all hover:border-white/20 hover:shadow-[0_12px_32px_rgba(19,100,254,0.12)]"
    >
      <div className="flex items-center justify-center bg-[#1a1a18]" style={{ aspectRatio: "4/3" }}>
        <div className="px-4 text-center">
          <p className="text-[22px] font-bold text-[var(--accent-lime)] leading-tight">{item.name_kr}</p>
          {item.trigger_keywords && item.trigger_keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {item.trigger_keywords.slice(0, 3).map((kw) => (
                <span key={kw} className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/50">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13px] font-semibold text-white">{item.name_kr}</p>
        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.name_en}</p>
        {item.source === "user" && (
          <span className="mt-2 inline-block rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-[10px] text-[var(--accent)]">
            추가됨
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Add modal ────────────────────────────────────────────────────────────────

const LOGO_TABS: EntityType[] = ["brands", "services", "samsungcards"];

function AddModal({
  tab,
  onClose,
  onAdded,
}: {
  tab: EntityType;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      // 로고가 있으면 먼저 업로드
      let display_logo: string | undefined;
      if (logoFile && LOGO_TABS.includes(tab)) {
        const { logo_path } = await uploadEntityLogo(logoFile);
        display_logo = logo_path;
      }

      const aliases = form.aliases
        ? form.aliases.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const keywords = form.trigger_keywords
        ? form.trigger_keywords.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      let body: Record<string, unknown> = {};
      if (tab === "brands") {
        if (!form.entity_id || !form.name_kr) throw new Error("ID와 한국어 이름은 필수입니다");
        body = { entity_id: form.entity_id, name_kr: form.name_kr, name_en: form.name_en || "", aliases, key_color: form.key_color, definition: form.definition, image_hint: form.image_hint, display_logo };
      } else if (tab === "services") {
        if (!form.entity_id || !form.name_kr) throw new Error("ID와 한국어 이름은 필수입니다");
        body = { entity_id: form.entity_id, name_kr: form.name_kr, name_en: form.name_en || "", aliases, key_color: form.key_color, definition: form.definition, display_logo };
      } else if (tab === "benefits") {
        if (!form.entity_id || !form.name_kr) throw new Error("ID와 한국어 이름은 필수입니다");
        body = { entity_id: form.entity_id, name_kr: form.name_kr, name_en: form.name_en || "", trigger_keywords: keywords, description: form.description, icon_hint: form.icon_hint };
      } else if (tab === "samsungcards") {
        if (!form.entity_id || !form.brand_name) throw new Error("ID와 브랜드명은 필수입니다");
        body = { entity_id: form.entity_id, brand_name: form.brand_name, category: form.category, trigger_keywords: keywords, key_color: form.key_color, definition: form.definition, display_logo };
      }
      await addEntity(tab, body);
      onAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";

  const fields: { key: string; label: string; placeholder?: string; textarea?: boolean }[] =
    tab === "brands" ? [
      { key: "entity_id",   label: "ID (영문, 언더스코어) *",  placeholder: "예: my_brand" },
      { key: "name_kr",     label: "한국어 이름 *",             placeholder: "예: 내 브랜드" },
      { key: "name_en",     label: "영어 이름",                  placeholder: "예: My Brand" },
      { key: "aliases",     label: "별칭 (쉼표 구분)",           placeholder: "예: 내브랜드, mybrand" },
      { key: "key_color",   label: "주요 색상",                  placeholder: "예: blue, red" },
      { key: "definition",  label: "브랜드 정의",                textarea: true },
      { key: "image_hint",  label: "이미지 힌트",                textarea: true },
    ] : tab === "services" ? [
      { key: "entity_id",   label: "ID (영문, 언더스코어) *",  placeholder: "예: my_service" },
      { key: "name_kr",     label: "한국어 이름 *",             placeholder: "예: 내 서비스" },
      { key: "name_en",     label: "영어 이름",                  placeholder: "예: My Service" },
      { key: "aliases",     label: "별칭 (쉼표 구분)" },
      { key: "key_color",   label: "주요 색상" },
      { key: "definition",  label: "서비스 정의", textarea: true },
    ] : tab === "benefits" ? [
      { key: "entity_id",        label: "ID (영문, 언더스코어) *",    placeholder: "예: my_benefit" },
      { key: "name_kr",          label: "한국어 이름 *",              placeholder: "예: 마일리지" },
      { key: "name_en",          label: "영어 이름",                   placeholder: "예: Mileage" },
      { key: "trigger_keywords", label: "트리거 키워드 (쉼표 구분)",   placeholder: "예: 마일리지, 마일" },
      { key: "description",      label: "설명",                        textarea: true },
      { key: "icon_hint",        label: "아이콘 힌트" },
    ] : [
      { key: "entity_id",        label: "ID (영문, 언더스코어) *",    placeholder: "예: my_card" },
      { key: "brand_name",       label: "브랜드명 *",                  placeholder: "예: 내 카드" },
      { key: "category",         label: "카테고리" },
      { key: "trigger_keywords", label: "트리거 키워드 (쉼표 구분)" },
      { key: "key_color",        label: "주요 색상" },
      { key: "definition",       label: "정의", textarea: true },
    ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 md:left-[280px]">
      <div className="relative w-full max-w-lg rounded-[24px] border border-white/10 bg-[#141412] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
        >
          <X size={15} />
        </button>

        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">추가</p>
        <h2 className="mt-1 text-[20px] font-semibold text-white">{tabLabel} 항목 추가</h2>

        <div className="mt-5 flex flex-col gap-4">
          {/* 로고 업로드 (브랜드/서비스/삼성카드만) */}
          {LOGO_TABS.includes(tab) && (
            <div>
              <label className="mb-1.5 block text-[12px] text-[var(--text-secondary)]">로고 이미지</label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              {logoPreview ? (
                <div className="relative inline-flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="로고 미리보기"
                    className="h-16 w-16 rounded-xl object-contain bg-[#e8e8e6] p-1"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-[12px] text-white/70 max-w-[180px] truncate">{logoFile?.name}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="text-[11px] text-[var(--accent)] hover:underline"
                      >
                        변경
                      </button>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-[11px] text-white/40 hover:text-white/70"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-[13px] text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
                >
                  <ImagePlus size={16} />
                  로고 이미지 업로드
                </button>
              )}
            </div>
          )}
          {/* 텍스트 필드들 */}
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-[12px] text-[var(--text-secondary)]">{f.label}</label>
              {f.textarea ? (
                <textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={form[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white placeholder-white/25 outline-none focus:border-white/25"
                />
              ) : (
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={form[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white placeholder-white/25 outline-none focus:border-white/25"
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-400/10 px-3 py-2.5 text-[13px] text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/15 py-2.5 text-[14px] text-white/60 hover:text-white"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-full bg-[var(--accent)] py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {saving ? (logoFile ? "업로드 중..." : "저장 중...") : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EntitiesPage() {
  const [activeTab, setActiveTab] = useState<EntityType>("brands");
  const [items, setItems] = useState<EntityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<EntityItem | null>(null);

  const load = async (tab: EntityType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEntities(tab);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (item: EntityItem) => {
    if (!confirm(`'${item.name_kr || item.id}'를 삭제할까요?`)) return;
    try {
      await deleteEntity(activeTab, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const isBenefit = activeTab === "benefits";

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[#0B1016]">
        <div className="mx-auto max-w-[1420px] px-8 py-7">

          {/* 헤더 */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="text-[13px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                Entity Data
              </p>
              <h1 className="mt-3 text-[42px] font-semibold leading-none tracking-[-0.04em] text-white">
                브랜드 & 혜택 데이터
              </h1>
              <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
                이미지 생성에 사용되는 브랜드, 서비스, 혜택 데이터를 확인하고 항목을 추가합니다.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => load(activeTab)}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/80 transition-colors hover:text-white disabled:opacity-40"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                새로고침
              </button>
              <button className="rounded-full bg-[#E8E8E6] px-6 py-3 text-sm font-medium text-[#131313]">
                C2012531
              </button>
            </div>
          </div>

          {/* 탭 */}
          <div className="mb-7 flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-5 py-2 text-[14px] font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-[var(--accent)] text-white"
                    : "border border-white/15 text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 설명 */}
          <div className="mb-6 flex items-baseline gap-3">
            <p className="text-[15px] font-medium text-white">{currentTab.labelEn}</p>
            {!loading && (
              <p className="text-[13px] text-[var(--text-secondary)]">{items.length}개 항목</p>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-[20px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* 카드 그리드 */}
          {loading ? (
            <div className="grid grid-cols-3 gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[20px] border border-white/8 overflow-hidden">
                  <div className="animate-pulse bg-[#e8e8e6]/10" style={{ aspectRatio: "4/3" }} />
                  <div className="px-4 py-3 space-y-2">
                    <div className="h-3 w-20 rounded-full bg-white/8 animate-pulse" />
                    <div className="h-3 w-14 rounded-full bg-white/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-[var(--border)] bg-white/3 py-32 text-center">
              <p className="text-[var(--text-secondary)]">항목이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) =>
                isBenefit ? (
                  <BenefitCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelected(item)}
                  />
                ) : (
                  <EntityCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelected(item)}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-8 right-8 flex items-center gap-3 rounded-full bg-[var(--bg-card)] border border-white/15 px-6 py-3.5 text-[14px] font-medium text-white shadow-xl transition-all hover:bg-[var(--border)] hover:border-white/30 active:scale-95"
      >
        <Plus size={18} />
        추가하기
      </button>

      {/* 상세 모달 */}
      {selected && (
        <EntityDetailModal
          item={selected}
          tab={activeTab}
          onClose={() => setSelected(null)}
          onDelete={selected.source === "user" ? () => handleDelete(selected) : undefined}
        />
      )}

      {/* 추가 모달 */}
      {showAdd && (
        <AddModal
          tab={activeTab}
          onClose={() => setShowAdd(false)}
          onAdded={() => load(activeTab)}
        />
      )}
    </AppShell>
  );
}
