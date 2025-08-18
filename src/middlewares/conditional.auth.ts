import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import auth from '@middlewares/form.auth.middleware';
import FormModel from '@models/form.model';
import usersModel from '@models/users.model';

const conditionalAuth = (compareField = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[compareField];
    const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;

    if (!objectId || !Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const form = await FormModel.findById(objectId).lean();
    console.log('Conditional :', objectId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Allow public forms to bypass authentication
    if (form.settings?.visibility?.includes('public')) {
      return next();
    }

    // For private or domain_restricted, verify JWT token
    return auth()(req, res, async (err) => {
      if (err) {
        return next(err); // Pass authentication errors (e.g., 401 Unauthorized)
      }

      // Token is verified, user is attached to req.user by auth middleware
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid or missing Authorization header' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      try {
        // Decode JWT token to get sub (user ID)
        const decoded = jwt.decode(token) as { sub?: string };
        if (!decoded?.sub || !Types.ObjectId.isValid(decoded.sub)) {
          return res.status(401).json({ error: 'Invalid token: No sub found' });
        }
        const userId = decoded.sub;

        // Fetch user from User collection using sub (_id)
        const user = await usersModel.findById(userId).lean();
        if (!user || !user.email) {
          return res.status(401).json({ error: 'User not found or no email associated' });
        }
        const userEmail = user.email;
        console.log({ userEmail });

        // Handle private visibility: check if user email is in allowedEmails
        if (form.settings?.visibility?.includes('private')) {
          if (!form.allowedEmails?.includes(userEmail)) {
            return res.status(401).json({ error: 'Access denied: Email not in allowed list' });
          }
          return next();
        }

        // Handle domain_restricted visibility: check if email domain matches allowedDomains
        if (form.settings?.visibility?.includes('domain_restricted')) {
          const userDomain = userEmail.split('@')[1]?.toLowerCase();
          if (!userDomain || !form.allowedDomains?.some(domain => domain.toLowerCase() === userDomain)) {
            return res.status(403).json({ error: 'Access denied: Email domain not allowed' });
          }
          return next();
        }

        // If visibility is neither public, private, nor domain_restricted
        return res.status(403).json({ error: 'Access denied: Invalid visibility settings' });
      } catch (error) {
        console.error('Token processing error:', error);
        return res.status(401).json({ error: 'Invalid token' });
      }
    });
  };
};

export default conditionalAuth;