# Resume Builder with Google OAuth

A modern resume builder application with Google OAuth authentication and secure user management.

## Features

- 🔐 **Google OAuth Authentication**: Secure authentication with Google accounts
- 📧 **Email/Password Auth**: Traditional email and password authentication
- 📄 **Resume Upload**: Secure resume upload for authenticated users
- 📊 **Resume Analysis**: AI-powered resume feedback and scoring
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- 🔒 **Private Routes**: Protected routes requiring authentication

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API or Google Identity API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set authorized redirect URIs to: `http://localhost:8080/auth/callback`
6. Copy Client ID and Client Secret
7. Create `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
8. Update `.env` with your Google OAuth credentials

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend Setup

```bash
# Install server dependencies
npm run server:install

# Create server environment file
cd server && cp .env.example .env

# Update server/.env with your Google OAuth credentials

# Start server in development mode
npm run server:dev
```

## Environment Variables

### Frontend (.env)
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback
VITE_API_BASE_URL=http://localhost:5000
```

### Backend (server/.env)
```
PORT=5000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback
JWT_SECRET=your-super-secret-jwt-key
```

## Authentication Flow

1. **Unauthenticated Users**: Redirected to login page
2. **Login Options**: Email/password or Google OAuth
3. **Google OAuth**: Redirects to Google, then back to `/auth/callback`
4. **Protected Routes**: Dashboard, resume analysis, etc.
5. **Resume Upload**: Only available to authenticated users

## Available Scripts

- `npm run dev` - Start frontend development server (port 8080)
- `npm run server:dev` - Start backend development server (port 5000)
- `npm run build` - Build for production
- `npm run server:install` - Install server dependencies

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Authentication**: Google OAuth 2.0 with JWT tokens
- **UI Components**: Radix UI, Lucide Icons
- **Backend**: Node.js, Express, Google Auth Library
- **State Management**: React Context API
