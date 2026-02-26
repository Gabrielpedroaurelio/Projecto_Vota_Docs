/**
 * JWT Authentication Middleware
 * 
 * Verifies if the token sent in headers is valid and authenticates the request,
 * attaching user data to the req object.
 */

import jwt from 'jsonwebtoken';

/**
 * Main authentication middleware
 */
export const authenticateToken = (req, res, next) => {
  // Extract token from common headers
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user data (id, type) to request
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Aliases for compatibility
export const authMiddleware = authenticateToken;
export default authenticateToken;
