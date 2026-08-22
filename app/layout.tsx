import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingStartTrial } from "@/components/FloatingStartTrial";
import { SiteBackdrop } from "@/components/SiteBackdrop";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "Callvia | AI Receptionists for Small Businesses";
const DESCRIPTION =
  "Callvia answers your calls 24/7, captures leads, and sends you a clear summary. Never miss a customer again.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Callvia",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Callvia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

// viewportFit: "cover" is what makes env(safe-area-inset-*) resolve to real
// values on notched iPhones, which the floating CTA relies on to clear the
// home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-black text-white antialiased">
        <SiteBackdrop />
        {children}
        <FloatingStartTrial />
      </body>
    </html>
  );
}
