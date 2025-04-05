'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SessionDebugger() {
  const { data: session, status } = useSession();
  const [serverSession, setServerSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkServerSession = async () => {
      try {
        const res = await fetch('/api/debug/session');
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data = await res.json();
        setServerSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkServerSession();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded shadow"
      >
        {expanded ? 'Hide' : 'Debug Session'}
      </button>

      {expanded && (
        <div className="mt-2 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-w-lg max-h-[80vh] overflow-auto">
          <h3 className="text-lg font-bold mb-2 text-white">Session Debug Info</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-sky-400">Client Session Status</h4>
            <p className="text-white">Status: {status}</p>
            {session ? (
              <pre className="text-xs mt-2 bg-slate-900 p-2 rounded overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            ) : (
              <p className="text-red-400">No client session</p>
            )}
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-sky-400">Server Session</h4>
            {serverSession ? (
              <pre className="text-xs mt-2 bg-slate-900 p-2 rounded overflow-auto">
                {JSON.stringify(serverSession, null, 2)}
              </pre>
            ) : (
              <p className="text-red-400">No server session data</p>
            )}
          </div>

          {error && (
            <div className="p-2 bg-red-500/20 border border-red-500 text-red-400 rounded">
              Error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 