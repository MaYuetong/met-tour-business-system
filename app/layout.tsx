import type { Metadata } from "next";
import { Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  weight: ["200", "300", "400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

const notoSansSC = Noto_Sans_SC({
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "大都会艺术博物馆 · 欧洲艺术史私人导览",
  description:
    "3.5 小时深度游览欧洲艺术史，含拉斐尔特展。从古罗马到印象派，在大都会艺术博物馆开启一段珍贵的文化之旅。",
  openGraph: {
    title: "大都会艺术博物馆 · 欧洲艺术史私人导览",
    description: "3.5 小时，从古罗马到印象派，含拉斐尔特展",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSerifSC.variable} ${notoSansSC.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
