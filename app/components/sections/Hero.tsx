// app/components/sections/Hero.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '../../hooks/useMousePosition'; // Assuming this hook exists
import Particles from '@/app/components/Particles';

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mousePosition = useMousePosition();
  
  // Typing animation states
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150); // Start speed
  
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

  // Typing animation effect
  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    let timer: NodeJS.Timeout;

    const handleTyping = () => {
        if (!isDeleting) {
            // Typing forward
            setDisplayText(currentPhrase.substring(0, displayText.length + 1));
            setTypingSpeed(100 + Math.random() * 50);

            if (displayText === currentPhrase) {
                // Pause before deleting
                timer = setTimeout(() => {
                    setIsDeleting(true);
                    setTypingSpeed(100);
                }, 1500);
            }
        } else {
            // Backspacing
            setDisplayText(currentPhrase.substring(0, displayText.length - 1));
             setTypingSpeed(80 + Math.random() * 40);

            if (displayText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                setTypingSpeed(150);
                // Pause before starting next phrase
                timer = setTimeout(() => {}, 500); 
            }
        }
    };

    timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
}, [displayText, isDeleting, loopNum, typingSpeed, phrases]); // Ensure all dependencies are listed

  return (
     // Using a simpler structure like before
     <div className="flex items-center justify-center h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
       <div className="absolute inset-0 z-0 opacity-30">
        <Particles />
      </div>
      
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
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white"
          variants={itemVariants}
          style={calculateMouseEffect()}
        >
          <span>I'm a </span>
          <span className="text-sky-400">{displayText}</span>
          {/* Blinking cursor effect */}
          <span className="text-sky-400 opacity-100 animate-blink">|</span> 
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-slate-300 max-w-lg mb-8 mx-auto md:mx-0"
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

// Simple blink animation for the cursor
const blinkAnimation = {
    animate: {
        opacity: [1, 1, 0, 0], // Blinking effect
    },
    transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        times: [0, 0.5, 0.5, 1] 
    }
};

// Add corresponding CSS if needed, e.g., in globals.css:
/*
@keyframes blink {
  0%, 50% { opacity: 1; }
  50.1%, 100% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-end infinite;
}
*/