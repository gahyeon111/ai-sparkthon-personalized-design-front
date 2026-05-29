"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { API_BASE_URL, getApiHeaders } from "@/lib/api";

const FEATURE_ITEMS = [
  {
    title: "캠페인 자동 분석",
    description: "LLM이 혜택/브랜드/타깃을 알아서 파악해요",
    logo: "/home-feature-1-logo.png",
  },
  {
    title: "개인화 이미지 생성",
    description: "3개의 축을 바탕으로 다양한 이미지를 생성해요",
    logo: "/home-feature-2-logo.png",
  },
  {
    title: "고객 자동 매칭",
    description: "페르소나 기반 개인화 이미지를 배정해요",
    logo: "/home-feature-3-logo.png",
  },
];

const STATS_FALLBACK = [
  { value: "247", label: "생성된 캠페인" },
  { value: "38%", label: "평균 CTR" },
  { value: "2.3분", label: "평균 생성 시간" },
];

function AnimatedOrb() {
  return (
    <div className="relative flex h-[210px] w-[210px] items-center justify-center sm:h-[240px] sm:w-[240px]">
      <div className="home-orb-pulse absolute inset-[10%] rounded-full bg-[radial-gradient(circle,_rgba(19,100,254,0.2)_0%,_rgba(19,100,254,0.1)_34%,_rgba(19,100,254,0)_74%)] blur-3xl" />
      <motion.div
        className="absolute inset-[11%] bg-[radial-gradient(circle_at_30%_30%,_rgba(150,210,255,0.58),_rgba(55,125,255,0.34)_28%,_rgba(10,26,61,0.06)_62%,_rgba(10,26,61,0)_76%)] blur-[2px]"
        animate={{
          rotate: [0, 12, -10, 0],
          scale: [1, 1.05, 0.97, 1],
          borderRadius: [
            "58% 42% 55% 45% / 40% 58% 42% 60%",
            "42% 58% 40% 60% / 55% 38% 62% 45%",
            "60% 40% 52% 48% / 46% 60% 40% 54%",
            "58% 42% 55% 45% / 40% 58% 42% 60%",
          ],
        }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[18%] border border-[#8ec8ff]/24 bg-[radial-gradient(circle_at_65%_35%,_rgba(123,190,255,0.14),_rgba(12,32,72,0.05)_44%,_rgba(12,32,72,0)_76%)] shadow-[inset_0_0_22px_rgba(120,182,255,0.12),0_0_24px_rgba(19,100,254,0.08)] backdrop-blur-[1px]"
        animate={{
          rotate: [0, -14, 10, 0],
          scale: [0.98, 1.03, 1, 0.98],
          borderRadius: [
            "44% 56% 48% 52% / 57% 43% 57% 43%",
            "57% 43% 60% 40% / 45% 61% 39% 55%",
            "46% 54% 42% 58% / 60% 44% 56% 40%",
            "44% 56% 48% 52% / 57% 43% 57% 43%",
          ],
        }}
        transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[16%] opacity-90 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 120deg, rgba(19,100,254,0) 0deg, rgba(124,195,255,0.58) 45deg, rgba(19,100,254,0.02) 110deg, rgba(124,195,255,0.46) 190deg, rgba(19,100,254,0) 260deg, rgba(124,195,255,0.58) 330deg, rgba(19,100,254,0) 360deg)",
          filter: "blur(7px)",
        }}
        animate={{
          rotate: [0, 120, 240, 360],
          scale: [1, 1.08, 0.96, 1],
          borderRadius: [
            "63% 37% 56% 44% / 42% 63% 37% 58%",
            "40% 60% 38% 62% / 57% 40% 60% 43%",
            "58% 42% 60% 40% / 45% 58% 42% 55%",
            "63% 37% 56% 44% / 42% 63% 37% 58%",
          ],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[24%] border border-white/7 bg-[radial-gradient(circle_at_48%_42%,_rgba(20,63,140,0.12)_0%,_rgba(8,18,36,0.18)_44%,_rgba(4,10,20,0.02)_72%,_rgba(4,10,20,0)_100%)] shadow-[inset_0_0_22px_rgba(19,100,254,0.12)]"
        animate={{
          borderRadius: [
            "52% 48% 54% 46% / 45% 56% 44% 55%",
            "45% 55% 43% 57% / 58% 42% 58% 42%",
            "57% 43% 59% 41% / 44% 58% 42% 56%",
            "52% 48% 54% 46% / 45% 56% 44% 55%",
          ],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-[31%] rounded-full bg-[var(--bg-primary)]/96 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" />
      <motion.span
        className="absolute left-[16%] top-[26%] h-2.5 w-2.5 rounded-full bg-[#a3d3ff] shadow-[0_0_14px_rgba(163,211,255,0.9)]"
        animate={{ y: [-6, 12, -5], x: [0, 12, -2, 0], opacity: [0.65, 1, 0.72] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute bottom-[20%] right-[18%] h-2 w-2 rounded-full bg-[#58a5ff] shadow-[0_0_12px_rgba(88,165,255,0.85)]"
        animate={{ y: [9, -12, 6], x: [0, -8, -2, 0], opacity: [0.62, 1, 0.68] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState(STATS_FALLBACK);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats`, {
      headers: getApiHeaders(),
    })
      .then((r) => r.json())
      .then((data) => {
        setStats([
          { value: String(data.campaign_count ?? 247), label: "생성된 캠페인" },
          {
            value: data.avg_ctr != null ? `${data.avg_ctr}%` : "38%",
            label: "평균 CTR",
          },
          {
            value: data.avg_generation_time_minutes != null ? `${data.avg_generation_time_minutes}분` : "2.3분",
            label: "평균 생성 시간",
          },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden overflow-y-auto bg-[var(--bg-primary)] text-white sm:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,55,110,0.22),_transparent_34%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 pb-10 pt-6 sm:px-10 sm:pb-12 sm:pt-8 lg:px-12">
        <header className="flex items-start justify-between">
          <Image
            src="/gen-ai-designer-logo.png"
            alt="GEN AI DESIGNER"
            width={471}
            height={174}
            className="h-auto w-[120px] sm:w-[200px] lg:w-[230px]"
            priority
          />
          <div />
        </header>

        <section className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-start pt-4 text-center sm:justify-center sm:pb-6 sm:pt-10">
          <div className="max-sm:scale-75 max-sm:origin-center">
            <AnimatedOrb />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-4 sm:mt-8"
          >
            <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-white sm:text-[34px]">
              AI 이미지 자동 생성 시스템
            </h1>
            <p className="mx-auto mt-2 max-w-[620px] text-[13px] leading-6 text-white/70 sm:mt-2.5 sm:text-[16px] sm:leading-7">
              캠페인을 입력하시면 고객 개인화된 이미지를 자동으로 만들어 드려요.
            </p>
          </motion.div>

          <Link
            href="/generate"
            className="mt-5 inline-flex w-full max-w-[220px] items-center justify-center gap-2 rounded-full border border-[#d9ff52]/40 bg-[var(--accent-lime)] px-4 py-2 shadow-[0_18px_40px_rgba(198,252,32,0.18)] transition-transform duration-200 hover:scale-[1.01] hover:shadow-[0_24px_50px_rgba(198,252,32,0.22)] sm:mt-8 sm:max-w-[360px] sm:py-2.5"
          >
            <Image
              src="/home-start-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-5 w-5 sm:h-7 sm:w-7"
              priority
            />
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#0b1118] sm:text-[21px]">
              시작하기
            </span>
          </Link>

          <div className="mt-6 grid w-full max-w-[320px] gap-2.5 sm:mt-12 sm:max-w-none sm:gap-3 lg:grid-cols-3">
            {FEATURE_ITEMS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.2, duration: 0.5, ease: "easeOut" }}
                className="rounded-[20px] border border-[#2c6cff]/35 bg-transparent px-5 py-4 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] sm:rounded-[24px] sm:px-6 sm:py-6"
              >
                <div className="flex items-center justify-center gap-3 sm:flex-col sm:gap-0">
                  <Image src={item.logo} alt="" width={48} height={48} className="h-8 w-8 sm:h-10 sm:w-10" />
                  <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-white sm:mt-4 sm:text-[24px]">
                    {item.title}
                  </h2>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-[12px] leading-5 text-white/68 sm:mt-2.5 sm:text-[15px] sm:leading-6">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>

          <div className="mt-10 flex w-full max-w-[640px] flex-row items-center justify-center gap-0 sm:mt-12 sm:flex-row">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-1 flex-col items-center px-3 text-center sm:min-w-[150px] sm:flex-none sm:px-6 ${
                  index < stats.length - 1 ? "border-r border-white/24" : ""
                }`}
              >
                <span className="text-[24px] font-light tracking-[-0.05em] text-white sm:text-[42px]">
                  {stat.value}
                </span>
                <span className="mt-1 text-[11px] text-white/62 sm:mt-1.5 sm:text-[14px]">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
