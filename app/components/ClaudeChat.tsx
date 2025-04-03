// app/components/ClaudeChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'claude';
  timestamp: Date;
}

interface ChatProps {
  apiKey?: string;
}

export default function ClaudeChat({ apiKey }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Claude, your AI assistant. How can I help you today?",
      sender: 'claude',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || '');
  const [isApiKeySet, setIsApiKeySet] = useState(!!apiKey);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !isApiKeySet) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // This is where you would make an API call to Claude API
      // For now, we'll simulate a response
      
      // In a real implementation, you would use something like:
      /*
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeyInput,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: inputValue
            }
          ]
        }),
      });
      
      const data = await response.json();
      const claudeResponse = data.content[0].text;
      */
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate Claude's response
      const claudeResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'd be happy to help with that! This is a simulated response since the API integration isn't fully implemented yet. When connected to the real Claude API, I'll provide helpful information about the portfolio owner's skills, projects and experience.`,
        sender: 'claude',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, claudeResponse]);
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error connecting to Claude. Please try again later.',
        sender: 'claude',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      setIsApiKeySet(true);
      // In a real app, you might want to store this securely
      // or handle API key management on the server side
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden mb-4 w-80 sm:w-96"
          >
            <div className="p-4 bg-slate-800 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-sky-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                    />
                  </svg>
                </div>
                <h3 className="text-white font-medium">Chat with Claude</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            
            {!isApiKeySet ? (
              <div className="p-4">
                <p className="text-slate-300 text-sm mb-3">
                  Please enter your Claude API key to start chatting:
                </p>
                <div className="flex">
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    onClick={saveApiKey}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-r-md transition-colors"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Your API key will only be used in your browser and won't be stored on any server.
                </p>
              </div>
            ) : (
              <>
                <div className="h-80 overflow-y-auto p-4 flex flex-col space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-200 max-w-[80%] rounded-lg p-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={sendMessage} className="p-3 border-t border-slate-700">
                  <div className="flex">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Claude about the portfolio..."
                      className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 rounded-r-md transition-colors"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-sky-500 hover:bg-sky-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-6 w-6 text-white transition-transform ${isOpen ? 'rotate-45' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isOpen ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
            />
          )}
        </svg>
      </motion.button>
    </div>
  );
}