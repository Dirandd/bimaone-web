import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/ui/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIMAONE",
  description: "Kelola data master Brand dan Gudang BIMAONE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Sidebar di kiri, isi halaman di kanan */}
      <body className="flex min-h-full">
        <AppSidebar />
        {/* min-w-0 supaya tabel lebar tidak mendorong sidebar */}
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}