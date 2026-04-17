import type { Metadata, Viewport } from "next";
import { DM_Sans, Bebas_Neue } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppShell } from "@/components/navigation/AppShell";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap", weight: ["400", "500", "600", "700"] });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], display: "swap", weight: "400" });

export const metadata: Metadata = {
  title: "Tourney",
  description: "Volleyball tournament manager",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tourney",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bebas.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          <SessionProvider>
            <AppShell>{children}</AppShell>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
