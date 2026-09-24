import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "レシピ管理",
  description: "みんなで使えるレシピ管理アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-orange-50">
        <header className="sticky top-0 z-10 bg-white border-b border-orange-100 shadow-sm">
          <div className="mx-auto max-w-3xl px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
            <Link href="/" className="text-base sm:text-lg font-bold text-orange-600 shrink-0">
              🍳 レシピ管理
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/shopping-list"
                className="rounded-full border border-orange-300 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors whitespace-nowrap"
              >
                🛒 買い出しリスト
              </Link>
              <Link
                href="/recipes/new"
                className="rounded-full bg-orange-500 px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                ＋ 新規追加
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
