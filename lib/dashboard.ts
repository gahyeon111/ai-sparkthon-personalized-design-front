import type { GeneratedImage } from "./types";
import type { CampaignSummary } from "./api";

type Axis1SourceItem = {
  id: string;
  label: string;
  label_ko: string;
  description: string;
  visual_direction: string;
  color: {
    primary: string;
    accent: string;
    background: string;
  };
  image_direction: {
    copy_tone: string;
  };
  persona_signals: {
    occupation: string[];
    behavior: string[];
    age_range?: string;
  };
};

const AXIS1_SOURCE: Axis1SourceItem[] = [
  {
    id: "type_01",
    label: "Rational Saver",
    label_ko: "가성비추구형",
    description: "할인, 절약, 쿠폰, 가격 비교를 중시하는 실속형 고객.",
    visual_direction: "흰 배경 제품 클로즈업, 할인율과 숫자를 전면 배치한 실용적 구도",
    color: { primary: "#E24B4A", accent: "#EF9F27", background: "#FFFFFF" },
    image_direction: { copy_tone: "즉각적·실용적" },
    persona_signals: {
      occupation: ["배달원"],
      behavior: ["배달·분식·편의점 이용 빈도 높음", "가계부 작성", "쿠폰·적립 활용"],
    },
  },
  {
    id: "type_02",
    label: "Premium Seeker",
    label_ko: "프리미엄추구형",
    description: "브랜드 품격, 고급 소재, 희소성과 큐레이션된 경험을 선호하는 고객.",
    visual_direction: "여백 중심 미니멀 구도, 소재와 질감 배경 위에 제품을 작고 정제되게 배치",
    color: { primary: "#1A1A18", accent: "#B8945A", background: "#F5F3EF" },
    image_direction: { copy_tone: "품격·절제" },
    persona_signals: {
      occupation: ["의사"],
      behavior: ["오마카세·골프·에스테틱 정기 이용", "브랜드 충성도 높음", "건당 결제액 상위"],
    },
  },
  {
    id: "type_03",
    label: "Emotional Explorer",
    label_ko: "경험감성추구형",
    description: "감성, 힐링, 취향, 스토리텔링 경험을 중시하는 고객.",
    visual_direction: "사용 장면 라이프스타일 연출, 자연광과 여백이 살아 있는 스토리 중심 구도",
    color: { primary: "#D85A30", accent: "#C8A882", background: "#E8C9A0" },
    image_direction: { copy_tone: "스토리텔링·감성적" },
    persona_signals: {
      occupation: ["교육직"],
      behavior: ["사진 촬영·갤러리·전시 빈번 방문", "감성 카페·인테리어 관심", "다큐·에세이 소비 多"],
    },
  },
  {
    id: "type_04",
    label: "Trend Chaser",
    label_ko: "트렌드민감형",
    description: "SNS, 숏폼, 팝업, 굿즈, 한정성에 민감한 트렌드형 고객.",
    visual_direction: "비대칭 구도와 텍스트 이펙트, 숏폼·밈 감성이 느껴지는 임팩트 중심 레이아웃",
    color: { primary: "#7F77DD", accent: "#D4537E", background: "#EEEDFE" },
    image_direction: { copy_tone: "캐주얼·긴급·공감형" },
    persona_signals: {
      occupation: ["학생"],
      age_range: "19~34세",
      behavior: ["팝업스토어·핫플 방문", "SNS·숏폼 활발히 이용", "K-pop 덕질·굿즈 구매"],
    },
  },
  {
    id: "type_05",
    label: "Trust Seeker",
    label_ko: "안전신뢰추구형",
    description: "검증된 정보, 보장, 리뷰, 안정성을 중시하는 신뢰형 고객.",
    visual_direction: "정보 밀도 높은 레이아웃, 리뷰 수치와 인증마크가 명확히 보이는 신뢰형 구성",
    color: { primary: "#185FA5", accent: "#E6F1FB", background: "#FFFFFF" },
    image_direction: { copy_tone: "수치 기반·신뢰형" },
    persona_signals: {
      occupation: ["사무직"],
      behavior: ["보험·저축·적금 관심", "규칙적·꼼꼼·체계 중시", "동일 가맹점 반복 이용"],
    },
  },
  {
    id: "type_06",
    label: "Gift Connector",
    label_ko: "관계선물중심형",
    description: "선물, 감사, 관계, 나눔의 맥락에 반응하는 고객.",
    visual_direction: "포장·리본·박스 연출, 따뜻한 실내 배경과 관계 중심 분위기가 느껴지는 구도",
    color: { primary: "#D4537E", accent: "#F4C0D1", background: "#E8C9A0" },
    image_direction: { copy_tone: "따뜻함·관계 중심" },
    persona_signals: {
      occupation: ["서비스직"],
      behavior: ["선물·나눔·기부 직접 언급", "명절·기념일 결제 급증", "타인 배송지 결제 비중 높음"],
    },
  },
];

export const AXIS1_TYPES = AXIS1_SOURCE.map((value, index) => ({
  index,
  id: value.id,
  code: `#${index + 1}`,
  name: value.label_ko,
  englishName: value.label,
  description: value.description,
  visualDirection: value.visual_direction,
  color: value.color.primary,
  accent: value.color.accent,
  background: value.color.background,
  copyTone: value.image_direction.copy_tone,
  ageRange: value.persona_signals.age_range ?? "30대",
  occupation: value.persona_signals.occupation[0] ?? "직장인",
  behaviors: value.persona_signals.behavior,
}));

export const AXIS1_TYPE_MAP = Object.fromEntries(
  AXIS1_TYPES.map((item) => [item.id, item])
);

const MOCK_CHANNELS = ["이벤트 배너", "메인 배너", "로그인 팝업"];

export function inferCampaignName(campaign: CampaignSummary) {
  const text = campaign.campaign_text.trim();
  const firstLine = text.split("\n")[0]?.trim() ?? "";
  return firstLine.length > 36 ? `${firstLine.slice(0, 36)}...` : firstLine || "캠페인";
}

export function inferChannel(campaign: CampaignSummary) {
  const size = `${campaign.width}x${campaign.height}`;
  if (size === "1024x720") return "메인 배너";
  if (size === "960x960") return "이벤트 배너";
  if (size === "1024x960") return "로그인 팝업";
  const hash = hashString(campaign.id);
  return MOCK_CHANNELS[hash % MOCK_CHANNELS.length];
}

export function formatCount(value: number) {
  return `${value.toLocaleString("ko-KR")}명`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function orderImagesByAxis1(images: GeneratedImage[]) {
  return [...images].sort((a, b) => {
    const aIndex = AXIS1_TYPES.findIndex((item) => item.id === getAxis1Id(a));
    const bIndex = AXIS1_TYPES.findIndex((item) => item.id === getAxis1Id(b));
    return normalizeIndex(aIndex) - normalizeIndex(bIndex);
  });
}

export function getAxis1Id(image: GeneratedImage | null | undefined) {
  const axis1 = image?.meta?.axis1;
  return typeof axis1 === "string" ? axis1 : "";
}

function normalizeIndex(index: number) {
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
