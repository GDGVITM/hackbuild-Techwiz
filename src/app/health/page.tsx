'use client';

import { useEffect, useState } from 'react';

export default function HealthCheckPage() {
  const [status, setStatus] = useState({
    frontend: true,
    backend: false,
    database: false,
    error: null as string | null,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'success') {
          setStatus({
            frontend: true,
            backend: true,
            database: data.database === 'connected',
            error: null,
          });
        } else {
          setStatus(prev => ({
            ...prev,
            backend: false,
            database: false,
            error: data.message,
          }));
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          backend: false,
          database: false,
          error: error.message,
        }));
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">System Health Check</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
            <span className="font-medium">Frontend</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status.frontend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.frontend ? 'Running' : 'Down'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
            <span className="font-medium">Backend</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status.backend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.backend ? 'Running' : 'Down'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
            <span className="font-medium">Database</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status.database ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.database ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {status.error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{status.error}</p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}