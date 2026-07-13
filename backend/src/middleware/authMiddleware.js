const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  // Get token from cookie
  let token = req.cookies.token;
  
  // Fallback to auth header (for API clients/mobile apps)
  if (!token && req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
    token = req.header('Authorization').substring(7);
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded; // Will contain { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token failed, not authorized' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
