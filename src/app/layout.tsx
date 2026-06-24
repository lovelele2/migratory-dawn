import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Migratory Dawn / 候鸟逐日",
  description: "一个安静的日出窗口，带着真实来源标注和由鸟送达的信件。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#070707] text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
