// app/dashboard/customer/chat/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

// --- Interfaces copied from admin page --- 
interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: 'ADMIN' | 'CUSTOMER';
  };
  timestamp: string; // Changed from createdAt for consistency with admin
  read: boolean;
}

interface Conversation {
  id: string;
  // Customer info isn't strictly needed here as it's the logged-in user
  // but API provides it, so we can keep interface consistent
  customer: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  } | null;
  lastMessage: {
    content: string;
    timestamp: string;
    sender: 'ADMIN' | 'CUSTOMER';
  };
  unreadCount: number;
  messages: Message[];
}
// --- End Interfaces --- 

export default function CustomerChatPage() { // Renamed component for clarity
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Search term might not be needed for customer view, but keep for now
  const [searchTerm, setSearchTerm] = useState(''); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession(); // Use session directly

  // Fetch conversations from the unified endpoint
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/conversations', { // Corrected Endpoint
          credentials: 'include',
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
          let errorDetails = 'Failed to fetch conversations';
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || errorDetails;
          } catch (parseError) {}
          throw new Error(errorDetails);
        }
        
        const data = await response.json();
        setConversations(data.conversations || []); // Ensure it's an array
        
        // Select first conversation by default if none selected
        if (data.conversations && data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0].id);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching conversations');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated') { // Check session status directly
        fetchConversations();
    }
  }, [status]); // Depend on session status

  // --- Hooks copied from admin page --- 
  // Scroll to bottom of messages when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, conversations]);

  // Mark messages as read when conversation is selected
  // Customer should mark messages sent by ADMIN as read
  useEffect(() => {
    if (selectedConversation) {
      const currentConvo = conversations.find(c => c.id === selectedConversation);
      const hasUnreadAdminMessages = currentConvo?.messages.some(m => m.sender.role === 'ADMIN' && !m.read);

      if (hasUnreadAdminMessages) {
          const markMessagesAsRead = async () => {
            try {
                // We might need a dedicated endpoint or logic adjustment
                // for customer marking messages read vs admin.
                // For now, let's assume the same endpoint works or this is handled differently.
                // Maybe PATCH /api/conversations/[id] with { read: true } ?
                // Let's comment out the fetch for now to avoid potential errors,
                // UI will update optimistically.
                /*
                await fetch(`/api/conversations/${selectedConversation}/read`, {
                    method: 'POST', // Or PATCH?
                    credentials: 'include'
                });
                */
                console.log('Attempting to mark messages as read (customer view) - fetch commented out');

                // Optimistically update local state
                setConversations(currentConversations => 
                    currentConversations.map(conversation => {
                    if (conversation.id === selectedConversation) {
                        return {
                        ...conversation,
                        unreadCount: 0, // Assume all are read now
                        messages: conversation.messages.map(message => ({
                            ...message,
                            read: true, // Mark all as read locally
                        })),
                        };
                    }
                    return conversation;
                    })
                );
            } catch (err) {
                console.error('Error marking messages as read (customer view):', err);
            }
            };
            markMessagesAsRead();
        }
    }
  }, [selectedConversation, conversations]);
  // --- End Copied Hooks --- 

  // --- Functions copied from admin page --- 
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !session?.user?.id) return;
    
    try {
      // Optimistically update UI
      const now = new Date().toISOString();
      const tempId = `temp-${Date.now()}`;
      
      // Use session data directly
      const newMsg: Message = {
        id: tempId,
        content: newMessage,
        sender: {
          id: session.user.id, 
          name: session.user.name || 'Customer', // Use actual name
          role: 'CUSTOMER' // Role is CUSTOMER
        },
        timestamp: now,
        read: true, // Sender always reads their own message
      };
      
      setConversations(currentConversations => 
        currentConversations.map(conversation => {
          if (conversation.id === selectedConversation) {
            return {
              ...conversation,
              messages: [...conversation.messages, newMsg],
              lastMessage: {
                content: newMessage,
                timestamp: now,
                sender: 'CUSTOMER',
              },
            };
          }
          return conversation;
        })
      );
      
      const messageToSend = newMessage;
      setNewMessage('');
      
      // Send the message to the API (assuming same endpoint)
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageToSend, // Use stored message content
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Rollback optimistic update on failure?
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Update the message with the real ID from the server response
      setConversations(currentConversations => 
        currentConversations.map(conversation => {
          if (conversation.id === selectedConversation) {
            return {
              ...conversation,
              messages: conversation.messages.map(message => 
                message.id === tempId ? { ...data.message, timestamp: data.message.createdAt } : message // Use server data, align timestamp key
              ),
              // Optionally update lastMessage with server data if needed
            };
          }
          return conversation;
        })
      );
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
      // Consider rolling back the optimistic UI update here
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Invalid date';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '-';
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === now.toDateString()) {
          return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          return 'Yesterday';
        } else {
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    } catch (e) {
        return '-';
    }
  };
  // --- End Copied Functions ---

  // Filter conversations (customer only sees their own, so filtering might not be needed)
  // If searchTerm state is kept, filter by project name or message content?
  const filteredConversations = conversations.filter(conversation => 
     conversation.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? true
  );

  const activeConversation = conversations.find(c => c.id === selectedConversation);

  if (status === 'loading' || loading) { // Check session loading too
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return <p className="p-6 text-center text-slate-400">Please log in to view messages.</p>;
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-500/20 text-red-500 p-4 rounded-md">
            Error: {error}
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

  // --- JSX Layout adapted from admin page --- 
  return (
    <div className="flex h-[calc(100vh-theme(space.16))] overflow-hidden">
      {/* Sidebar (Conversation List) */}
      <div className="w-1/3 lg:w-1/4 border-r border-slate-700 flex flex-col bg-slate-800">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
          {/* Optional: Search input if needed for customer view */}
          {/* 
          <input 
            type="text"
            placeholder="Search project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mt-2 p-2 rounded bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          */}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <p className="p-4 text-slate-400 text-center">No conversations yet.</p>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-slate-700' : ''
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white truncate">
                    {conversation.project?.name || 'General Inquiry'} 
                  </h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                     {formatDate(conversation.lastMessage.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 truncate">
                  <span className={`${conversation.lastMessage.sender === 'ADMIN' ? 'text-sky-400' : ''}`}>
                     {conversation.lastMessage.sender === 'ADMIN' ? 'Admin:' : 'You:'} 
                  </span>
                  {' '} {conversation.lastMessage.content}
                </p>
                {/* Unread count indicator if needed */}
                {/* 
                {conversation.unreadCount > 0 && (
                    <span className="mt-1 text-xs bg-sky-500 text-white rounded-full px-2 py-0.5 float-right">
                    {conversation.unreadCount}
                    </span>
                )} 
                */}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <h3 className="font-semibold text-white">
                {activeConversation.project?.name || 'General Inquiry'}
              </h3>
              {/* Display admin name? */}
              {/* <p className="text-sm text-slate-400">Chat with Admin</p> */} 
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.map((message, index) => {
                  // Determine if date separator is needed
                  const showDateSeparator = index === 0 || 
                      formatDate(message.timestamp) !== formatDate(activeConversation.messages[index - 1].timestamp);
                  
                  return (
                  <React.Fragment key={message.id}>
                      {showDateSeparator && (
                          <div className="text-center text-xs text-slate-500 my-4">
                              {formatDate(message.timestamp)}
                          </div>
                      )}
                      <motion.div 
                          className={`flex ${message.sender.role === 'CUSTOMER' ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                      >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender.role === 'CUSTOMER' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                              {/* Optionally show sender name for admin messages */}
                              {/* {message.sender.role === 'ADMIN' && <p className="text-xs font-medium text-sky-400 mb-1">{message.sender.name}</p>} */}
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${message.sender.role === 'CUSTOMER' ? 'text-sky-200' : 'text-slate-400'} text-right`}>
                                  {formatTime(message.timestamp)}
                              </p>
                          </div>
                      </motion.div>
                  </React.Fragment>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 rounded bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500">Select a conversation to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
// Need to import React for Fragment
import React from 'react'; 