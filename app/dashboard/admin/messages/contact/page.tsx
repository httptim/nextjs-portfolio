// app/dashboard/admin/messages/contact/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get URL params to handle direct links to specific submissions
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');

  // Load submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/contact-submissions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contact submissions');
        }
        
        const data = await response.json();
        setSubmissions(data.submissions);
        
        // If there's an ID in the URL, find and view that submission
        if (submissionId) {
          const submission = data.submissions.find((sub: ContactSubmission) => sub.id === submissionId);
          if (submission) {
            viewSubmission(submission);
          }
        }
      } catch (err) {
        console.error('Error fetching contact submissions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching submissions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [submissionId]);

  // Mark submission as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/contact-submissions/${id}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark submission as read');
      }
      
      const updatedSubmissions = submissions.map(submission => 
        submission.id === id ? { ...submission, read: true } : submission
      );
      
      setSubmissions(updatedSubmissions);
    } catch (err) {
      console.error('Error marking submission as read:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while marking as read');
    }
  };

  // Delete submission
  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }
      
      const updatedSubmissions = submissions.filter(submission => submission.id !== id);
      setSubmissions(updatedSubmissions);
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert(err instanceof Error ? err.message : 'An error occurred while deleting submission');
    }
  };

  // View submission details
  const viewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
    
    // Mark as read if it's unread
    if (!submission.read) {
      markAsRead(submission.id);
    }
  };

  // Filter and search submissions
  const filteredSubmissions = submissions
    .filter(submission => filter === 'all' || (filter === 'read' ? submission.read : !submission.read))
    .filter(submission => 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
        <h1 className="text-2xl font-semibold text-white">Contact Submissions</h1>
        <p className="mt-1 text-sm text-slate-300">Manage inquiries from the contact form</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div className="w-full md:w-64 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 block w-full bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    filter === 'all' 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    filter === 'unread' 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    filter === 'read' 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Read
                </button>
              </div>
            </div>
            
            {submissions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No contact submissions yet.
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No submissions match your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Submitted
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
                    {filteredSubmissions.map((submission) => (
                      <motion.tr
                        key={submission.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`hover:bg-slate-750 ${!submission.read ? 'bg-slate-750/50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {!submission.read && (
                              <span className="inline-block w-2 h-2 bg-sky-500 rounded-full mr-2"></span>
                            )}
                            {submission.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{submission.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{formatDate(submission.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            submission.read ? 'bg-green-500/20 text-green-500' : 'bg-sky-500/20 text-sky-500'
                          }`}>
                            {submission.read ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewSubmission(submission)}
                            className="text-sky-400 hover:text-sky-300 mr-3"
                          >
                            View
                          </button>
                          {!submission.read && (
                            <button
                              onClick={() => markAsRead(submission.id)}
                              className="text-green-400 hover:text-green-300 mr-3"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteSubmission(submission.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-white">
                  Message from {selectedSubmission.name}
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
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">From</h4>
                  <p className="text-sm text-white">{selectedSubmission.name} &lt;{selectedSubmission.email}&gt;</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Date</h4>
                  <p className="text-sm text-white">{formatDate(selectedSubmission.date)}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">Message</h4>
                  <p className="text-sm text-white whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const mailtoUrl = `mailto:${selectedSubmission.email}?subject=Re: Your Inquiry&body=Hello ${selectedSubmission.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0A`;
                    window.open(mailtoUrl, '_blank');
                  }}
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                >
                  Reply by Email
                </button>
                <button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}