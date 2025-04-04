'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * A utility component that syncs the NextAuth session data to localStorage
 * for compatibility with components that rely on localStorage for auth data.
 * 
 * This component should be used near the top of your app, such as in the layout.
 */
export default function SessionBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only sync when the session is authenticated
    if (status === 'authenticated' && session?.user) {
      // Convert ADMIN/CUSTOMER to lowercase as the existing components expect lowercase
      const role = session.user.role.toLowerCase();
      
      localStorage.setItem('userName', session.user.name || 'User');
      localStorage.setItem('userEmail', session.user.email || '');
      localStorage.setItem('userRole', role);
      
      console.log('SessionBridge: Synced session data to localStorage', {
        name: session.user.name,
        email: session.user.email,
        role: role
      });
    }
  }, [session, status]);

  // This component doesn't render anything
  return null;
}