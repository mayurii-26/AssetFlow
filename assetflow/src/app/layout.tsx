import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AssetFlow | Cinematic Asset Intelligence",
  description:
    "Enterprise asset management platform. Manage every asset, track every resource, automate every workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#1c1b1b",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e5e2e1",
            },
          }}
        />
      </body>
    </html>
  );
}
