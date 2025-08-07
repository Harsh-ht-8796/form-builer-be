import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import FormModel from '@models/form.model';

const isFormExists = (compareField='id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[compareField];
    const objectId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
    if (!objectId || !Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const form = await FormModel.findById(objectId).lean();
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    return next();
  };
};

export default isFormExists;
