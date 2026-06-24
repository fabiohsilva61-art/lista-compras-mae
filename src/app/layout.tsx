import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { PWARegister } from "@/components/pwa-register";
import { StoreInitializer } from "@/components/store-initializer";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Controle de Compras",
  description: "Controle inteligente de compras domésticas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Compras",
  },
};

export const viewport: Viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <AuthProvider>
          <PWARegister />
          <StoreInitializer />
          <Sidebar />
          <MobileNav />
          <main className="lg:pl-72">
            <div className="mx-auto max-w-2xl pt-20 pb-8 lg:pt-4">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
