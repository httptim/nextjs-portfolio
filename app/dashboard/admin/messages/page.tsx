// app/dashboard/admin/messages/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatRelativeTime, formatMessageDate, formatTime } from '@/lib/utils/date-utils';

interface Message {
  id: string;
  content: string;
  sender: 'admin' | 'customer';
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  project: string;
  projectId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    sender: string;
  } | null;
  unreadCount: number;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const projectId = searchParams.get('project');
        const endpoint = projectId 
          ? `/api/conversations?project=${projectId}` 
          : '/api/conversations';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        
        const data = await response.json();
        setConversations(data.conversations);
        
        // If project ID is specified in URL and we have conversations, select the one for that project
        if (projectId && data.conversations.length > 0) {
          const projectConversation = data.conversations.find(
            (c: Conversation) => c.projectId === projectId
          );
          
          if (projectConversation) {
            setSelectedConversation(projectConversation.id);
          } else if (data.conversations.length > 0) {
            // If no conversation for that project, select the first one
            setSelectedConversation(data.conversations[0].id);
          }
        } else if (data.conversations.length > 0) {
          // Select the first conversation by default
          setSelectedConversation(data.conversations[0].id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setErrorMessage('Failed to load conversations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [searchParams]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      
      try {
        const response = await fetch(`/api/conversations/${selectedConversation}/messages`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data.messages);
        
        // Update unread count in conversations list
        setConversations(prevConversations => 
          prevConversations.map(conversation => 
            conversation.id === selectedConversation 
              ? { ...conversation, unreadCount: 0 } 
              : conversation
          )
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
        setErrorMessage('Failed to load messages. Please try again later.');
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    try {
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add the new message to the messages list
      setMessages(prevMessages => [...prevMessages, data.message]);
      
      // Update the last message in conversations list
      setConversations(prevConversations => 
        prevConversations.map(conversation => 
          conversation.id === selectedConversation 
            ? { 
                ...conversation, 
                lastMessage: {
                  content: newMessage,
                  timestamp: new Date().toISOString(),
                  sender: 'self'
                } 
              } 
            : conversation
        )
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group messages by date for display
  const groupedMessages = messages.reduce<{[key: string]: Message[]}>((groups, message) => {
    const date = formatMessageDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

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
        <p className="mt-1 text-sm text-slate-300">Chat with your customers</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        {errorMessage && (
          <div className="bg-red-500/20 text-red-500 p-4 rounded-md mb-4">
            {errorMessage}
            <button 
              onClick={() => setErrorMessage(null)} 
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-250px)] min-h-[500px]">
          <div className="flex h-full">
            {/* Conversation List */}
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
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-2 w-full bg-slate-700 border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No conversations found.
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
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
                              {conversation.customer.name}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-slate-400">
                                {formatRelativeTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-1 text-xs text-slate-400">
                            <p className="truncate">{conversation.project}</p>
                          </div>
                          {conversation.lastMessage && (
                            <p className="mt-1 text-xs text-slate-300 truncate">
                              {conversation.lastMessage.sender === 'self' ? 'You: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 bg-sky-500 rounded-full w-5 h-5 flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{conversation.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-700 bg-slate-750">
                    <div className="flex justify-between items-center">
                      <div>
                        {/* Display customer info */}
                        {conversations.find(c => c.id === selectedConversation)?.customer && (
                          <>
                            <h3 className="text-md font-medium text-white">
                              {conversations.find(c => c.id === selectedConversation)?.customer.name}
                            </h3>
                            <div className="flex items-center text-xs text-slate-400">
                              <span>{conversations.find(c => c.id === selectedConversation)?.customer.email}</span>
                              <span className="mx-2">•</span>
                              <span>{conversations.find(c => c.id === selectedConversation)?.project}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
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
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                          <div key={date}>
                            <div className="flex justify-center mb-4">
                              <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-md">
                                {date}
                              </span>
                            </div>
                            <div className="space-y-4">
                              {dateMessages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                                      message.sender === 'admin'
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-slate-700 text-white'
                                    }`}
                                  >
                                    <div className="text-sm">{message.content}</div>
                                    <div className="mt-1 text-xs text-right opacity-70">
                                      {formatTime(message.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
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
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                      >
                        {sendingMessage ? (
                          <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        ) : (
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
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