// app/dashboard/admin/billing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CreateInvoice from './create-invoice';

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  customer: {
    id: string;
    name: string;
    email: string;
  };
  project: string;
}

interface BillingStats {
  totalRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
}

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    outstandingAmount: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load billing data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be API calls
        const invoicesResponse = await fetch('/api/invoices');
        if (!invoicesResponse.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices);
        
        // Calculate billing stats
        const totalRevenue = invoicesData.invoices
          .filter((invoice: Invoice) => invoice.status === 'PAID')
          .reduce((total: number, invoice: Invoice) => total + invoice.amount, 0);
        
        const outstandingAmount = invoicesData.invoices
          .filter((invoice: Invoice) => invoice.status !== 'PAID')
          .reduce((total: number, invoice: Invoice) => total + invoice.amount, 0);
        
        const paidInvoices = invoicesData.invoices.filter((invoice: Invoice) => invoice.status === 'PAID').length;
        const unpaidInvoices = invoicesData.invoices.filter((invoice: Invoice) => invoice.status === 'UNPAID').length;
        const overdueInvoices = invoicesData.invoices.filter((invoice: Invoice) => invoice.status === 'OVERDUE').length;
        
        setStats({
          totalRevenue,
          outstandingAmount,
          paidInvoices,
          unpaidInvoices,
          overdueInvoices,
        });
      } catch (error) {
        console.error('Error loading billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  const handleCreateInvoice = () => {
    setIsCreateModalOpen(true);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    setIsCreateModalOpen(false);
    setRefreshTrigger(prev => prev + 1); // Trigger a refresh of the invoice list
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}/mark-paid`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark invoice as paid');
      }
      
      // Update the invoices list
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice.id === id 
            ? { ...invoice, status: 'PAID' } 
            : invoice
        )
      );
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        paidInvoices: prevStats.paidInvoices + 1,
        unpaidInvoices: invoice.status === 'UNPAID' ? prevStats.unpaidInvoices - 1 : prevStats.unpaidInvoices,
        overdueInvoices: invoice.status === 'OVERDUE' ? prevStats.overdueInvoices - 1 : prevStats.overdueInvoices,
        totalRevenue: prevStats.totalRevenue + (invoice.status !== 'PAID' ? invoice.amount : 0),
        outstandingAmount: prevStats.outstandingAmount - (invoice.status !== 'PAID' ? invoice.amount : 0),
      }));
      
      // If the currently selected invoice is being marked as paid, update it
      if (selectedInvoice?.id === id) {
        setSelectedInvoice({ ...selectedInvoice, status: 'PAID' });
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark invoice as paid. Please try again.');
    }
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
        return 'bg-slate-500/20 text-slate-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  // Filter and search invoices
  const filteredInvoices = invoices
    .filter(invoice => filter === 'all' || invoice.status.toLowerCase() === filter)
    .filter(invoice => 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">Billing</h1>
        <p className="mt-1 text-sm text-slate-300">Manage invoices and payments</p>
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
              <div className="p-3 rounded-md bg-green-500/20 text-green-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Total Revenue</h3>
                <p className="text-2xl font-semibold text-white">${stats.totalRevenue.toFixed(2)}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Outstanding Amount</h3>
                <p className="text-2xl font-semibold text-white">${stats.outstandingAmount.toFixed(2)}</p>
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
              <div className="p-3 rounded-md bg-sky-500/20 text-sky-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-300">Invoice Status</h3>
                <div className="flex space-x-2 mt-1">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-md text-xs">
                    {stats.paidInvoices} Paid
                  </span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-md text-xs">
                    {stats.unpaidInvoices} Unpaid
                  </span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-md text-xs">
                    {stats.overdueInvoices} Overdue
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Invoices */}
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <h2 className="text-lg font-medium text-white">Invoices</h2>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-2 block w-full bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
                  />
                </div>
                
                <button
                  onClick={handleCreateInvoice}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            </div>
            
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === 'all' 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Invoices
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === 'paid' 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === 'unpaid' 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Unpaid
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === 'overdue' 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Overdue
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Customer
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
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                        No invoices found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
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
                          <div className="text-sm text-white">{invoice.customer.name}</div>
                          <div className="text-xs text-slate-400">{invoice.customer.email}</div>
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
                          {invoice.status !== 'PAID' && (
                            <button
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className="text-green-400 hover:text-green-300 mr-3"
                            >
                              Mark as Paid
                            </button>
                          )}
                          <button
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Customer</h4>
                    <p className="text-sm text-white">{selectedInvoice.customer.name}</p>
                    <p className="text-xs text-slate-400">{selectedInvoice.customer.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Project</h4>
                    <p className="text-sm text-white">{selectedInvoice.project}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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

                <div className="mt-4">
                  <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Amount</h4>
                  <p className="text-lg font-medium text-white">${selectedInvoice.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                {selectedInvoice.status !== 'PAID' && (
                  <button
                    onClick={() => {
                      handleMarkAsPaid(selectedInvoice.id);
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
                <button className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
                  Send to Customer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <CreateInvoice 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={handleInvoiceCreated} 
        />
      )}
    </div>
  );
}