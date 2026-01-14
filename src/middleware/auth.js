import jwt from 'jsonwebtoken';
import env from '../config/environment.js';

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const secret = env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, error: 'JWT secret not configured' });
    }

    const payload = jwt.verify(token, secret);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name
    };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

