// app/components/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavigationProps {
  sections: { id: string; label: string }[];
  activeSection: string;
}

export default function Navigation({ sections, activeSection }: NavigationProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const role = localStorage.getItem('userRole');
    if (role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    setIsAuthenticated(false);
    setUserRole(null);
    
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <nav className="container mx-auto py-4 px-4 relative z-50">
      <div className="flex justify-between items-center">
        <motion.div 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <span className="text-sky-400">D</span>
            <span>ev</span>
            <span className="text-sky-400">P</span>
            <span>ortfolio</span>
          </Link>
        </motion.div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <motion.ul 
            className="flex space-x-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {sections.map((section) => (
              <motion.li 
                key={section.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`relative px-2 py-1 transition-colors ${
                    activeSection === section.id ? 'text-sky-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {section.label}
                  {activeSection === section.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"
                      layoutId="activeSection"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              </motion.li>
            ))}
          </motion.ul>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link 
                  href={userRole === 'admin' ? '/dashboard/admin' : '/dashboard/customer'}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-md font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth/login"
                  className="px-4 py-2 border border-slate-600 hover:border-sky-400 hover:text-sky-400 text-slate-300 rounded-md font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            className="text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              {isMobileMenuOpen ? (
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
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 bg-slate-800 rounded-lg shadow-lg"
        >
          <div className="py-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  scrollToSection(section.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 ${
                  activeSection === section.id ? 'text-sky-400' : 'text-slate-300'
                } hover:bg-slate-700 transition-colors`}
              >
                {section.label}
              </button>
            ))}
            
            <div className="mt-3 border-t border-slate-700 pt-3 px-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    href={userRole === 'admin' ? '/dashboard/admin' : '/dashboard/customer'}
                    className="block w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-medium transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-md font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    className="block w-full py-2 border border-slate-600 hover:border-sky-400 hover:text-sky-400 text-slate-300 rounded-md font-medium transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register"
                    className="block w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-medium transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}