"use client";

import type { ReactNode } from "react";

const DEFAULT_WIDTH = 400;

interface Props {
  main: ReactNode;
  chat: ReactNode;
}

export default function ResizableChatLayout({ main, chat }: Props) {
  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">{main}</div>

      <div
        className="flex shrink-0 flex-col overflow-hidden bg-[var(--bg-main)]"
        style={{ width: DEFAULT_WIDTH }}
      >
        {chat}
      </div>
    </div>
  );
}
