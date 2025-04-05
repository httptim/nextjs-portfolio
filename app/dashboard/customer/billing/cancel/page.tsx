// app/dashboard/customer/billing/cancel/page.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PayPalCancelPage() {
  return (
    <div className="py-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-4">
              <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Payment Cancelled</h2>
            <p className="text-slate-300 text-center mb-6">
              Your payment process has been cancelled. No charges have been made to your account.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/dashboard/customer/billing"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
              >
                Return to Billing
              </Link>
              <Link
                href="/dashboard/customer"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}