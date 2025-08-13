/**
 * API Key Authentication Middleware
 * Protects sensitive rugby match and player data
 */

const authenticate = (req, res, next) => {
  console.log('🔐 AUTH CHECK: Validating API key...');
  
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const expectedKey = process.env.API_KEY;

  // Log headers for debugging (remove in production)
  console.log('Headers received:', {
    'x-api-key': req.headers['x-api-key'] ? '[PRESENT]' : '[MISSING]',
    'authorization': req.headers['authorization'] ? '[PRESENT]' : '[MISSING]'
  });

  if (!expectedKey) {
    console.error('❌ AUTH ERROR: API_KEY environment variable not set');
    return res.status(500).json({ 
      message: 'Server configuration error', 
      error: 'Authentication not properly configured' 
    });
  }

  if (!apiKey) {
    console.log('❌ AUTH FAILED: No API key provided');
    return res.status(401).json({ 
      message: 'Unauthorized: API key required',
      hint: 'Include X-API-Key header or Authorization Bearer token'
    });
  }

  if (apiKey !== expectedKey) {
    console.log('❌ AUTH FAILED: Invalid API key provided');
    return res.status(401).json({ 
      message: 'Unauthorized: Invalid API key'
    });
  }

  console.log('✅ AUTH SUCCESS: Valid API key provided');
  next();
};

module.exports = { authenticate };
