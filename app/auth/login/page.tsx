// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // In a real app, you would call your authentication API here
      // For demo purposes, we'll simulate login with mock users

      if (email === 'admin@example.com' && password === 'admin123') {
        // Admin login
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Admin User');
        localStorage.setItem('userEmail', email);
        router.push('/dashboard/admin');
      } else if (email === 'customer@example.com' && password === 'customer123') {
        // Customer login
        localStorage.setItem('userRole', 'customer');
        localStorage.setItem('userName', 'Customer User');
        localStorage.setItem('userEmail', email);
        router.push('/dashboard/customer');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
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
          <p className="text-sm text-slate-400 mb-2">For demo purposes:</p>
          <p className="text-xs text-slate-500">Admin: admin@example.com / admin123</p>
          <p className="text-xs text-slate-500">Customer: customer@example.com / customer123</p>
        </div>
      </motion.div>
    </div>
  );
}

