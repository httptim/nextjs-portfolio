'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreateUserInput } from '@/lib/services/user-service';

export default function RegisterForm() {
  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to login page on success
      router.push('/auth/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
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
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-300">Sign up to become a client</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 text-red-500 rounded-md text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">
              Company Name (Optional)
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Create a password (min. 8 characters)"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-slate-300">
              I agree to the{' '}
              <a href="#" className="text-sky-400 hover:text-sky-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-sky-400 hover:text-sky-300">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-medium transition-colors mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-300">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-sky-400 hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}