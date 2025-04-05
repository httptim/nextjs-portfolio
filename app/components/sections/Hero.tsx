// app/components/sections/Hero.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Particles from '@/app/components/Particles'; // Adjust import path if needed

interface HeroConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
}

export default function Hero() {
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/site-configuration');
        if (!response.ok) throw new Error('Failed to fetch hero configuration');
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  
  const defaultTitle = "Default Hero Title";
  const defaultSubtitle = "Default subtitle explaining your services.";
  const defaultButtonText = "Get Started";
  const defaultButtonLink = "#contact";

  // Display loading or error state, or defaults if fetch fails
  if (loading) {
      return (
          <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          </div>
      );
  }

  // Use fetched data or defaults
  const title = config?.heroTitle || defaultTitle;
  const subtitle = config?.heroSubtitle || defaultSubtitle;
  const buttonText = config?.heroButtonText || defaultButtonText;
  const buttonLink = config?.heroButtonLink || defaultButtonLink;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="absolute inset-0 z-0 opacity-30">
        <Particles />
      </div>
      
      <motion.div 
        className="relative z-10 text-center px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {error && <div className="text-red-400 mb-4">Error: {error}. Displaying default content.</div>}

        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
          variants={itemVariants}
        >
          {title}
        </motion.h1>
        
        <motion.p 
          className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10"
          variants={itemVariants}
        >
          {subtitle}
        </motion.p>
        
        {buttonText && buttonLink && (
          <motion.div variants={itemVariants}>
            <Link href={buttonLink} legacyBehavior>
              <a className="inline-block px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white text-lg font-semibold rounded-lg shadow-lg transition-colors duration-300 transform hover:scale-105">
                {buttonText}
              </a>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}