"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, RefreshCw, X } from "lucide-react";
import { getCampaignSimulation, getCampaigns, getImageStatus, type CampaignSummary } from "@/lib/api";
import type { CampaignSimulationResponse, GeneratedImage } from "@/lib/types";
import {
  AXIS1_TYPES,
  AXIS1_TYPE_MAP,
  formatCount,
  formatPercent,
  getAxis1Id,
  inferCampaignName,
  inferChannel,
  orderImagesByAxis1,
} from "@/lib/dashboard";

function StatCard({
  title,
  value,
  tone = "dark",
  description,
}: {
  title: string;
  value: string;
  tone?: "dark" | "blue" | "lime";
  description?: string;
}) {
  const toneMap = {
    dark: "bg-[#F3F3F0] text-[#131313]",
    blue: "bg-[#2F63F6] text-white",
    lime: "bg-[#D8FF3F] text-[#131313]",
  };
  const descToneMap = {
    dark: "text-[#131313]/50",
    blue: "text-white/60",
    lime: "text-[#131313]/50",
  };

  return (
    <div className={`rounded-[30px] px-5 py-6 sm:px-8 sm:py-8 ${toneMap[tone]}`}>
      <p className="text-[13px] font-semibold sm:text-[15px]">{title}</p>
      {description && (
        <p className={`mt-1.5 text-[10px] leading-5 sm:mt-2 sm:text-[11px] ${descToneMap[tone]}`}>{description}</p>
      )}
      <div className={description ? "mt-5 sm:mt-8" : "mt-8 sm:mt-14"}>
        <p className="whitespace-nowrap text-[32px] font-semibold leading-none tracking-[-0.04em] sm:text-[48px] md:text-[52px]">
          {value}
        </p>
      </div>
    </div>
  );
}

function CampaignInfoField({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`font-medium text-white ${valueClassName}`}>{value}</span>
    </div>
  );
}

