// app/layout.tsx
'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClaudeChat from "./components/ClaudeChat";
import { SessionProvider } from 'next-auth/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Portfolio | Full Stack Developer",
  description: "Professional portfolio website showcasing my skills and projects as a Full Stack Developer",
  keywords: "web developer, full stack, react, next.js, developer portfolio",
};

// Use a client component for the SessionProvider wrapper
function RootLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
      <ClaudeChat />
    </SessionProvider>
  );
}

// Keep the main layout as a server component for metadata
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-slate-100`}>
        <RootLayoutInner>{children}</RootLayoutInner>
      </body>
    </html>
  );
}