import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const alteHaasGrotesk = localFont({
  src: [
    {
      path: "../../fonts/alte-haas-grotesk/AlteHaasGroteskRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/alte-haas-grotesk/AlteHaasGroteskBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-alte-haas-grotesk",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "You Took Your Time",
  description: "Fashion",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://youtookyourtime.com",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${alteHaasGrotesk.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
