'use client';

import { SessionProvider } from 'next-auth/react';
import ClaudeChat from "./components/ClaudeChat";
import SessionBridge from './session-bridge';

// Client component that includes SessionProvider and SessionBridge
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* SessionBridge syncs NextAuth session to localStorage */}
      <SessionBridge />
      {children}
      <ClaudeChat />
    </SessionProvider>
  );
}