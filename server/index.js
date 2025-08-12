const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// In-memory user storage (replace with database in production)
const users = new Map();
let userIdCounter = 1;

// Configure CORS for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rscans.netlify.app', 'https://srv-d2de59pr0fns73e0u3pg.onrender.com']
    : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: userIdCounter++,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.set(user.id, user);

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth login route
app.get('/api/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
  ];

  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(authUrl);
});

app.post('/api/auth/google/callback', async (req, res) => {
  try {
    console.log('Google callback received:', req.body);
    const { code } = req.body;

    if (!code) {
      console.error('No authorization code provided');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Exchanging code for tokens...');
    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    console.log('Tokens received:', { 
      access_token: tokens.access_token ? 'present' : 'missing',
      id_token: tokens.id_token ? 'present' : 'missing'
    });
    
    googleClient.setCredentials(tokens);

    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }

    console.log('Verifying ID token...');
    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('User payload received:', {
      email: payload.email,
      name: payload.name,
      sub: payload.sub
    });

    const googleUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub
    };

    // Check if user exists
    let user = Array.from(users.values()).find(u => u.email === googleUser.email);
    
    if (!user) {
      console.log('Creating new user for:', googleUser.email);
      // Create new user
      user = {
        id: userIdCounter++,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        googleId: googleUser.googleId,
        createdAt: new Date()
      };
      users.set(user.id, user);
    } else {
      console.log('Updating existing user:', googleUser.email);
      // Update existing user with Google info
      user.picture = googleUser.picture;
      user.googleId = googleUser.googleId;
    }

    // Generate token
    const token = generateToken(user);
    console.log('Authentication successful for:', user.email);

    res.json({
      message: 'Google authentication successful',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        picture: user.picture 
      },
      token
    });
  } catch (error) {
    console.error('Google callback error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Google authentication failed',
      details: error.message 
    });
  }
});

// GET route for Google OAuth callback (for direct redirects from Google)
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub
    };

    // Check if user exists
    let user = Array.from(users.values()).find(u => u.email === googleUser.email);
    
    if (!user) {
      // Create new user
      user = {
        id: userIdCounter++,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        googleId: googleUser.googleId,
        createdAt: new Date()
      };
      users.set(user.id, user);
    } else {
      // Update existing user with Google info
      user.picture = googleUser.picture;
      user.googleId = googleUser.googleId;
    }

    // Generate token
    const token = generateToken(user);

    // Redirect to frontend with token
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://rscans.netlify.app' 
      : 'http://localhost:8080';
    
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    }))}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://rscans.netlify.app' 
      : 'http://localhost:8080';
    res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
  }
});

// Protected route example
app.get('/api/user/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Profile data',
    user: req.user
  });
});

// Resume analysis endpoint
app.post('/api/resume/analyze', verifyToken, (req, res) => {
  const { resumeText, fileName } = req.body;
  
  // Here you would implement your resume analysis logic
  // For now, return a mock response
  res.json({
    message: 'Resume analyzed successfully',
    analysis: {
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      sections: ['Contact', 'Experience', 'Education', 'Skills'],
      suggestions: [
        'Add more quantifiable achievements',
        'Include relevant keywords',
        'Improve formatting consistency'
      ]
    }
  });
});

// User preferences endpoint
app.post('/api/user/preferences', verifyToken, (req, res) => {
  const { preferences } = req.body;
  
  // Here you would save user preferences to database
  res.json({
    message: 'Preferences saved successfully',
    preferences
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
