/**
 * API Documentation Page
 * Displays interactive Swagger UI for API documentation
 */

'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load API documentation:', err);
        setError('Failed to load API documentation');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Documentation</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Interactive documentation for the Starter Template API. 
          You can test endpoints directly from this interface.
        </p>
      </div>
      
      <div className="bg-background border rounded-lg overflow-hidden">
        {spec && (
          <SwaggerUI
            spec={spec}
            deepLinking={true}
            displayOperationId={false}
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={1}
            defaultModelRendering="example"
            displayRequestDuration={true}
            docExpansion="list"
            filter={true}
            showExtensions={true}
            showCommonExtensions={true}
            tryItOutEnabled={true}
          />
        )}
      </div>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <h2 className="font-semibold mb-2">Additional Resources:</h2>
        <ul className="space-y-1">
          <li>• <a href="/api/docs" target="_blank" className="hover:text-primary">Raw OpenAPI Spec (JSON)</a></li>
          <li>• <a href="https://docs.supabase.com/" target="_blank" className="hover:text-primary">Supabase Documentation</a></li>
          <li>• <a href="https://trpc.io/docs" target="_blank" className="hover:text-primary">tRPC Documentation</a></li>
        </ul>
      </div>
    </div>
  );
}