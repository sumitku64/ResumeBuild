import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with Google",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      if (!code) {
        toast({
          title: "Authentication Error",
          description: "No authorization code received",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        const user = { 
          id: data.user.id, 
          email: data.user.email, 
          name: data.user.name,
          picture: data.user.picture 
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', data.token);

        toast({
          title: "Success",
          description: "Successfully logged in with Google!",
        });

        // Reload the page to update auth context
        window.location.href = '/';
      } catch (error) {
        console.error('Google callback error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete Google authentication",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authenticating...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
