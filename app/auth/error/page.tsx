import { Suspense } from 'react';
import AuthErrorContent from './auth-error-content';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}