'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API routes to test
  const apiRoutes = [
    '/api/debug/session',
    '/api/dashboard/customer/tasks',
    '/api/dashboard/customer/billing',
    '/api/dashboard/customer/messages',
    '/api/tasks',
    '/api/billing',
    '/api/messages',
    '/api/users',
    '/api/projects'
  ];

  useEffect(() => {
    const testRoutes = async () => {
      const results: Record<string, any> = {};
      
      for (const route of apiRoutes) {
        try {
          console.log(`Testing route: ${route}`);
          const response = await fetch(route, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          results[route] = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
            data: response.status !== 404 ? await response.json().catch(() => 'Failed to parse JSON') : null
          };
        } catch (err) {
          console.error(`Error testing ${route}:`, err);
          results[route] = { 
            error: err instanceof Error ? err.message : 'Unknown error',
            status: 'error'
          };
        }
      }
      
      setResults(results);
      setLoading(false);
    };
    
    testRoutes();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Route Debugging</h1>
      
      {loading ? (
        <div className="animate-spin h-8 w-8 border-2 border-sky-500 rounded-full border-t-transparent"></div>
      ) : (
        <div className="space-y-8">
          {apiRoutes.map(route => (
            <div key={route} className="bg-slate-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{route}</h2>
              
              {results[route]?.status === 'error' ? (
                <div className="bg-red-500/20 text-red-400 p-3 rounded">
                  Error: {results[route].error}
                </div>
              ) : (
                <div>
                  <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                    results[route]?.ok ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    Status: {results[route]?.status} {results[route]?.statusText}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Response:</h3>
                    <pre className="bg-slate-900 p-3 rounded overflow-auto max-h-60 text-sm">
                      {JSON.stringify(results[route]?.data, null, 2) || 'No data'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Environment Info</h2>
            <pre className="bg-slate-900 p-3 rounded overflow-auto max-h-60 text-sm">
              {JSON.stringify({
                baseURL: window.location.origin,
                userAgent: navigator.userAgent,
                time: new Date().toISOString()
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 