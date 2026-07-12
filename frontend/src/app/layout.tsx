import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              theme="system"
              toastOptions={{
                classNames: {
                  toast:
                    "dark:bg-[#1c1b1b] dark:border-white/10 dark:text-[#e5e2e1] bg-white border-black/10 text-zinc-900",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
