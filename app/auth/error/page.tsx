'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      switch (error) {
        case 'Configuration':
          setErrorMessage('There is a problem with the server configuration. Please contact support.');
          break;
        case 'CredentialsSignin':
          setErrorMessage('Invalid email or password. Please try again.');
          break;
        case 'AccessDenied':
          setErrorMessage('You do not have permission to access this resource.');
          break;
        default:
          setErrorMessage(`An error occurred: ${error}`);
      }
    } else {
      setErrorMessage('An unknown error occurred');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-slate-800 rounded-xl shadow-xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Authentication Error</h2>
          <div className="mt-4 p-3 bg-red-500/20 text-red-400 rounded-md">
            {errorMessage}
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="inline-block px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}