import { Schema } from 'mongoose';

import { UserRole } from './roles';

export interface JwtPayload {
  sub: Schema.Types.ObjectId; // user id
  iat: number; // issued at
  exp: number; // expiration time
  type: string; // token type
  roles?: UserRole[]; // user roles
}
