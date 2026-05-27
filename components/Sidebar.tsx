"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  {
    label: "이미지 생성하기",
    href: "/generate",
    activeIcon: "/nav-generate-active.png",
    inactiveIcon: "/nav-generate-inactive.png",
  },
  {
    label: "캠페인 현황",
    href: "/dashboard",
    activeIcon: "/nav-dashboard-active.png",
    inactiveIcon: "/nav-dashboard-inactive.png",
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
          width={220}
          height={85}
          className="h-auto w-[150px]"
          priority
        />
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-1 flex-col gap-1 px-4 py-3">
        {NAV_ITEMS.map((item) => {
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
                  <Image
                    src={isActive ? item.activeIcon : item.inactiveIcon}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 shrink-0 object-contain"
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
