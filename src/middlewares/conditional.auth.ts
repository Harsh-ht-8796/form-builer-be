import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import auth from '@middlewares/form.auth.middleware';
import FormModel from '@models/form.model';
import usersModel from '@models/users.model';

const conditionalAuth = (compareField = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Validate form ID
    const id = req.params[compareField];
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const objectId = new Types.ObjectId(id);

    // Fetch form from database
    let form;
    try {
      form = await FormModel.findById(objectId).lean();
      console.log('Conditional :', objectId);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
    } catch (error) {
      console.error('Form query error:', error);
      return res.status(500).json({ error: 'Internal server error: Failed to fetch form' });
    }

    // Check visibility (default to private if settings or visibility is missing)
    const visibility = Array.isArray(form.settings?.visibility) ? form.settings.visibility : [];
    if (visibility.includes('public')) {
      return next(); // Allow public forms to bypass authentication
    }

    // For private or domain_restricted, verify JWT token
    return auth()(req, res, async (err) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({ error: 'Unauthorized: Authentication failed' });
      }

      // Extract and validate token
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
        console.log({ decoded });
        if (!decoded?.sub || !Types.ObjectId.isValid(decoded.sub)) {
          return res.status(401).json({ error: 'Invalid token: Invalid or missing sub' });
        }
        const userId = decoded.sub;

        // Fetch user from User collection
        let user;
        try {
          user = await usersModel.findById(userId).lean();
          if (!user || !user.email) {
            return res.status(401).json({ error: 'User not found or no email associated' });
          }
        } catch (error) {
          console.error('User query error:', error);
          return res.status(500).json({ error: 'Internal server error: Failed to fetch user' });
        }
        const userEmail = user.email.toLowerCase(); // Normalize email
        console.log({ userEmail });

        // Handle private visibility
        if (visibility.includes('private')) {
          const allowedEmails = Array.isArray(form.allowedEmails)
            ? form.allowedEmails.map(email => email.toLowerCase())
            : [];
          // if (!allowedEmails.length) {
          //   return res.status(403).json({ error: 'Access denied: No allowed emails configured' });
          // }
          // if (!allowedEmails.includes(userEmail)) {
          //   return res.status(403).json({ error: 'Access denied: Email not in allowed list' });
          // }
          return next();
        }

        // Handle domain_restricted visibility
        if (visibility.includes('domain_restricted')) {
          const userDomain = userEmail.split('@')[1]?.toLowerCase();
          const allowedDomains = Array.isArray(form.allowedDomains)
            ? form.allowedDomains.map(domain => domain.toLowerCase())
            : [];
          if (!userDomain) {
            return res.status(401).json({ error: 'Invalid email: No domain found' });
          }
          if (!allowedDomains.length) {
            return res.status(403).json({ error: 'Access denied: No allowed domains configured' });
          }
          if (!allowedDomains.some(domain => domain === userDomain)) {
            return res.status(403).json({ error: 'Access denied: Email domain not allowed' });
          }
          return next();
        }

        // Handle unexpected visibility values
        return res.status(403).json({ error: 'Access denied: Invalid visibility settings' });
      } catch (error) {
        console.error('Token processing error:', error);
        return res.status(401).json({ error: 'Invalid or malformed token' });
      }
    });
  };
};

export default conditionalAuth;