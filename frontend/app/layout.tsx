import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientProviders from "@/components/providers/ClientProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

// 1. Setup Font dengan optimasi
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true, // Tambahkan ini untuk preload font
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// 2. Konfigurasi Viewport untuk PWA & Mobile
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Ubah dari 1 ke 5 untuk accessibility (WCAG requirement)
  userScalable: true, // Ubah ke true untuk accessibility
  viewportFit: "cover", // Tambahkan untuk iPhone X+ notch handling
};

// 3. Metadata SEO & PWA
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"),
  title: {
    template: "%s | Project HRM",
    default: "Project HRM - Sistem Manajemen SDM",
  },
  description: "Aplikasi ERP dan HRM terpadu untuk efisiensi manajemen karyawan.",
  applicationName: "Project HRM",
  authors: [{ name: "Your Company Name" }], // Tambahkan nama perusahaan
  keywords: ["HRM", "ERP", "Manajemen Karyawan", "SDM", "Payroll"], // SEO keywords

  // PWA Manifest
  manifest: "/manifest.json",

  // Icons dengan multiple sizes
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Lebih modern dari "default"
    title: "Project HRM",
  },

  // Format Detection (Disable auto-formatting untuk nomor)
  formatDetection: {
    telephone: false, // Disable auto-link untuk nomor telepon
    email: false,
    address: false,
  },

  // OpenGraph untuk sharing di social media (Optional tapi recommended)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://yourapp.com", // Ganti dengan URL production
    siteName: "Project HRM",
    title: "Project HRM - Sistem Manajemen SDM",
    description: "Aplikasi ERP dan HRM terpadu untuk efisiensi manajemen karyawan.",
    images: [
      {
        url: "/og-image.png", // Tambahkan gambar untuk social sharing
        width: 1200,
        height: 630,
        alt: "Project HRM",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Safety check untuk development
  if (process.env.NODE_ENV === 'development' && !googleClientId) {
    console.warn("⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diset di .env.local");
  }

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className="h-full" // Tambahkan untuk full height
    >
      <head>
        {/* Preconnect ke Google Fonts untuk performa lebih baik */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full`}
      >
        {/* Provider wrapper */}
        <ErrorBoundary>
          <ClientProviders googleClientId={googleClientId}>
            {children}
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}