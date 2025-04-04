// app/components/sections/Testimonials.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  clientName: string;
  position?: string;
  company?: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Animation control
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Fetch testimonials data
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        
        const data = await response.json();
        setTestimonials(data.testimonials);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 8000); // Change testimonial every 8 seconds
    
    return () => clearInterval(timer);
  }, [testimonials]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Render Star Rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg 
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-slate-500'}`}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Show loading state if needed
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="animate-pulse mb-4 mx-auto w-40 h-8 bg-slate-700 rounded"></div>
          <div className="animate-pulse mx-auto w-64 h-4 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  // If there are no testimonials or an error occurred
  if ((testimonials.length === 0 && !loading) || error) {
    return null; // Don't show the section if there are no testimonials
  }

  return (
    <div className="container mx-auto px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Client <span className="text-sky-400">Testimonials</span></h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Here's what my clients have to say about working with me on their projects.
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="relative max-w-4xl mx-auto"
        >
          {/* Carousel */}
          <div className="overflow-hidden">
            <div className="relative flex flex-col items-center">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className={`w-full ${index === currentIndex ? 'block' : 'hidden'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-slate-800 p-6 md:p-10 rounded-xl shadow-lg text-center">
                    <div className="mb-6 flex justify-center">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    <blockquote className="text-xl md:text-2xl text-white italic mb-6">
                      "{testimonial.content}"
                    </blockquote>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-xl font-bold text-white mb-3">
                        {testimonial.clientName.charAt(0)}
                      </div>
                      <p className="text-lg font-semibold text-white">{testimonial.clientName}</p>
                      {(testimonial.position || testimonial.company) && (
                        <p className="text-slate-400">
                          {testimonial.position}
                          {testimonial.position && testimonial.company && ', '}
                          {testimonial.company}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentIndex ? 'bg-sky-500' : 'bg-slate-600'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation arrows (only if more than one testimonial) */}
          {testimonials.length > 1 && (
            <>
              <button
                className="absolute -left-4 md:-left-10 top-1/2 transform -translate-y-1/2 bg-slate-700 hover:bg-slate-600 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onClick={() => setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute -right-4 md:-right-10 top-1/2 transform -translate-y-1/2 bg-slate-700 hover:bg-slate-600 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onClick={() => setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}