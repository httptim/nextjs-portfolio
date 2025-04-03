// app/components/sections/Hero.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '../../hooks/useMousePosition';

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mousePosition = useMousePosition();
  
  // Typing animation states
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  
  // List of phrases to cycle through
  const phrases = [
    "Full Stack Developer",
    "UI/UX Designer",
    "Mobile App Developer",
    "Web Architect",
    "Problem Solver"
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Interactive heading behavior
  const calculateMouseEffect = () => {
    if (!headingRef.current || !mousePosition.x || !mousePosition.y) return {};
    
    const rect = headingRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = (mousePosition.x - centerX) / 20;
    const distanceY = (mousePosition.y - centerY) / 20;
    
    return {
      transform: `translate(${distanceX * -0.5}px, ${distanceY * -0.5}px)`,
      textShadow: `${distanceX * 0.1}px ${distanceY * 0.1}px 8px rgba(0, 0, 0, 0.3)`,
    };
  };

  // Typing animation effect with no long pauses
  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        
        // If we've completed typing the current phrase
        if (displayText === currentPhrase) {
          // Start deleting immediately with no long pause
          setIsDeleting(true);
          setTypingSpeed(50); // Faster when deleting
        } else {
          // Normal typing speed with slight variation
          setTypingSpeed(50 + Math.random() * 30);
        }
      } else {
        // Backspacing
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        
        // If we've completely deleted the current phrase
        if (displayText === '') {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
          setTypingSpeed(100); // Reset typing speed
        } else {
          // Faster when deleting with slight variation
          setTypingSpeed(30 + Math.random() * 20);
        }
      }
    }, typingSpeed);
    
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, typingSpeed, phrases]);

  return (
    <div className="flex items-center justify-center h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-slate-800/30 to-transparent" />
      
      <motion.div 
        className="container mx-auto px-6 z-10 text-center md:text-left"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-2 text-sky-400 tracking-widest font-light">
          WELCOME TO MY PORTFOLIO
        </motion.div>
        
        <motion.h1 
          ref={headingRef}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          variants={itemVariants}
          style={calculateMouseEffect()}
        >
          <span className="text-white">I'm a </span>
          <span className="text-sky-400">{displayText}</span>
          <span className="text-sky-400 animate-pulse">|</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-slate-300 max-w-lg mb-8"
          variants={itemVariants}
        >
          Crafting elegant solutions to complex problems with clean code and intuitive design.
        </motion.p>
        
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start" variants={itemVariants}>
          <motion.button 
            className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const projectsSection = document.getElementById('projects');
              if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            View My Work
          </motion.button>
          
          <motion.button 
            className="px-8 py-3 border border-slate-600 hover:border-sky-400 hover:text-sky-400 rounded-md font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Contact Me
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}