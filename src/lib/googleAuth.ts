// Google OAuth configuration for frontend
const googleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/callback',
  scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile', 'openid']
};

// Debug: Log configuration (remove in production)
console.log('Google OAuth Config:', {
  clientId: googleOAuthConfig.clientId,
  redirectUri: googleOAuthConfig.redirectUri,
  hasClientId: !!googleOAuthConfig.clientId
});

// Generate Google OAuth authorization URL
export const getGoogleAuthUrl = () => {
  if (!googleOAuthConfig.clientId) {
    console.error('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
    throw new Error('Google Client ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: googleOAuthConfig.clientId,
    redirect_uri: googleOAuthConfig.redirectUri,
    response_type: 'code',
    scope: googleOAuthConfig.scopes.join(' '),
    access_type: 'offline',
    prompt: 'select_account',
    include_granted_scopes: 'true'
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('Generated Google OAuth URL:', url);
  return url;
};

export { googleOAuthConfig };
export default googleOAuthConfig;
