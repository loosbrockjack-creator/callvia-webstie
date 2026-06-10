import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Callvia — AI Receptionists for Small Businesses",
  description:
    "Callvia answers your calls 24/7, captures leads, and sends you a clear summary. Never miss a customer again.",
  openGraph: {
    title: "Callvia — AI Receptionists for Small Businesses",
    description:
      "Callvia answers your calls 24/7, captures leads, and sends you a clear summary.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
