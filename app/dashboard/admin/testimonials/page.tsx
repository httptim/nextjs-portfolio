// app/dashboard/admin/testimonials/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  position?: string | null;
  company?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string | null;
}

export default function TestimonialsManagementPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isNewTestimonial, setIsNewTestimonial] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    clientId: '',
    position: '',
    company: '',
    isActive: true,
    order: 0,
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<{
    content?: string;
    clientId?: string;
  }>({});

  // Fetch testimonials and customers on page load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch testimonials (admin version with all fields)
        const testimonialsResponse = await fetch('/api/testimonials/admin');
        
        if (!testimonialsResponse.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        
        const testimonialsData = await testimonialsResponse.json();
        setTestimonials(testimonialsData.testimonials);
        
        // Fetch customers for the dropdown
        const customersResponse = await fetch('/api/users?role=CUSTOMER');
        
        if (!customersResponse.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const customersData = await customersResponse.json();
        setCustomers(customersData.users);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter testimonials based on search term
  const filteredTestimonials = testimonials.filter(testimonial => 
    testimonial.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (testimonial.company && testimonial.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (testimonial.position && testimonial.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (name === 'rating' || name === 'order') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Open modal to add a new testimonial
  const handleAddTestimonial = () => {
    setFormData({
      content: '',
      rating: 5,
      clientId: customers.length > 0 ? customers[0].id : '',
      position: '',
      company: '',
      isActive: true,
      order: 0,
    });
    setIsNewTestimonial(true);
    setIsModalOpen(true);
  };
  
  // Open modal to edit an existing testimonial
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setFormData({
      content: testimonial.content,
      rating: testimonial.rating,
      clientId: testimonial.clientId,
      position: testimonial.position || '',
      company: testimonial.company || '',
      isActive: testimonial.isActive,
      order: testimonial.order,
    });
    setSelectedTestimonial(testimonial);
    setIsNewTestimonial(false);
    setIsModalOpen(true);
  };
  
  // Validate the form before submission
  const validateForm = () => {
    const errors: {
      content?: string;
      clientId?: string;
    } = {};
    
    if (!formData.content.trim()) {
      errors.content = 'Testimonial content is required';
    }
    
    if (!formData.clientId) {
      errors.clientId = 'Please select a client';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save a testimonial (create or update)
  const handleSaveTestimonial = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      
      let response;
      
      if (isNewTestimonial) {
        // Create new testimonial
        response = await fetch('/api/testimonials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else if (selectedTestimonial) {
        // Update existing testimonial
        response = await fetch(`/api/testimonials/${selectedTestimonial.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (!response || !response.ok) {
        const errorData = await response?.json();
        throw new Error(errorData?.error || 'Failed to save testimonial');
      }
      
      // Refresh the testimonials list
      const testimonialsResponse = await fetch('/api/testimonials/admin');
      const testimonialsData = await testimonialsResponse.json();
      setTestimonials(testimonialsData.testimonials);
      
      // Close the modal
      setIsModalOpen(false);
      setSelectedTestimonial(null);
      
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial. Please try again.');
    }
  };
  
  // Delete a testimonial
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete testimonial');
      }
      
      // Remove the deleted testimonial from the state
      setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
      
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial. Please try again.');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Render star rating input
  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className="focus:outline-none"
          >
            <svg 
              className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400' : 'text-slate-400'}`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
        <h1 className="text-2xl font-semibold text-white">Testimonials</h1>
        <p className="mt-1 text-sm text-slate-300">Manage client testimonials displayed on the homepage</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div className="w-full md:w-auto">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search testimonials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-2 block w-full bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddTestimonial}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
              >
                Add Testimonial
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Testimonial
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Date
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
                  {filteredTestimonials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                        No testimonials found.
                      </td>
                    </tr>
                  ) : (
                    filteredTestimonials.map((testimonial) => (
                      <motion.tr
                        key={testimonial.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                              <span className="text-white font-semibold">{testimonial.clientName.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{testimonial.clientName}</div>
                              <div className="text-xs text-slate-400">
                                {testimonial.position && <span>{testimonial.position}</span>}
                                {testimonial.position && testimonial.company && <span>, </span>}
                                {testimonial.company && <span>{testimonial.company}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300 line-clamp-2">{testimonial.content}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <svg 
                                key={index}
                                className={`w-4 h-4 ${index < testimonial.rating ? 'text-yellow-400' : 'text-slate-500'}`}
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{formatDate(testimonial.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            testimonial.isActive ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {testimonial.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditTestimonial(testimonial)}
                            className="text-sky-400 hover:text-sky-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
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

      {/* Add/Edit Testimonial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">
                {isNewTestimonial ? 'Add New Testimonial' : 'Edit Testimonial'}
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

            <div className="space-y-4">
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-slate-300">
                  Client
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className={`mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.clientId ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-sky-500'
                  }`}
                >
                  <option value="" disabled>Select a client</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company ? `(${customer.company})` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.clientId && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.clientId}</p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-300">
                  Testimonial Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className={`mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.content ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-sky-500'
                  }`}
                  placeholder="Enter testimonial text"
                ></textarea>
                {formErrors.content && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Rating
                </label>
                {renderStarRating()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-slate-300">
                    Position (optional)
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="E.g. CEO, Marketing Director"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-300">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-slate-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 w-full px-4 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-slate-400">Lower numbers appear first</p>
                </div>

                <div className="flex items-center h-full pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-slate-300">
                    Show on website
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTestimonial}
                className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
              >
                {isNewTestimonial ? 'Add Testimonial' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}