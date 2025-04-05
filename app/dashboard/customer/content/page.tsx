'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  projectId: string;
  project: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch content');
        }
        
        const data = await response.json();
        setContentItems(data.content);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };
    
    if (session.status === 'authenticated' && session.data) {
      fetchContent();
    }
  }, [session]);
  
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
        <h1 className="text-2xl font-semibold text-white">Content Library</h1>
        <p className="mt-1 text-sm text-slate-300">View and manage your project content</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        {contentItems.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-white mb-2">No content found</h3>
            <p className="text-slate-300">You don't have any content items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-medium text-white">{item.title}</h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-sky-500/20 text-sky-500">
                      {item.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-xs text-slate-400">Project</p>
                    <p className="text-sm text-white">{item.project.name}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="text-sm text-white">
                      {new Date(item.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link
                      href={`/dashboard/customer/content/${item.id}`}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 