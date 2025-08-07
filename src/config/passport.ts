import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';

import { TokenTypes } from '@common/constants';
import { JwtPayload } from '@common/types/jwt-payload';
import Users from '@models/users.model';

import { jwt } from './index';

const jwtOptions: StrategyOptions = {
  secretOrKey: jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  passReqToCallback: false,
};

const jwtVerify = async (payload: JwtPayload, done: (error: any, user?: any) => void) => {
  try {
    if (payload.type !== TokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    const user = await Users.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }

    // If the token has roles, update the user object with them
    if (payload.roles) {
      user.roles = payload.roles;
    }

    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
