// app/dashboard/customer/billing/success/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PayPalSuccessPage() {
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the PayPal order ID from the URL
  const orderId = searchParams.get('token');
  
  useEffect(() => {
    if (!orderId) {
      setProcessing(false);
      setError('No order ID found. The payment may not have been processed.');
      return;
    }
    
    const capturePayment = async () => {
      try {
        const response = await fetch('/api/payments/paypal/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process payment');
        }
        
        setSuccess(true);
      } catch (error) {
        console.error('Error capturing payment:', error);
        setError(error instanceof Error ? error.message : 'Failed to process payment');
      } finally {
        setProcessing(false);
      }
    };
    
    capturePayment();
  }, [orderId]);
  
  // Redirect to billing page after 5 seconds on success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard/customer/billing');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, router]);
  
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
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500 mb-4"></div>
                <h2 className="text-xl font-semibold text-white mb-2">Processing Your Payment</h2>
                <p className="text-slate-300 text-center">
                  Please wait while we confirm your payment with PayPal...
                </p>
              </>
            ) : success ? (
              <>
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Payment Successful!</h2>
                <p className="text-slate-300 text-center mb-6">
                  Your payment has been processed successfully. Thank you for your payment!
                </p>
                <p className="text-slate-400 text-sm mb-4">
                  You will be redirected to your billing page in a few seconds...
                </p>
                <Link
                  href="/dashboard/customer/billing"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
                >
                  Return to Billing
                </Link>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Payment Error</h2>
                <p className="text-slate-300 text-center mb-6">
                  {error || 'There was an error processing your payment. Please try again or contact support.'}
                </p>
                <div className="flex space-x-4">
                  <Link
                    href="/dashboard/customer/billing"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                  >
                    Return to Billing
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}