// app/components/Navigation.tsx
'use client';

import { motion } from 'framer-motion';

interface NavigationProps {
  sections: { id: string; label: string }[];
  activeSection: string;
}

export default function Navigation({ sections, activeSection }: NavigationProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="container mx-auto py-4 px-4">
      <div className="flex justify-between items-center">
        <motion.div 
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sky-400">D</span>
          <span>ev</span>
          <span className="text-sky-400">P</span>
          <span>ortfolio</span>
        </motion.div>
        
        <motion.ul 
          className="hidden md:flex space-x-6"
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
        
        <div className="md:hidden">
          {/* Mobile menu button - implemented as a hamburger icon */}
          <button className="text-white p-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu - would be shown conditionally */}
      {/* This would be expanded with a state to control visibility */}
    </nav>
  );
}