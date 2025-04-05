// app/dashboard/customer/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    role: string;
  };
  createdAt: string;
}

interface Conversation {
  id: string;
  project: {
    name: string;
  };
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch messages');
        }
        const data = await response.json();
        setConversations(data.conversations);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    if (session.status === 'authenticated' && session.data) {
      fetchMessages();
    }
  }, [session]);

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
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {conversations.length === 0 ? (
              <p className="text-center text-slate-400">No conversations found.</p>
            ) : (
              <div className="space-y-6">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-700 rounded-lg p-4"
                  >
                    <h3 className="text-md font-medium text-white mb-4">
                      Project: {conversation.project.name}
                    </h3>
                    <div className="space-y-4">
                      {conversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.sender.role === 'ADMIN'
                              ? 'bg-sky-500/20 ml-8'
                              : 'bg-slate-600 mr-8'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-white">{message.content}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {message.sender.name}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}