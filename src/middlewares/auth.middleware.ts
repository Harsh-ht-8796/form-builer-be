import passport from 'passport';
import { UnauthorizedError } from 'routing-controllers';
import { NextFunction, Request, Response } from 'express';

const verifyCallback = (req : Request, resolve: any, reject: any) => async (err: any, user: any, info: any) => {
  if (err || info || !user) {
    const unauthorizedError = new UnauthorizedError("Please authenticate");
    unauthorizedError.httpCode = 401; // Explicitly set httpCode
    return reject(unauthorizedError);
  }
  req.user = user;

  resolve();
};

const auth = () => async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch(err => next(err));
};

export default auth;
