'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  createdAt: string;
  assignedTo: string;
  comments?: {
    id: string;
    content: string;
    author: string;
    createdAt: string;
  }[];
  attachments?: {
    id: string;
    filename: string;
    url: string;
    createdAt: string;
  }[];
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tasks/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Task not found');
          } else if (response.status === 403) {
            throw new Error('You do not have permission to view this task');
          }
          throw new Error('Failed to fetch task details');
        }
        
        const data = await response.json();
        setTask(data.task);
      } catch (error) {
        console.error('Error fetching task:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTask();
    }
  }, [id]);

  // Add a comment to the task
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !task) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const data = await response.json();
      
      // Update the task with the new comment
      setTask(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          comments: [...(prev.comments || []), data.comment],
        };
      });
      
      // Clear the comment field
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-500/20 text-slate-300';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-500';
      case 'review':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500/20 text-green-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'high':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-500/20 text-red-500 p-4 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-slate-700 p-4 rounded-md mb-4 text-slate-300">
            Task not found.
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/customer/tasks"
              className="text-sky-400 hover:text-sky-300 flex items-center mb-2"
            >
              <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tasks
            </Link>
            <h1 className="text-2xl font-semibold text-white">{task.title}</h1>
            <div className="mt-1 flex items-center">
              <Link
                href={`/dashboard/customer/projects/${task.projectId}`}
                className="text-sm text-slate-300 hover:text-sky-300"
              >
                {task.projectName}
              </Link>
              <span className="mx-2 text-slate-600">•</span>
              <span className="text-sm text-slate-400">Created {formatDate(task.createdAt)}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
              {task.status === 'todo' ? 'To Do' : 
               task.status === 'in-progress' ? 'In Progress' :
               task.status === 'review' ? 'In Review' : 'Completed'}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <h2 className="text-md font-medium text-white mb-2">Description</h2>
                <div className="bg-slate-700 rounded-md p-4 text-slate-300">
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>
              <div>
                <h2 className="text-md font-medium text-white mb-2">Details</h2>
                <div className="bg-slate-700 rounded-md p-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Assigned To</p>
                    <p className="text-sm text-white">{task.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Due Date</p>
                    <p className="text-sm text-white">{formatDate(task.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <p className={`text-sm ${
                      task.status === 'completed' ? 'text-green-500' :
                      task.status === 'in-progress' ? 'text-blue-500' :
                      task.status === 'review' ? 'text-yellow-500' :
                      'text-slate-300'
                    }`}>
                      {task.status === 'todo' ? 'To Do' : 
                       task.status === 'in-progress' ? 'In Progress' :
                       task.status === 'review' ? 'In Review' : 'Completed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-md font-medium text-white mb-2">Attachments</h2>
                <div className="bg-slate-700 rounded-md p-4">
                  <ul className="space-y-2">
                    {task.attachments.map(attachment => (
                      <li key={attachment.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-slate-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm text-slate-300">{attachment.filename}</span>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-400 hover:text-sky-300"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <h2 className="text-md font-medium text-white mb-2">Comments</h2>
              <div className="bg-slate-700 rounded-md p-4 mb-4">
                {task.comments && task.comments.length > 0 ? (
                  <div className="space-y-4">
                    {task.comments.map(comment => (
                      <div key={comment.id} className="border-l-2 border-slate-600 pl-4">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-white">{comment.author}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No comments yet.</p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="bg-slate-700 rounded-md p-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 bg-slate-600 border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white text-sm"
                  rows={3}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!comment.trim() || submitting}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md text-sm transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Add Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}