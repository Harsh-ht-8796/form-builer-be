import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from 'routing-controllers';

import { UserRole } from '@common/types/roles';
import { IUserSchema } from '@models/users.model';

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: IUserSchema;
  }
}

type RoleMiddlewareOptions = {
  requireAll?: boolean;
  allowAdmins?: boolean;
};

export const checkRole = (requiredRoles: UserRole[], options: RoleMiddlewareOptions = { requireAll: false, allowAdmins: true }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUserSchema;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    // If allowAdmins is true and user is a super admin or org admin, allow access
    if (options.allowAdmins) {
      if (user.roles.includes(UserRole.SUPER_ADMIN)) {
        return next();
      }

      // If user is an org admin and we're not explicitly requiring all roles
      if (user.roles.includes(UserRole.ORG_ADMIN) && !options.requireAll) {
        return next();
      }
    }

    // Check if user has all required roles when requireAll is true
    if (options.requireAll) {
      const hasAllRoles = requiredRoles.every(role => user.roles.includes(role));

      if (!hasAllRoles) {
        throw new ForbiddenError('Insufficient permissions');
      }
    }
    // Check if user has any of the required roles when requireAll is false
    else {
      const hasAnyRole = requiredRoles.some(role => user.roles.includes(role));

      if (!hasAnyRole) {
        throw new ForbiddenError('Insufficient permissions');
      }
    }

    next();
  };
};

// Helper middleware for common role checks
export const requireSuperAdmin = checkRole([UserRole.SUPER_ADMIN], { allowAdmins: false });
export const requireOrgAdmin = checkRole([UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN], { allowAdmins: false });
export const requireTeamMember = checkRole([UserRole.TEAM_MEMBER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN], { allowAdmins: false });
export const requireUser = checkRole([UserRole.USER, UserRole.TEAM_MEMBER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN], { allowAdmins: false });
