// app/dashboard/admin/billing/create-invoice.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string | null;
}

interface Project {
  id: string;
  name: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceFormData {
  customerId: string;
  projectId: string;
  dueDate: string;
  items: InvoiceItem[];
}

interface CreateInvoiceProps {
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
}

export default function CreateInvoice({ onClose, onSuccess }: CreateInvoiceProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: '',
    projectId: '',
    dueDate: '',
    items: [
      { id: `item-${Date.now()}`, description: '', quantity: 1, rate: 0 }
    ],
  });

  // Fetch customers and projects on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch customers
        const customersRes = await fetch('/api/customers');
        if (!customersRes.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customersData = await customersRes.json();
        setCustomers(customersData.customers);
        
        // Fetch all projects
        const projectsRes = await fetch('/api/projects');
        if (!projectsRes.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects);
        
        // Set default due date to 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        setFormData(prev => ({
          ...prev,
          dueDate: thirtyDaysFromNow.toISOString().split('T')[0]
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load necessary data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter projects when customer changes
  useEffect(() => {
    if (formData.customerId) {
      const customerProjects = projects.filter(project => 
        project.clientId === formData.customerId
      );
      setFilteredProjects(customerProjects);
      
      // Reset project selection if the current project doesn't belong to the selected customer
      if (formData.projectId) {
        const projectBelongsToCustomer = customerProjects.some(p => p.id === formData.projectId);
        if (!projectBelongsToCustomer) {
          setFormData(prev => ({ ...prev, projectId: '' }));
        }
      }
    } else {
      setFilteredProjects([]);
    }
  }, [formData.customerId, projects]);

  // Add new invoice item
  const addInvoiceItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: `item-${Date.now()}`, description: '', quantity: 1, rate: 0 }]
    }));
  };

  // Remove invoice item
  const removeInvoiceItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  // Update invoice item
  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Calculate total
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formData.customerId) {
      setError('Please select a customer');
      return;
    }
    
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }
    
    if (!formData.dueDate) {
      setError('Please select a due date');
      return;
    }
    
    const hasInvalidItems = formData.items.some(item => 
      !item.description.trim() || item.quantity <= 0 || item.rate <= 0
    );
    
    if (hasInvalidItems) {
      setError('Please fill in all invoice items with valid quantities and rates');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Create invoice
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.customerId,
          projectId: formData.projectId,
          dueDate: formData.dueDate,
          items: formData.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate
          }))
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const data = await response.json();
      onSuccess(data.id);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80">
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-3xl w-full">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Invoice</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 text-red-500 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          {/* Customer and Project Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-slate-300 mb-1">
                Customer
              </label>
              <select
                id="customer"
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company ? `(${customer.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-slate-300 mb-1">
                Project
              </label>
              <select
                id="project"
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={!formData.customerId || filteredProjects.length === 0}
              >
                <option value="">Select a project</option>
                {filteredProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {formData.customerId && filteredProjects.length === 0 && (
                <p className="mt-1 text-xs text-yellow-500">
                  No projects found for this customer.
                </p>
              )}
            </div>
          </div>
          
          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-white">Invoice Items</h3>
              <button
                onClick={addInvoiceItem}
                className="px-2 py-1 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-md transition-colors"
              >
                Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Rate"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value))}
                        className="w-full pl-7 px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-white">${(item.quantity * item.rate).toFixed(2)}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeInvoiceItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <div className="w-48">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-300">Total:</span>
                  <span className="font-medium text-white">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}