function getImageAspectRatio(image: GeneratedImage | null) {
  const width = Number(image?.meta?.width);
  const height = Number(image?.meta?.height);
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return `${width} / ${height}`;
  }
  return "1 / 1";
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex min-w-[68px] justify-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
        status === "최고"
          ? "bg-[#2F63F6] text-white"
          : status === "양호"
            ? "bg-[#D8FF3F] text-[#1A1A18]"
            : status === "보통"
              ? "bg-black text-white"
              : "bg-[#8A8A8A] text-white"
      }`}
    >
      {status}
    </span>
  );
}

export default function CampaignDashboardDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [simulation, setSimulation] = useState<CampaignSimulationResponse | null>(null);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [simulationLoading, setSimulationLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(AXIS1_TYPES[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const loadCampaign = () => {
    setCampaignLoading(true);
    setError(null);
    getCampaigns()
      .then((items) => setCampaigns(items))
      .catch((e) => setError(String(e)))
      .finally(() => setCampaignLoading(false));
  };

  const loadSimulation = (force = false) => {
    if (!campaignId) return;
    setSimulationLoading(true);
    getCampaignSimulation(campaignId, { force })
      .then((response) => setSimulation(response))
      .catch((e) => setError(String(e)))
      .finally(() => setSimulationLoading(false));
  };

  useEffect(() => {
    loadCampaign();
  }, []);

  const campaign = useMemo(
    () => campaigns.find((item) => item.id === campaignId) ?? null,
    [campaignId, campaigns]
  );

  useEffect(() => {
    if (!campaignId) return;
    getImageStatus(campaignId)
      .then((response) => setImages(response.images))
      .catch(() => setImages([]))
      .finally(() => setImagesLoading(false));
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId || imagesLoading) return;

    const hasCompletedImages = images.some((image) => Boolean(image.image_url));
    if (!hasCompletedImages) {
      setSimulation(null);
      setSimulationLoading(false);
      return;
    }

    loadSimulation(false);
  }, [campaignId, images, imagesLoading]);

  const orderedImages = useMemo(() => orderImagesByAxis1(images), [images]);
  const matchingRows = useMemo(() => {
    const simulationRows = Object.fromEntries(
      (simulation?.rows ?? []).map((row) => [row.type_id, row])
    );
    return AXIS1_TYPES.map((type, index) => {
      const row = simulationRows[type.id];
      return {
        type,
        image: orderedImages.find((item) => getAxis1Id(item) === type.id) ?? orderedImages[index] ?? null,
        predictedClicks: row?.predicted_clicks ?? 0,
        audience: row?.audience ?? 0,
        ctr: row?.predicted_ctr ?? 0,
        status: row?.status ?? "낮음",
      };
    }).sort((a, b) => b.ctr - a.ctr);
  }, [orderedImages, simulation]);

  const selectedPersona = AXIS1_TYPE_MAP[selectedPersonaId] ?? AXIS1_TYPES[0];
  const campaignName = campaign ? inferCampaignName(campaign) : "-";
  const campaignChannel = campaign ? inferChannel(campaign) : "-";
  const targetCount = simulation?.audience_total ?? 0;
  const sentCustomers = formatCount(targetCount);
  const overallCtr = simulation ? formatPercent(simulation.overall_ctr * 100) : "-";
  const overallClicks = simulation ? formatCount(simulation.overall_clicks) : "-";
  const benchmarkCtr = simulation ? formatPercent(simulation.overall_ctr * 0.7 * 100) : "-";
  const daysElapsed = campaign
    ? Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / 86_400_000)
    : null;

  return (
    <div className="h-full overflow-y-auto bg-[#0B1016]">
      <div className="mx-auto max-w-[1420px] px-8 py-7">
        <div className="mb-10 flex items-start justify-between gap-3">
          <div>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                  return;
                }
                router.push("/dashboard");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-sm text-white/80 transition-colors hover:text-white sm:px-5 sm:py-3"
            >
              <ArrowLeft size={16} />
              뒤로가기
            </button>
            <p className="mt-6 text-[13px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Campaign Dashboard
            </p>
            <h1 className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[42px]">
              세부 캠페인 내용
            </h1>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-[24px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {campaignLoading ? (
          <div className="flex items-center justify-center py-32 text-[var(--text-secondary)]">
            <Loader2 size={20} className="mr-2 animate-spin" /> 로딩 중...
          </div>
        ) : !campaign ? (
          <div className="rounded-[32px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-8 py-24 text-center text-sm text-[var(--text-secondary)]">
            선택한 캠페인을 찾을 수 없습니다.
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="mb-5 text-[28px] font-semibold tracking-[-0.03em] text-white">캠페인 내용</h2>
              <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-[28px] bg-[#242424] px-6 py-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <CampaignInfoField
                      label="캠페인 ID"
                      value={campaign.id}
                      valueClassName="break-all text-[13px] leading-5"
                    />
                    <CampaignInfoField label="캠페인명" value={campaignName} />
                    <CampaignInfoField label="채널" value={campaignChannel} />
                    <CampaignInfoField label="생성일" value={campaign.created_at.slice(0, 10)} />
                    <CampaignInfoField label="대상" value={sentCustomers} />
                    <CampaignInfoField label="소재 크기" value={`${campaign.width} × ${campaign.height}`} />
                  </div>
                </div>
                <div className="rounded-[28px] bg-[#242424] px-6 py-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    <CampaignInfoField label="상태" value={campaign.status} />
                    <CampaignInfoField label="발송일" value={campaign.created_at.slice(0, 10)} />
                    <CampaignInfoField
                      label="대표 유형"
                      value={AXIS1_TYPE_MAP[getAxis1Id(orderedImages[0])]?.name ?? AXIS1_TYPES[0]?.name ?? "-"}
                    />
                  </div>
                </div>
              </div>

            </section>

            <section>
              <h2 className="mb-5 text-[28px] font-semibold tracking-[-0.03em] text-white">성과 리포트</h2>
              <div className="grid gap-4 xl:grid-cols-3">
                <StatCard title="발송 고객" value={sentCustomers} tone="dark" description="26년도 4월 기준 모니모 MAU" />
                <StatCard title="클릭 수" value={overallClicks} tone="lime" description={daysElapsed !== null ? `캠페인 실행 후 ${daysElapsed}일 경과` : undefined} />
                <StatCard title="전체 CTR" value={overallCtr} tone="blue" description={`공통 이미지 캠페인 진행 시 CTR 예상 ${benchmarkCtr}`} />
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
                <div className="order-2 rounded-[30px] bg-[#575757] px-5 py-5 text-white xl:order-1">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-[17px] font-semibold">이미지별 매칭 현황</h3>
                    <span className="text-xs text-white/65">
                      {simulationLoading ? "시뮬레이션 계산 중" : simulation?.simulation_version ?? "시뮬레이션"}
                    </span>
                  </div>
                  {/* 모바일 헤더 */}
                  <div className="grid grid-cols-[72px_1fr_64px] gap-3 border-b border-white/12 pb-3 text-[11px] text-white/65 md:hidden">
                    <span>유형</span>
                    <span>CTR</span>
                    <span>상태</span>
                  </div>
                  {/* PC 헤더 */}
                  <div className="hidden grid-cols-[88px_1.5fr_0.5fr_0.56fr] gap-3 border-b border-white/12 pb-3 text-[11px] text-white/65 md:grid">
                    <span>유형</span>
                    <span>고객군</span>
                    <span>CTR</span>
                    <span>상태</span>
                  </div>
                  <div className="mt-2 space-y-2.5">
                    {matchingRows.map((row) => (
                      <div
                        key={row.type.id}
                        className="grid grid-cols-[72px_1fr_64px] items-center gap-3 rounded-[20px] bg-black/10 px-4 py-3.5 md:grid-cols-[88px_1.5fr_0.5fr_0.56fr]"
                      >
                        <div className="inline-flex w-fit rounded-full border border-white/45 px-3.5 py-1.5 text-[18px] font-semibold">
                          {row.type.code}
                        </div>
                        <div className="hidden md:block">
                          <p className="text-[16px] font-medium leading-snug">{row.type.name}</p>
                          <p className="mt-0.5 text-[11px] text-white/65">{row.type.englishName}</p>
                        </div>
                        <p className="text-[16px] font-medium">{formatPercent(row.ctr * 100)}</p>
                        <div>
                          <StatusPill status={row.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-1 rounded-[30px] bg-[#F3F3F0] px-6 py-7 text-[#131313] md:px-8 md:py-8 xl:order-2">
                  <h3 className="text-[17px] font-semibold">고객별 특성</h3>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {AXIS1_TYPES.map((type) => {
                      const isSelected = selectedPersonaId === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedPersonaId(type.id)}
                          className={`min-w-[60px] rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                            isSelected
                              ? "border-[#2F63F6] bg-[#2F63F6] text-white shadow-[0_12px_30px_rgba(47,99,246,0.22)]"
                              : "border-[#3C3C3C] bg-white text-[#1A1A18]"
                          }`}
                        >
                          {type.code}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-col items-center text-center">
                    {selectedPersona?.profileImage ? (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedPersona.profileImage}
                          alt={selectedPersona.name}
                          className="h-[148px] w-[148px] rounded-full object-cover md:h-[186px] md:w-[186px]"
                        />
                      </div>
                    ) : null}

                    <p className="mt-4 text-[16px] font-semibold tracking-[-0.03em] text-[#111111] md:text-[21px]">
                      {selectedPersona ? `${selectedPersona.index + 1}. ${selectedPersona.displayName}` : ""}
                    </p>

                    <div className="mt-4 w-full rounded-[22px] bg-[#E3E0E0] px-4 py-4 text-left md:px-6 md:py-5">
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-[64px_1fr] items-start gap-3 md:grid-cols-[76px_1fr]">
                          <p className="text-[11px] font-semibold text-[#8A8A8A] md:text-[13px]">직업</p>
                          <p className="text-[12px] font-semibold text-[#111111] md:text-[15px]">
                            {selectedPersona?.occupation ?? "직장인"}
                          </p>
                        </div>
                        <div className="grid grid-cols-[64px_1fr] items-start gap-3 md:grid-cols-[76px_1fr]">
                          <p className="text-[11px] font-semibold text-[#8A8A8A] md:text-[13px]">나이</p>
                          <p className="text-[12px] font-semibold text-[#111111] md:text-[15px]">
                            {selectedPersona?.ageRange ?? "30대"}
                          </p>
                        </div>
                        <div className="grid grid-cols-[64px_1fr] items-start gap-3 md:grid-cols-[76px_1fr]">
                          <p className="text-[11px] font-semibold text-[#8A8A8A] md:text-[13px]">성별</p>
                          <p className="text-[12px] font-semibold text-[#111111] md:text-[15px]">
                            {selectedPersona?.gender ?? "여성"}
                          </p>
                        </div>
                        <div className="grid grid-cols-[64px_1fr] items-start gap-3 md:grid-cols-[76px_1fr]">
                          <p className="text-[11px] font-semibold text-[#8A8A8A] md:text-[13px]">특징</p>
                          <p className="text-[12px] font-semibold leading-[1.5] text-[#111111] md:text-[15px]">
                            {selectedPersona?.behaviors?.slice(0, 2).join(", ") ?? selectedPersona?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2F63F6] px-12 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(47,99,246,0.25)]"
                >
                  발송된 이미지 확인
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {isImageModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:left-[280px]">
          <div className="flex h-full items-center justify-center px-6 py-8 pb-24 sm:pb-8">
            <div className="max-h-full w-full max-w-[1420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#121922] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-7 py-5">
              <div>
                <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Sent Images
                </p>
                <h3 className="mt-2 text-[28px] font-semibold text-white">발송된 이미지 확인</h3>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white/80 transition-colors hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

              <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-7 py-6 pb-28 sm:pb-6" style={{ paddingBottom: 'max(7rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {AXIS1_TYPES.map((type) => {
                    const image = orderedImages.find((item) => getAxis1Id(item) === type.id) ?? null;
                    const status = matchingRows.find((row) => row.type.id === type.id)?.status ?? "보통";
                    return (
                      <div key={type.id} className="overflow-hidden rounded-[28px] border border-white/8 bg-[#1A2028]">
                        <div className="flex items-center justify-between px-5 py-4">
                          <div>
                            <p className="text-xs text-[var(--text-secondary)]">{type.code}</p>
                            <p className="mt-1 text-lg font-semibold text-white">{type.name}</p>
                          </div>
                          <StatusPill status={status} />
                        </div>
                        <div className="px-5 pb-5">
                          <div
                            className="relative overflow-hidden rounded-[22px] bg-white/6"
                            style={{ aspectRatio: getImageAspectRatio(image) }}
                          >
                            {image?.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image.image_url} alt={image.tag} className="h-full w-full object-cover" />
                            ) : imagesLoading ? (
                              <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)]">
                                <Loader2 size={18} className="animate-spin" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                                <p className="text-sm font-medium text-white/80">이미지 없음</p>
                                <p className="text-xs leading-5 text-[var(--text-secondary)]">
                                  해당 유형의 생성 이미지가 아직 저장되지 않았습니다.
                                </p>
                              </div>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-white/78">{type.englishName}</p>
                          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                            {type.visualDirection}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
