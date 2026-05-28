"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Database, Images, LayoutDashboard, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "이미지 생성하기",
    href: "/generate",
    icon: Sparkles,
  },
  {
    label: "이미지 갤러리",
    href: "/gallery",
    icon: Images,
  },
  {
    label: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "브랜드 & 혜택 데이터",
    href: "/entities",
    icon: Database,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-primary)]">
      {/* 로고 */}
      <div className="px-5 py-6">
        <Image
          src="/gen-ai-designer-logo.png"
          alt="GEN AI DESIGNER"
          width={471}
          height={174}
          className="h-auto w-[170px]"
          priority
        />
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-1 flex-col gap-1 px-4 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-[var(--accent)]/15"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 block rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "text-[var(--accent-lime)]"
                    : "text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className={`shrink-0 ${isActive ? "text-[var(--accent-lime)]" : "text-white"}`}
                  />
                  <span>{item.label}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
