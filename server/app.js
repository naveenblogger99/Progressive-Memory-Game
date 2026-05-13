const express = require('express');
const cookieParser = require('cookie-parser');
const { router: piAuthRouter, requireAuth } = require('./routes/piAuth');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Pi Authentication routes
app.use('/api', piAuthRouter);

// Example protected route
app.get('/api/protected-data', requireAuth, (req, res) => {
  res.json({
    message: 'This is protected data',
    user: req.user,
    data: { example: 'sensitive information' }
  });
});

// Public route example
app.get('/api/public-data', (req, res) => {
  res.json({ message: 'This is public data' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
