"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProgressSteps from "./ProgressSteps";
import CampaignInfo from "./CampaignInfo";
import ImageGrid from "./ImageGrid";
import ChatMessage from "./ChatMessage";
import ChatInput, { type AttachedImage } from "./ChatInput";
import {
  createChatSession,
  sendMessage,
  getImageStatus,
} from "@/lib/api";
import {
  chatStepToProgressIndex,
  CHANNEL_SIZES,
  type ChatStep,
  type ChannelType,
  type GeneratedImage,
  type Preset,
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

  // 이미지
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 수정 단계 벗어나면 이미지 선택 해제
  useEffect(() => {
    if (step !== "generating" && step !== "edit") {
      setSelectedImageId(null);
    }
  }, [step]);

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

  // 이미지 생성 폴링
  useEffect(() => {
    if (!campaignId) return;

    const poll = async () => {
      try {
        const status = await getImageStatus(campaignId);
        setImages(status.images);
        const done =
          status.campaign_status === "done" ||
          (status.total > 0 && status.completed === status.total);
        if (done) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          // 이미지 생성 완료 시 검수하기 버튼 메시지 삽입 (중복 방지)
          setMessages((prev) => {
            if (prev.some((m) => m.id === "img-done")) return prev;
            return [
              ...prev,
              {
                id: "img-done",
                role: "assistant",
                content:
                  "이미지 생성이 완료되었습니다! 이미지를 선택해서 수정하거나, 검수하기를 눌러주세요.",
                showFinalizeButton: true,
              },
            ];
          });
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
          selected_image_id: selectedImageId ?? undefined,
          reference_images: referenceImages,
        });

        setStep(res.step);
        if (res.campaign_id) setCampaignId((prev) => prev ?? res.campaign_id ?? null);

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
    [sessionId, isLoading, step, channel, selectedImageId]
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

  // 선택된 이미지 태그
  const selectedImageTag = images.find((i) => i.id === selectedImageId)?.tag;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── 좌측 패널 ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-[var(--border)]">
        {/* 헤더: 진행상태 */}
        <div className="px-6 pt-5 pb-4 border-b border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)] mb-4">진행상태</p>
          <ProgressSteps currentIndex={progressIndex} />
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
                  channel={channel}
                />
              </motion.div>
            )}

            {/* 이미지 그리드 */}
            {images.length > 0 && (
              <motion.div
                key="image-grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ImageGrid
                  images={images}
                  selectedImageId={selectedImageId}
                  onSelect={setSelectedImageId}
                  canSelect={step === "generating" || step === "edit"}
                />
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

      {/* ── 우측 채팅 패널 ── */}
      <div className="w-[360px] shrink-0 flex flex-col bg-[#13151f]">
        {/* 채팅 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
  );
}
