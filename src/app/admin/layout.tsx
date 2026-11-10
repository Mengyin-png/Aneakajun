import type { Metadata } from "next";
import { Nanum_Gothic, Noto_Sans_Khmer } from "next/font/google";
import "../globals.css";

const nanum = Nanum_Gothic({
  variable: "--font-nanum",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});
const khmer = Noto_Sans_Khmer({
  variable: "--font-khmer",
  subsets: ["khmer"],
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Aneakajun Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nanum.variable} ${khmer.variable}`}>
      <body className="min-h-dvh bg-canvas">{children}</body>
    </html>
  );
}
