// app/dashboard/customer/chat/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'admin';
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  project: string;
  messages: Message[];
  lastMessage: {
    content: string;
    timestamp: string;
  };
  unread: number;
}

export default function CustomerChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations data
  useEffect(() => {
    // In a real app, this would be an API call
    const loadConversations = () => {
      const mockConversations: Conversation[] = [
        {
          id: 'c1',
          name: 'Project Support',
          project: 'E-Commerce Website',
          unread: 2,
          lastMessage: {
            content: 'Hi, I was thinking about the homepage design...',
            timestamp: '2025-04-03T10:30:00',
          },
          messages: [
            {
              id: 'm1',
              content: 'Hello! How can I help you with the E-Commerce Website project?',
              sender: 'admin',
              timestamp: '2025-04-02T09:00:00',
              read: true,
            },
            {
              id: 'm2',
              content: 'I have a question about the product listing page layout.',
              sender: 'customer',
              timestamp: '2025-04-02T09:05:00',
              read: true,
            },
            {
              id: 'm3',
              content: 'Of course! What specifically would you like to know about the layout?',
              sender: 'admin',
              timestamp: '2025-04-02T09:10:00',
              read: true,
            },
            {
              id: 'm4',
              content: 'I was wondering if we could add a filtering sidebar for categories and price ranges.',
              sender: 'customer',
              timestamp: '2025-04-02T09:15:00',
              read: true,
            },
            {
              id: 'm5',
              content: 'Absolutely! That\'s a great idea. I\'ll create a mockup showing how that could work and share it with you tomorrow.',
              sender: 'admin',
              timestamp: '2025-04-02T09:20:00',
              read: true,
            },
            {
              id: 'm6',
              content: 'Thank you! I\'m looking forward to seeing it.',
              sender: 'customer',
              timestamp: '2025-04-02T09:25:00',
              read: true,
            },
            {
              id: 'm7',
              content: 'Hi, I was thinking about the homepage design and wondering if we could schedule a quick call to discuss some ideas?',
              sender: 'customer',
              timestamp: '2025-04-03T10:30:00',
              read: false,
            },
            {
              id: 'm8',
              content: 'I\'ve also been considering the mobile responsiveness of the site.',
              sender: 'customer',
              timestamp: '2025-04-03T10:35:00',
              read: false,
            },
          ],
        },
        {
          id: 'c2',
          name: 'Billing Support',
          project: 'General',
          unread: 0,
          lastMessage: {
            content: 'Your invoice has been processed successfully.',
            timestamp: '2025-04-01T14:20:00',
          },
          messages: [
            {
              id: 'm1',
              content: 'Hello! I wanted to let you know that your invoice #INV-2023-001 has been issued.',
              sender: 'admin',
              timestamp: '2025-04-01T14:00:00',
              read: true,
            },
            {
              id: 'm2',
              content: 'Thanks for letting me know. I\'ll process the payment right away.',
              sender: 'customer',
              timestamp: '2025-04-01T14:10:00',
              read: true,
            },
            {
              id: 'm3',
              content: 'Your invoice has been processed successfully.',
              sender: 'admin',
              timestamp: '2025-04-01T14:20:00',
              read: true,
            },
          ],
        },
        {
          id: 'c3',
          name: 'Mobile App Design',
          project: 'Mobile App UI/UX',
          unread: 0,
          lastMessage: {
            content: 'I\'ve uploaded the latest wireframes for review.',
            timestamp: '2025-03-28T16:45:00',
          },
          messages: [
            {
              id: 'm1',
              content: 'I\'ve uploaded the latest wireframes for review.',
              sender: 'admin',
              timestamp: '2025-03-28T16:45:00',
              read: true,
            },
          ],
        },
      ];
      
      setConversations(mockConversations);
      setSelectedConversation(mockConversations[0].id); // Select the first conversation by default
      setLoading(false);
    };

    loadConversations();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, conversations]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === selectedConversation) {
        const newMsg: Message = {
          id: `m${Date.now()}`,
          content: newMessage,
          sender: 'customer',
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        return {
          ...conversation,
          messages: [...conversation.messages, newMsg],
          lastMessage: {
            content: newMessage,
            timestamp: new Date().toISOString(),
          },
        };
      }
      return conversation;
    });
    
    setConversations(updatedConversations);
    setNewMessage('');
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatConversationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const activeConversation = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
        <p className="mt-1 text-sm text-slate-300">Chat with your project team</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-250px)] min-h-[500px]">
          <div className="flex h-full">
            {/* Conversation List Sidebar */}
            <div className="w-1/3 border-r border-slate-700 overflow-y-auto">
              <div className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="pl-10 py-2 w-full bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`px-4 py-3 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-slate-700' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-white truncate">
                            {conversation.name}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {formatConversationTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {conversation.project}
                        </p>
                        <p className="mt-1 text-xs text-slate-300 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      {conversation.unread > 0 && (
                        <div className="ml-2 bg-sky-500 rounded-full w-5 h-5 flex items-center justify-center">
                          <span className="text-xs text-white font-medium">{conversation.unread}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-700 bg-slate-750">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-md font-medium text-white">
                          {activeConversation.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {activeConversation.project}
                        </p>
                      </div>
                      <div>
                        <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-slate-750">
                    <div className="space-y-4">
                      {activeConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                              message.sender === 'customer'
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className="mt-1 text-xs text-right opacity-70">
                              {formatMessageTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-slate-700 bg-slate-800">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 py-2 px-4 bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="h-12 w-12 text-slate-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-slate-400">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

