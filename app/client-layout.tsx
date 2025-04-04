'use client';

import { SessionProvider } from 'next-auth/react';
import ClaudeChat from "./components/ClaudeChat";

// Client component that includes SessionProvider
export default function ClientLayout({
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