import type { Metadata } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: "600",
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mikhael Rodas | Telecom & Automation Portfolio",
  description:
    "Telecom operations professional building practical automation, AI, and software solutions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${cormorant.variable}`}>{children}</body>
    </html>
  );
}
