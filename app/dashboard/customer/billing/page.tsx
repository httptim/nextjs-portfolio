// app/dashboard/customer/billing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  project: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  last4?: string;
  expiry?: string;
  name: string;
  isDefault: boolean;
}

export default function CustomerBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch billing data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch invoices
        const invoicesResponse = await fetch('/api/invoices/customer');
        
        if (!invoicesResponse.ok) {
          throw new Error('Failed to fetch invoices');
        }
        
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices);
        
        // Fetch payment methods
        const paymentMethodsResponse = await fetch('/api/payment-methods');
        
        if (paymentMethodsResponse.ok) {
          const paymentMethodsData = await paymentMethodsResponse.json();
          setPaymentMethods(paymentMethodsData.paymentMethods);
        }
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching billing data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handlePayNow = async (invoiceId: string) => {
    try {
      // In a real app, this would redirect to a payment page or open a payment modal
      alert(`This would redirect to payment processing for invoice ${invoiceId}`);
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Failed to process payment. Please try again.');
    }
  };

  const handleAddPaymentMethod = () => {
    // In a real app, this would open a modal to add a new payment method
    alert('This would open a form to add a new payment method');
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${methodId}/default`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
      
      // Update local state
      setPaymentMethods(currentMethods => 
        currentMethods.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      );
    } catch (err) {
      console.error('Error setting default payment method:', err);
      alert('Failed to set default payment method. Please try again.');
    }
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/payment-methods/${methodId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }
      
      // Update local state
      setPaymentMethods(currentMethods => 
        currentMethods.filter(method => method.id !== methodId)
      );
    } catch (err) {
      console.error('Error removing payment method:', err);
      alert('Failed to remove payment method. Please try again.');
    }
  };

  const getTotalUnpaid = () => {
    return invoices
      .filter(invoice => invoice.status === 'UNPAID' || invoice.status === 'OVERDUE')
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-500/20 text-green-500';
      case 'UNPAID':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'OVERDUE':
        return 'bg-red-500/20 text-red-500';
      case 'CANCELLED':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'paypal':
        return (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'bank_transfer':
        return (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-500/20 text-red-500 p-4 rounded-md">
            {error}
            <button 
              className="ml-2 underline"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">Billing</h1>
        <p className="mt-1 text-sm text-slate-300">Manage your invoices and payment methods</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-sky-500/20 text-sky-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Total Invoices</h3>
                <p className="text-2xl font-semibold text-white">{invoices.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-yellow-500/20 text-yellow-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Unpaid Amount</h3>
                <p className="text-2xl font-semibold text-white">${getTotalUnpaid().toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-green-500/20 text-green-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Last Payment</h3>
                <p className="text-2xl font-semibold text-white">
                  {invoices.filter(inv => inv.status === 'PAID').length > 0 ? 
                    `$${Math.max(...invoices
                      .filter(inv => inv.status === 'PAID')
                      .map(inv => inv.amount)
                    ).toFixed(2)}` : 
                    'No payments'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Invoices */}
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-6">Invoices</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-slate-750"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{invoice.number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{invoice.project}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{formatDate(invoice.date)}</div>
                          <div className="text-xs text-slate-400">Due: {formatDate(invoice.dueDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">${invoice.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="text-sky-400 hover:text-sky-300 mr-3"
                          >
                            View
                          </button>
                          {(invoice.status === 'UNPAID' || invoice.status === 'OVERDUE') && (
                            <button 
                              onClick={() => handlePayNow(invoice.id)}
                              className="text-green-400 hover:text-green-300"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-white">Payment Methods</h2>
              <button 
                onClick={handleAddPaymentMethod}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-sm transition-colors"
              >
                Add Payment Method
              </button>
            </div>
            
            <div className="space-y-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  No payment methods added yet.
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-750 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-slate-700 rounded-md text-slate-300">
                        {getPaymentMethodIcon(method.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{method.name}</div>
                        {method.expiry && (
                          <div className="text-xs text-slate-400">Expires: {method.expiry}</div>
                        )}
                        {method.isDefault && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/20 text-sky-400">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          className="text-sky-400 hover:text-sky-300 text-sm"
                        >
                          Set as Default
                        </button>
                      )}
                      <button 
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-white">
                  Invoice {selectedInvoice.number}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-slate-750 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Invoice Date</h4>
                    <p className="text-sm text-white">{formatDate(selectedInvoice.date)}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Due Date</h4>
                    <p className="text-sm text-white">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Status</h4>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status.charAt(0) + selectedInvoice.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-3">Invoice Items</h4>
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-750 divide-y divide-slate-700">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          ${item.rate.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-700">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-slate-300">
                        Total
                      </td>
                      <td className="px-6 py-3 text-left text-sm font-medium text-white">
                        ${selectedInvoice.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                {(selectedInvoice.status === 'UNPAID' || selectedInvoice.status === 'OVERDUE') && (
                  <button 
                    onClick={() => handlePayNow(selectedInvoice.id)}
                    className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                  >
                    Pay Now
                  </button>
                )}
                <button className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors">
                  Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}