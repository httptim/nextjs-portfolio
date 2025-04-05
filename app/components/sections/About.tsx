// app/components/sections/About.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Skill {
  name: string;
  level: number;
  icon: string;
}

interface AboutConfig {
  aboutHeading?: string;
  aboutText?: string;
  aboutImageUrl?: string;
}

const skills: Skill[] = [
  { name: 'JavaScript', level: 90, icon: 'js' },
  { name: 'TypeScript', level: 85, icon: 'ts' },
  { name: 'React', level: 92, icon: 'react' },
  { name: 'Next.js', level: 88, icon: 'next' },
  { name: 'Node.js', level: 80, icon: 'node' },
  { name: 'CSS/SCSS', level: 85, icon: 'css' },
  { name: 'HTML5', level: 95, icon: 'html' },
  { name: 'GraphQL', level: 75, icon: 'graphql' },
  { name: 'MongoDB', level: 78, icon: 'mongodb' },
  { name: 'SQL', level: 82, icon: 'sql' },
];

export default function About() {
  const [config, setConfig] = useState<AboutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/site-configuration');
        if (!response.ok) throw new Error('Failed to fetch about configuration');
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

  useEffect(() => {
    if (inView && !loading) {
      controls.start('visible');
    }
  }, [controls, inView, loading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 0.3 } },
  };
  
  const defaultHeading = "About Me";
  const defaultText = "Passionate developer with experience in creating modern web applications...";
  const defaultImageUrl = '/images/placeholder-about.jpg';
  
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const heading = config?.aboutHeading || defaultHeading;
  const text = config?.aboutText || defaultText;
  const imageUrl = config?.aboutImageUrl || defaultImageUrl;

  return (
    <div className="container mx-auto px-6 py-20" ref={ref}>
      {error && <div className="text-red-400 mb-4 text-center">Error loading content: {error}. Displaying default content.</div>}
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-6">
            {heading.split(' ').map((word, index) => 
              index === 1 ? <span key={index} className="text-sky-400">{word} </span> : `${word} `
            )}
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            {text.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <motion.div variants={imageVariants} className="relative h-80 w-full md:h-96 rounded-lg overflow-hidden shadow-xl">
          <Image
            src={imageUrl}
            alt={heading}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 hover:scale-105"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}