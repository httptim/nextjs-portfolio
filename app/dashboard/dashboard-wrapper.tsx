'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLoading() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // If the user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);
  
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full shadow-xl">
        <div className="flex flex-col items-center">
          <svg 
            className="animate-spin h-12 w-12 text-sky-500 mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">
            {status === 'loading' 
              ? 'Loading Dashboard...' 
              : status === 'authenticated' 
                ? `Welcome, ${session?.user?.name || 'User'}!` 
                : 'Checking authentication...'}
          </h2>
          <p className="text-slate-300 text-center">
            {status === 'loading' 
              ? 'Preparing your dashboard...' 
              : status === 'authenticated' 
                ? 'Setting up your personalized dashboard...' 
                : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    </div>
  );
}