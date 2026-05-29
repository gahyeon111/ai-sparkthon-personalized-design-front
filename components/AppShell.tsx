"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Images, LayoutDashboard, Sparkles } from "lucide-react";
import Sidebar from "./Sidebar";

const NAV_ITEMS = [
  { label: "생성", href: "/generate", icon: Sparkles },
  { label: "갤러리", href: "/gallery", icon: Images },
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "데이터", href: "/entities", icon: Database },
];

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-[var(--border)] bg-[var(--bg-primary)] sm:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
          >
            <Icon
              size={22}
              strokeWidth={2}
              className={isActive ? "text-[var(--accent-lime)]" : "text-white/40"}
            />
            <span className={`text-[10px] ${isActive ? "text-[var(--accent-lime)]" : "text-white/40"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden bg-[var(--bg-primary)]">
      <div className="hidden sm:contents">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-hidden pb-16 sm:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
