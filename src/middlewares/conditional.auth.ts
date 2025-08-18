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

    if (!objectId) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Fetch form with only needed fields
    const form = await FormModel.findById(objectId, {
      settings: 1,
      allowedEmails: 1,
      allowedDomains: 1,
    }).lean();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // PUBLIC: query check
    if (await FormModel.exists({ _id: objectId, 'settings.visibility': 'public' })) {
      return next();
    }

    // Require auth for private/domain_restricted
    return auth()(req, res, async (err) => {
      if (err) return next(err);

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing Authorization header' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token) as { sub?: string };
      if (!decoded?.sub || !Types.ObjectId.isValid(decoded.sub)) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await usersModel.findById(decoded.sub).lean();
      if (!user?.email) {
        return res.status(401).json({ error: 'User not found or no email' });
      }

      const userEmail = user.email;
      const userDomain = userEmail.split('@')[1]?.toLowerCase();

      // PRIVATE: use query with $in
      const privateAllowed = await FormModel.exists({
        _id: objectId,
        'settings.visibility': 'private',
        allowedEmails: userEmail,
      });
      if (privateAllowed) return next();

      // DOMAIN_RESTRICTED: use query with $in
      const domainAllowed = await FormModel.exists({
        _id: objectId,
        'settings.visibility': 'domain_restricted',
        allowedDomains: { $in: [userDomain] },
      });
      if (domainAllowed) return next();

      return res.status(403).json({ error: 'Access denied' });
    });
  };
};


export default conditionalAuth;