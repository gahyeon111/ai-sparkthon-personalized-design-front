"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProgressSteps from "./ProgressSteps";
import CampaignInfo from "./CampaignInfo";
import ChannelInfo from "./ChannelInfo";
import PresetCombinations from "./PresetCombinations";
import RecommendedCopies from "./RecommendedCopies";
import ImageGrid from "./ImageGrid";
import ChatMessage from "./ChatMessage";
import ChatInput, { type AttachedImage } from "./ChatInput";
import ResizableChatLayout from "./ResizableChatLayout";
import {
  createChatSession,
  getCopyRecommendations,
  sendMessage,
  getImageStatus,
  resolveImageUrl,
} from "@/lib/api";
import {
  chatStepToProgressIndex,
  CHANNEL_SIZES,
  type ChatStep,
  type ChannelType,
  type GeneratedImage,
  type Preset,
  type RecommendedCopy,
} from "@/lib/types";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  presets?: Preset[];
  showFinalizeButton?: boolean;
  channelOptions?: string[];
  quick_replies?: string[];
}

const INIT_MESSAGE: DisplayMessage = {
  id: "init",
  role: "assistant",
  content: "캠페인 내용(문구)을 입력해주세요.",
};

export default function GeneratePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<ChatStep>("init");
  const [messages, setMessages] = useState<DisplayMessage[]>([INIT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 캠페인 정보
  const [campaignText, setCampaignText] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [presetCombinations, setPresetCombinations] = useState<Preset[]>([]);
  const [recommendedCopies, setRecommendedCopies] = useState<RecommendedCopy[]>([]);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState<string>("draft");
  const [generationProgress, setGenerationProgress] = useState({ completed: 0, total: 0 });

  // 이미지
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  // 이미지 선택·편집은 모든 이미지가 완전히 완료된 이후에만 가능
  const canSelectImage = campaignStatus === "done";
  const activeSelectedImageId = canSelectImage ? selectedImageId : null;

  const [editPollTs, setEditPollTs] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 채팅 스크롤 하단 고정
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 세션 초기화
  useEffect(() => {
    (async () => {
      try {
        const { session_id } = await createChatSession();
        setSessionId(session_id);
      } catch (e) {
        console.error("세션 생성 실패", e);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  // 이미지 생성 폴링 — 각 이미지가 완료될 때마다 즉시 표시, 전체 완료 시 편집 활성화
  useEffect(() => {
    if (!campaignId) return;

    const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10분 안전 타임아웃
    const startedAt = Date.now();

    const stop = (newStatus?: string) => {
      clearInterval(pollRef.current!);
      pollRef.current = null;
      if (newStatus) setCampaignStatus(newStatus);
      setMessages((prev) => {
        if (prev.some((m) => m.id === "img-done")) return prev;
        return [
          ...prev,
          {
            id: "img-done",
            role: "assistant",
            content:
              newStatus === "failed"
                ? "일부 이미지 생성에 실패했습니다. 완료된 이미지를 확인해 주세요."
                : "이미지 생성이 완료되었습니다! 이미지를 선택해서 수정하거나, 검수하기를 눌러주세요.",
            showFinalizeButton: newStatus !== "failed",
          },
        ];
      });
    };

    const poll = async () => {
      // 안전 타임아웃
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stop("failed");
        return;
      }
      try {
        const status = await getImageStatus(campaignId);
        setCampaignStatus(status.campaign_status);
        setGenerationProgress({ completed: status.completed, total: status.total });
        // 완료된 이미지부터 즉시 반영
        setImages(
          status.images.map((img) => ({
            ...img,
            image_url: img.image_url ? resolveImageUrl(img.image_url) : img.image_url,
          }))
        );

        if (status.campaign_status === "done" || status.campaign_status === "failed") {
          stop(status.campaign_status);
        }
      } catch (e) {
        console.error("이미지 상태 조회 실패", e);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [campaignId]);

  // 편집 완료 폴링 — edit_started 플래그가 세팅되면 3초마다 이미지 상태를 새로고침
  useEffect(() => {
    if (!editPollTs || !campaignId) return;
    const TIMEOUT = 5 * 60 * 1000;
    const startedAt = Date.now();
    const poll = async () => {
      if (Date.now() - startedAt > TIMEOUT) return;
      try {
        const status = await getImageStatus(campaignId);
        setImages(
          status.images.map((img) => ({
            ...img,
            image_url: img.image_url ? resolveImageUrl(img.image_url) : img.image_url,
          }))
        );
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [editPollTs, campaignId]);

  useEffect(() => {
    if (!campaignText || presetCombinations.length === 0) return;

    let cancelled = false;

    (async () => {
      try {
        setIsCopyLoading(true);
        const response = await getCopyRecommendations({
          campaign_text: campaignText,
          confirmed_presets: presetCombinations,
        });
        if (!cancelled) {
          setRecommendedCopies(response.items);
        }
      } catch (error) {
        console.error("추천 문구 생성 실패", error);
        if (!cancelled) {
          setRecommendedCopies([]);
        }
      } finally {
        if (!cancelled) {
          setIsCopyLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignText, presetCombinations]);

  // 채팅 메시지 전송
  const handleSend = useCallback(
    async (message: string, attachments?: AttachedImage[]) => {
      if (!sessionId || isLoading) return;

      // 첨부 파일을 표시용 텍스트로 변환
      const attachmentLabel =
        attachments && attachments.length > 0
          ? ` [이미지 ${attachments.length}개 첨부]`
          : "";

      const userMsg: DisplayMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: message + attachmentLabel,
      };
      const loadingMsg: DisplayMessage = {
        id: `l-${Date.now()}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      // 첫 메시지이면 캠페인 문구로 저장
      if (step === "init") {
        setCampaignText(message);
      }

      // 채널 감지
      const channelKeys = Object.keys(CHANNEL_SIZES) as ChannelType[];
      const detectedChannel = channelKeys.find((c) => message.includes(c));
      const activeChannel = detectedChannel ?? channel;
      if (detectedChannel) setChannel(detectedChannel);

      const size = activeChannel ? CHANNEL_SIZES[activeChannel] : { width: 1024, height: 1024 };

      // 첨부 이미지 → reference_images 형식으로 변환 (filename 기반)
      const referenceImages = attachments?.map((att) => ({
        filename: att.file.name,
        usage_type: att.usage_type,
      }));

      try {
        const res = await sendMessage(sessionId, {
          message,
          width: size.width,
          height: size.height,
          batch_size: 1,
          selected_image_id: activeSelectedImageId ?? undefined,
          reference_images: referenceImages,
        });

        setStep(res.step);
        if (res.edit_started) {
          setEditPollTs(Date.now());
        }
        if (res.campaign_id) setCampaignId((prev) => prev ?? res.campaign_id ?? null);
        if (res.presets?.length) {
          setPresetCombinations(res.presets);
          setRecommendedCopies([]);
        }

        // 수정 단계 응답에만 검수하기 버튼 표시 (generating 초기 메시지에는 미표시)
        const showReviewButton = res.step === "edit";

        const assistantMsg: DisplayMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: res.reply,
          presets: res.presets,
          showFinalizeButton: showReviewButton,
          channelOptions: res.channel_options,
          quick_replies: res.quick_replies,
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingMsg.id),
          assistantMsg,
        ]);
      } catch (e) {
        console.error("메시지 전송 실패", e);
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== loadingMsg.id),
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "오류가 발생했습니다. 다시 시도해주세요.",
          },
        ]);
      } finally {
        setIsLoading(false);
        setSelectedImageId(null);
      }
    },
    [sessionId, isLoading, step, channel, activeSelectedImageId]
  );

  // 검수하기 버튼 → 채팅으로 "검수하기" 메시지 전송
  const handleFinalize = useCallback(() => {
    handleSend("검수하기");
  }, [handleSend]);

  // 채널 버튼 클릭 → 채널명을 메시지로 전송 (w/h는 CHANNEL_SIZES에서 결정)
  const handleChannelSelect = useCallback(
    (channelName: string) => {
      const size = CHANNEL_SIZES[channelName as keyof typeof CHANNEL_SIZES];
      if (size) setChannel(channelName as keyof typeof CHANNEL_SIZES);
      handleSend(channelName);
    },
    [handleSend]
  );

  const progressIndex = chatStepToProgressIndex(step);

  const showImageSection =
    images.length > 0 ||
    step === "resolving" ||
    step === "generating" ||
    step === "preset_confirm" ||
    step === "edit" ||
    campaignStatus === "processing" ||
    campaignStatus === "done";

  const imageGridLoading =
    step === "resolving" ||
    step === "generating" ||
    campaignStatus === "processing";

  const imageIdleMessage =
    step === "preset_confirm" && images.length === 0
      ? "이미지 조합을 확정한 뒤 바로 생성을 시작합니다."
      : undefined;

  // 선택된 이미지 태그
  const selectedImageTag = images.find((i) => i.id === activeSelectedImageId)?.tag;

  return (
    <ResizableChatLayout
      main={
        <div className="flex h-full flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--bg-main)]">
        {/* 헤더: 진행상태 */}
        <div className="border-b border-[var(--border)] px-7 pb-5 pt-8">
          <div className="flex items-center gap-8">
            <p className="shrink-0 text-[13px] font-medium text-[var(--text-secondary)]">
              진행상태
            </p>
            <ProgressSteps currentIndex={progressIndex} />
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5 text-[13px]">
          <AnimatePresence>
            {/* 캠페인 정보 - campaign_id가 생기는 순간(INIT 응답)부터 표시 */}
            {(campaignId || campaignText || channel) && (
              <motion.div
                key="campaign-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CampaignInfo
                  campaignId={campaignId}
                  campaignText={campaignText}
                />
              </motion.div>
            )}

            {channel && (
              <motion.div
                key="channel-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ChannelInfo channel={channel} />
              </motion.div>
            )}

            {presetCombinations.length > 0 && (
              <motion.div
                key="preset-combinations"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PresetCombinations presets={presetCombinations} />
              </motion.div>
            )}

            {/* 이미지 그리드 */}
            {showImageSection && (
              <motion.div
                key="image-grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ImageGrid
                  images={images}
                  selectedImageId={activeSelectedImageId}
                  onSelect={setSelectedImageId}
                  canSelect={canSelectImage}
                  isLoading={imageGridLoading}
                  idleMessage={imageIdleMessage}
                  loadingLabel={
                    step === "resolving"
                      ? "캠페인 분석과 이미지 조합을 준비 중입니다..."
                      : "이미지를 생성하고 있습니다..."
                  }
                  completed={generationProgress.completed}
                  total={generationProgress.total}
                />
              </motion.div>
            )}

            {(recommendedCopies.length > 0 || isCopyLoading) && (
              <motion.div
                key="recommended-copies"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <RecommendedCopies items={recommendedCopies} isLoading={isCopyLoading} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 로딩 (초기화) */}
          {isInitializing && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[var(--text-secondary)]">
                로딩 중...
              </p>
            </div>
          )}
        </div>
      </div>
      }
      chat={
      <div className="flex h-full min-h-0 flex-col px-4 pt-5 pb-3">
        <div className="mb-2 flex shrink-0 justify-end">
          <span className="rounded-full bg-[#ebebea] px-3.5 py-1 text-[13px] font-medium text-[#2d2d2b]">
            C2012531
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-[#091018] px-4 pt-3 pb-3">
          <div className="shrink-0 px-2 pb-2">
            <h2 className="text-[13px] font-semibold text-[var(--accent-lime)]">AI Agent 에게 요청</h2>
          </div>

          {/* 채팅 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 bg-transparent">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                presets={msg.presets}
                showFinalizeButton={msg.showFinalizeButton}
                onFinalize={handleFinalize}
                isLoading={msg.id.startsWith("l-") && isLoading}
                channelOptions={msg.channelOptions}
                onQuickReply={handleChannelSelect}
                quick_replies={msg.quick_replies}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <ChatInput
            onSend={handleSend}
            disabled={isLoading || isInitializing || step === "done"}
            placeholder={
              step === "init"
                ? "캠페인 문구를 입력하세요..."
                : step === "resolving"
                ? "답변을 입력하세요..."
                : step === "ref_image_query"
                ? "참조 이미지를 첨부하거나 '바로 생성'을 입력하세요..."
                : selectedImageId
                ? "수정 요청을 입력하세요..."
                : "메시지를 입력하세요..."
            }
            selectedImageTag={selectedImageTag}
          />
        </div>
      </div>
      }
    />
  );
}
