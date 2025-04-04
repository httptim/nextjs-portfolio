'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle query parameters
  useEffect(() => {
    const registered = searchParams.get('registered');
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl');
    
    if (registered === 'true') {
      setSuccessMessage('Registration successful! Please log in with your new account.');
    }
    
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setError('Invalid email or password. Please try again.');
          break;
        default:
          setError('An error occurred during sign in. Please try again.');
          break;
      }
    }
    
    // If user was trying to access a protected page, show a message
    if (callbackUrl && callbackUrl !== window.location.origin) {
      setError('Please log in to access that page');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!result?.ok) {
        throw new Error(result?.error || 'Login failed. Please check your credentials.');
      }

      // Get the user's role from the session and redirect accordingly
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/customer');
        }
      } catch (sessionError) {
        console.error('Error fetching session:', sessionError);
        // Default fallback if session fetch fails
        router.push('/dashboard/customer');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-slate-800 rounded-xl shadow-xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
          <p className="text-slate-300">Welcome back! Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 text-red-500 rounded-md text-center text-sm">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-3 bg-green-500/20 text-green-500 rounded-md text-center text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-sky-400 hover:text-sky-300">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-300">
            New client?{' '}
            <Link href="/auth/register" className="text-sky-400 hover:text-sky-300">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400 mb-2">Demo accounts:</p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('admin123');
              }}
              className="text-xs text-sky-400 hover:text-sky-300 py-1 px-2 rounded hover:bg-slate-700 transition-colors"
            >
              Admin: admin@example.com / admin123
            </button>
            <button 
              onClick={() => {
                setEmail('customer@example.com');
                setPassword('customer123');
              }}
              className="text-xs text-sky-400 hover:text-sky-300 py-1 px-2 rounded hover:bg-slate-700 transition-colors"
            >
              Customer: customer@example.com / customer123
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}