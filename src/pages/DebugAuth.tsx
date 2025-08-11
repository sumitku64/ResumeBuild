import { useState } from 'react';
import { getGoogleAuthUrl } from '@/lib/googleAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugAuth = () => {
  const [authUrl, setAuthUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generateUrl = () => {
    try {
      const url = getGoogleAuthUrl();
      setAuthUrl(url);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAuthUrl('');
    }
  };

  const testGoogleAuth = () => {
    try {
      window.location.href = getGoogleAuthUrl();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Google OAuth Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Client ID:</strong> {import.meta.env.VITE_GOOGLE_CLIENT_ID || 'Not set'}</p>
            <p><strong>Redirect URI:</strong> {import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'Not set'}</p>
            <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
          </div>

          <div className="space-x-2">
            <Button onClick={generateUrl}>Generate OAuth URL</Button>
            <Button onClick={testGoogleAuth} variant="outline">Test Google Auth</Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {authUrl && (
            <div className="p-4 bg-gray-50 border rounded">
              <strong>Generated URL:</strong>
              <br />
              <code className="text-sm break-all">{authUrl}</code>
              <br />
              <a href={authUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Open in new tab
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuth;
