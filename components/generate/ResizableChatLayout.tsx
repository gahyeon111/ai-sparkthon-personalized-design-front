"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const STORAGE_KEY = "generate-chat-panel-width";
const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 560;

function readStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
  return DEFAULT_WIDTH;
}

interface Props {
  main: ReactNode;
  chat: ReactNode;
}

export default function ResizableChatLayout({ main, chat }: Props) {
  const [chatWidth, setChatWidth] = useState(DEFAULT_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    setChatWidth(readStoredWidth());
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = chatWidth;
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [chatWidth]
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const delta = startX.current - e.clientX;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
    setChatWidth(next);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setChatWidth((w) => {
      localStorage.setItem(STORAGE_KEY, String(w));
      return w;
    });
  }, []);

  return (
    <div ref={containerRef} className="flex h-full min-h-0 overflow-hidden">
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">{main}</div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="채팅 패널 너비 조절"
        aria-valuenow={chatWidth}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="group relative z-10 w-1.5 shrink-0 cursor-col-resize touch-none bg-transparent"
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--border)] transition-colors group-hover:bg-[var(--accent)] group-active:bg-[var(--accent)]" />
      </div>

      <div
        className="flex shrink-0 flex-col overflow-hidden bg-[var(--bg-main)]"
        style={{ width: chatWidth }}
      >
        {chat}
      </div>
    </div>
  );
}
