import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GEN AI DESIGNER",
  description: "삼성카드 AI 배너 생성 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
