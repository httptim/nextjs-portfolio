'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// --- Interfaces --- //

interface User {
  id: string;
  name: string;
  email: string;
  company?: string | null;
}

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  clientId: string;
  client?: User | { name: string, company?: string | null }; // Allow partial client info on fetch
  position?: string | null;
  company?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialFormData {
  id?: string; // Present when editing
  content: string;
  rating: string; // Use string for form input
  clientId: string;
  position: string;
  company: string;
  isActive: boolean;
  order: string; // Use string for form input
}

const initialTestimonialForm: TestimonialFormData = {
  content: '',
  rating: '5',
  clientId: '',
  position: '',
  company: '',
  isActive: true,
  order: '0',
};

// --- Component --- //

export default function HomepageEditorPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);
  const [customersError, setCustomersError] = useState<string | null>(null);
  
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialDeleting, setTestimonialDeleting] = useState<string | null>(null); // Store ID being deleted

  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialFormData>(initialTestimonialForm);
  const [formError, setFormError] = useState<string | null>(null);

  // --- Data Fetching --- //

  const fetchTestimonials = useCallback(async () => {
    setTestimonialsLoading(true);
    setTestimonialsError(null);
    try {
      // Fetch ALL testimonials for admin? Let's assume GET /api/testimonials 
      // needs adjustment or we need a different endpoint for admin.
      // For now, fetching potentially only active ones:
      const response = await fetch('/api/testimonials'); 
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const data = await response.json();
      // Sort testimonials by order number
      setTestimonials((data.testimonials || []).sort((a: Testimonial, b: Testimonial) => a.order - b.order));
    } catch (err) {
      console.error(err);
      setTestimonialsError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setTestimonialsLoading(false);
    }
  }, []);
  
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
        const response = await fetch('/api/customers?limit=1000'); // Fetch customers for dropdown
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(data.customers);
    } catch (err) {
        console.error(err);
        setCustomersError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
        setCustomersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
    fetchCustomers();
  }, [fetchTestimonials, fetchCustomers]); // Updated dependencies

  // --- Event Handlers --- //

  const handleTestimonialFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setTestimonialForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setFormError(null);
    setTestimonialForm({
        id: testimonial.id,
        content: testimonial.content,
        rating: String(testimonial.rating),
        clientId: testimonial.clientId,
        position: testimonial.position || '',
        company: testimonial.company || '',
        isActive: testimonial.isActive,
        order: String(testimonial.order),
    });
    setShowTestimonialForm(true);
    window.scrollTo({ top: document.getElementById('testimonial-form-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleAddNewTestimonial = () => {
    setFormError(null);
    setTestimonialForm(initialTestimonialForm);
    setShowTestimonialForm(true);
     window.scrollTo({ top: document.getElementById('testimonial-form-section')?.offsetTop || 0, behavior: 'smooth' });
  };
  
  const handleCancelTestimonialForm = () => {
      setShowTestimonialForm(false);
      setTestimonialForm(initialTestimonialForm);
      setFormError(null);
  }

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialSaving(true);
    setFormError(null);

    const { id, ...formData } = testimonialForm;
    const url = id ? `/api/testimonials/${id}` : '/api/testimonials';
    const method = id ? 'PUT' : 'POST';

    // Basic validation
    if (!formData.content.trim() || !formData.clientId) {
        setFormError('Content and Client selection are required.');
        setTestimonialSaving(false);
        return;
    }
    
    const payload = {
        ...formData,
        rating: parseInt(formData.rating, 10),
        order: parseInt(formData.order, 10),
    };

    try {
      const response = await fetch(url, {
        method: method,
        // Ensure proper auth header (e.g., using session or including credentials)
        headers: { 'Content-Type': 'application/json', 'credentials': 'include' }, 
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Failed to ${id ? 'update' : 'create'} testimonial`);
      }
      
      // Refresh testimonials list and close form
      await fetchTestimonials(); 
      handleCancelTestimonialForm();

    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setTestimonialSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    setTestimonialDeleting(id);
    setTestimonialsError(null); // Clear previous errors
    try {
        const response = await fetch(`/api/testimonials/${id}`, {
            method: 'DELETE',
            // Ensure proper auth header/credentials
            headers: { 'credentials': 'include' }, 
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || 'Failed to delete testimonial');
        }
        // Refresh list after delete
        setTestimonials(prev => prev.filter(t => t.id !== id)); 
    } catch (err) {
        console.error(err);
        setTestimonialsError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
        setTestimonialDeleting(null);
    }
  };

  // --- Render Functions --- //

  const renderLoading = (section: string) => (
    <div className="p-4 text-center text-slate-400">Loading {section}...</div>
  );

  const renderError = (error: string | null, section: string) => (
    error && <div className="p-4 bg-red-500/20 text-red-400 rounded-md mb-4">Error loading {section}: {error}</div>
  );

  // --- Main Render --- //

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Homepage Content (Testimonials)</h1>
      <p className="text-slate-400 mb-8 -mt-6">Manage testimonials displayed on the public homepage. Manage projects via the Content page.</p>

      {/* --- Testimonials Section --- */} 
      <section id="testimonial-management" className="mb-12 bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Testimonials</h2>
            <motion.button 
                onClick={handleAddNewTestimonial}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md font-medium transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={showTestimonialForm} // Disable if form is already open
            >
                Add New Testimonial
            </motion.button>
        </div>

        {testimonialsLoading && renderLoading('testimonials')}
        {renderError(testimonialsError, 'testimonials')}
        
        {/* Testimonial Add/Edit Form */} 
        {showTestimonialForm && (
          <motion.form 
            id="testimonial-form-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveTestimonial}
            className="mb-8 p-6 border border-slate-600 rounded-md space-y-4 bg-slate-750"
          >
            <h3 className="text-xl font-medium mb-4">{testimonialForm.id ? 'Edit' : 'Add'} Testimonial</h3>
            {renderError(formError, 'form')}
            
            <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-slate-300 mb-1">Client/Customer*</label>
                {customersLoading && <div className="text-xs text-slate-400">Loading customers...</div>}
                {renderError(customersError, 'customers')}
                <select 
                    id="clientId"
                    name="clientId"
                    value={testimonialForm.clientId}
                    onChange={handleTestimonialFormChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                    disabled={customersLoading || !!customersError}
                >
                    <option value="" disabled>-- Select a Customer --</option>
                    {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email}) {customer.company ? `- ${customer.company}` : ''}
                        </option>
                    ))}
                </select>
            </div>
            
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">Quote/Content*</label>
                <textarea 
                  id="content" 
                  name="content"
                  rows={4}
                  value={testimonialForm.content}
                  onChange={handleTestimonialFormChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-slate-300 mb-1">Rating (1-5)*</label>
                    <input 
                      type="number" 
                      id="rating" 
                      name="rating"
                      min="1" max="5"
                      value={testimonialForm.rating}
                      onChange={handleTestimonialFormChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <div>
                    <label htmlFor="position" className="block text-sm font-medium text-slate-300 mb-1">Client Position (Optional)</label>
                    <input 
                      type="text" 
                      id="position" 
                      name="position"
                      value={testimonialForm.position}
                      onChange={handleTestimonialFormChange}
                      className="w-full px-3 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                 <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">Client Company (Optional)</label>
                    <input 
                      type="text" 
                      id="company" 
                      name="company"
                      value={testimonialForm.company}
                      onChange={handleTestimonialFormChange}
                      className="w-full px-3 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                 <div>
                    <label htmlFor="order" className="block text-sm font-medium text-slate-300 mb-1">Display Order</label>
                    <input 
                      type="number" 
                      id="order" 
                      name="order"
                      value={testimonialForm.order}
                      onChange={handleTestimonialFormChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Lower numbers appear first.</p>
                </div>
                <div className="flex items-center pt-6">
                    <input 
                        id="isActive" 
                        name="isActive"
                        type="checkbox"
                        checked={testimonialForm.isActive}
                        onChange={handleTestimonialFormChange}
                        className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-500 rounded bg-slate-700"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-slate-300">
                        Show on homepage?
                    </label>
                </div>
             </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                 <motion.button
                    type="button" // Important: not submit
                    onClick={handleCancelTestimonialForm}
                    className={`px-4 py-2 rounded-md font-medium transition-colors bg-slate-600 hover:bg-slate-500`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Cancel
                </motion.button>
                <motion.button
                    type="submit"
                    disabled={testimonialSaving}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${testimonialSaving ? 'bg-slate-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                    whileHover={{ scale: testimonialSaving ? 1 : 1.03 }}
                    whileTap={{ scale: testimonialSaving ? 1 : 0.98 }}
                >
                    {testimonialSaving ? 'Saving...' : (testimonialForm.id ? 'Update Testimonial' : 'Add Testimonial')}
                </motion.button>
            </div>
          </motion.form>
        )}

        {/* Testimonials List */} 
        {!testimonialsLoading && !testimonialsError && testimonials.length === 0 && (
            <div className="text-center py-6 text-slate-400">No testimonials found. Add one using the button above.</div>
        )}
        {!testimonialsLoading && !testimonialsError && testimonials.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Order</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Quote (Excerpt)</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rating</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Active</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {testimonials.map((testimonial) => (
                  <tr key={testimonial.id} className={!testimonial.isActive ? 'opacity-60' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white text-center">{testimonial.order}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{testimonial.client?.name || 'Unknown Client'}</div>
                        <div className="text-xs text-slate-400">{testimonial.company || testimonial.client?.company || 'N/A'}</div>
                        <div className="text-xs text-slate-500">ID: {testimonial.clientId}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm text-slate-300 max-w-md truncate" title={testimonial.content}>{testimonial.content}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white text-center">{testimonial.rating}/5</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                      {testimonial.isActive ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Yes</span> : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">No</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="text-sky-400 hover:text-sky-300"
                        disabled={testimonialDeleting === testimonial.id}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="text-red-500 hover:text-red-400"
                        disabled={testimonialDeleting === testimonial.id}
                      >
                        {testimonialDeleting === testimonial.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
} 