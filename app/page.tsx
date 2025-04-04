// app/page.tsx - Add Testimonials to the import and to the main component
'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import Particles from './components/Particles';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import FutureProjects from './components/sections/FutureProjects';
import PersonalProjects from './components/sections/PersonalProjects';
import Testimonials from './components/sections/Testimonials'; // Add this import
import Contact from './components/sections/Contact';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero');
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // Update sections to include testimonials
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'future-projects', label: 'Future Work' },
    { id: 'personal-projects', label: 'Personal' },
    { id: 'testimonials', label: 'Testimonials' }, // Add testimonials section
    { id: 'contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }));

      const currentPosition = window.scrollY + window.innerHeight / 3;

      for (const { id, element } of sectionElements) {
        if (!element) continue;
        
        const { offsetTop, offsetHeight } = element;
        
        if (
          currentPosition >= offsetTop && 
          currentPosition < offsetTop + offsetHeight
        ) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="relative bg-slate-900 text-slate-100 min-h-screen" ref={mainRef}>
      {/* Particle background effect */}
      <div className="fixed inset-0 z-0">
        <Particles />
      </div>
      
      {/* Fixed navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm">
        <Navigation sections={sections} activeSection={activeSection} />
      </div>

      {/* Main content */}
      <motion.main 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section id="hero" className="min-h-screen">
          <Hero />
        </section>

        <motion.div style={{ opacity }}>
          <section id="about" className="min-h-screen py-20">
            <About />
          </section>

          <section id="projects" className="min-h-screen py-20">
            <Projects />
          </section>

          <section id="future-projects" className="min-h-screen py-20">
            <FutureProjects />
          </section>

          <section id="personal-projects" className="min-h-screen py-20">
            <PersonalProjects />
          </section>
          
          {/* Add Testimonials section */}
          <section id="testimonials" className="min-h-screen py-20">
            <Testimonials />
          </section>

          <section id="contact" className="min-h-screen py-20">
            <Contact />
          </section>
        </motion.div>

        <Footer />
      </motion.main>
    </div>
  );
}