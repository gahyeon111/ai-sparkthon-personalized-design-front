"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "이미지 생성하기", href: "/generate" },
  { label: "프로젝트 관리", href: "/projects" },
  { label: "이미지 갤러리", href: "/gallery" },
  { label: "대시보드", href: "/dashboard" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-primary)]">
      {/* 로고 */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-8 h-8 shrink-0">
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <path
              d="M16 2L4 9v14l12 7 12-7V9L16 2z"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path d="M16 2v28M4 9l12 7 12-7" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold tracking-widest text-white">GEN AI</p>
          <p className="text-xs font-bold tracking-widest text-white">
            DESIGNER
          </p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
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
                  className="absolute inset-0 rounded-lg bg-[var(--accent)]/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
