import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

// 1. Setup Font (Tetap pertahankan ini)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Best practice untuk performa loading font
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// 2. Konfigurasi Viewport (WAJIB untuk PWA & Mobile UX)
// Memisahkan konfigurasi tampilan mobile dari metadata
export const viewport: Viewport = {
  themeColor: "#000000", // Sesuaikan dengan brand color Anda
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Membuat aplikasi terasa seperti Native App (tidak bisa di-zoom)
};

// 3. Konfigurasi Metadata Profesional
export const metadata: Metadata = {
  title: {
    template: "%s | Project HRM", // Judul dinamis: "Dashboard | Project HRM"
    default: "Project HRM - Sistem Manajemen SDM",
  },
  description: "Aplikasi ERP dan HRM terpadu untuk efisiensi manajemen karyawan.",
  manifest: "/manifest.json", // Link ke file manifest PWA
  icons: {
    icon: "/icon/icon-192x192.png", // Ganti dengan path logo Anda
    apple: "/icon/icon-192x192.png", // Ikon khusus iOS
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Project HRM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Validasi Safety: Cek apakah Client ID ada agar tidak crash silent
  if (!googleClientId) {
    console.error("⚠️ Google Client ID belum diset di .env");
  }

  return (
    // Ubah lang ke "id" karena target user Indonesia
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* Wrapper Provider */}
        <GoogleOAuthProvider clientId={googleClientId!}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}