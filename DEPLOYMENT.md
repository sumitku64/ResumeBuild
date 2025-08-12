# Deployment Guide

## Backend Deployment on Render

### 1. Render Service Configuration
- **Service Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node.js
- **Branch**: main
- **Root Directory**: server

### 2. Environment Variables on Render
Set these environment variables in your Render dashboard:

```bash
NODE_ENV=production
PORT=10000
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
GOOGLE_REDIRECT_URI=https://rscans.netlify.app/auth/callback
JWT_SECRET=<GENERATE_A_SECURE_SECRET>
```

**⚠️ Important**: Replace `<YOUR_GOOGLE_CLIENT_ID>` and `<YOUR_GOOGLE_CLIENT_SECRET>` with your actual Google OAuth credentials from the Google Cloud Console.

### 3. Render Service URL
Your backend will be available at: `https://srv-d2de59pr0fns73e0u3pg.onrender.com`

## Frontend Deployment on Netlify

### 1. Netlify Site Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Branch**: main

### 2. Environment Variables on Netlify
Set these environment variables in your Netlify dashboard:

```bash
VITE_GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
VITE_GOOGLE_REDIRECT_URI=https://rscans.netlify.app/auth/callback
VITE_API_BASE_URL=https://srv-d2de59pr0fns73e0u3pg.onrender.com
```

**⚠️ Important**: Replace `<YOUR_GOOGLE_CLIENT_ID>` with your actual Google OAuth client ID from the Google Cloud Console.

### 3. Netlify Site URL
Your frontend will be available at: `https://rscans.netlify.app`

## Google Console Configuration for Production

### Update OAuth 2.0 Client ID settings:

**Authorized JavaScript Origins:**
- `https://rscans.netlify.app`
- `http://localhost:8081` (for local development)

**Authorized Redirect URIs:**
- `https://rscans.netlify.app/auth/callback`
- `http://localhost:8081/auth/callback` (for local development)

## Deployment Steps

### Backend (Render):
1. Ensure your latest code is pushed to GitHub
2. Go to Render dashboard → Your service
3. Set the environment variables listed above
4. Trigger a manual deploy or push to main branch

### Frontend (Netlify):
1. Go to Netlify dashboard → Your site
2. Set the environment variables listed above
3. Go to Deploys → Trigger deploy

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Check that your domains are correctly configured in CORS settings
2. **OAuth Errors**: Verify Google Console redirect URIs match exactly
3. **API 404 Errors**: Ensure VITE_API_BASE_URL points to your Render service
4. **Build Failures**: Check that all environment variables are set

### Checking Deployment:
1. **Backend Health**: Visit `https://srv-d2de59pr0fns73e0u3pg.onrender.com/api/health`
2. **Frontend**: Visit `https://rscans.netlify.app`
3. **OAuth Flow**: Test login from frontend

## Environment Files Summary

- `.env` - Local development
- `.env.production` - Production reference (not used directly in deployment)
- Environment variables set directly in Render/Netlify dashboards for security
