import { Request } from 'express';
import { Action } from 'routing-controllers';
import { createParamDecorator } from 'routing-controllers';

import { UserRole } from '@common/types/roles';
import { IUserSchema } from '@models/users.model';

type RoleOptions = {
  requireAll?: boolean;
  allowAdmins?: boolean;
};

export function Roles(roles: UserRole | UserRole[], options: RoleOptions = {}) {
  const rolesArray = Array.isArray(roles) ? roles : [roles];

  return createParamDecorator({
    required: true,
    value: (action: Action) => {
      const request = action.request as Request & { user?: IUserSchema };
      const user = request.user;

      if (!user) {
        throw new Error('User not found in request');
      }

      const userRoles = user.roles || [];

      // If allowAdmins is true and user is a super admin or org admin, allow access
      if (options.allowAdmins !== false) {
        if (userRoles.includes(UserRole.SUPER_ADMIN)) {
          return true;
        }

        // If user is an org admin and we're not explicitly requiring all roles
        if (userRoles.includes(UserRole.ORG_ADMIN) && !options.requireAll) {
          return true;
        }
      }

      // Check if user has all required roles when requireAll is true
      if (options.requireAll) {
        return rolesArray.every(role => userRoles.includes(role));
      }

      // Check if user has any of the required roles when requireAll is false
      return rolesArray.some(role => userRoles.includes(role));
    },
  });
}

// Helper decorators for common role checks
export function SuperAdmin() {
  return Roles(UserRole.SUPER_ADMIN, { allowAdmins: false });
}

export function OrgAdmin() {
  return Roles([UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN], { allowAdmins: false });
}

export function TeamMember() {
  return Roles([UserRole.TEAM_MEMBER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN], { allowAdmins: false });
}

export function User() {
  return Roles([UserRole.USER, UserRole.TEAM_MEMBER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN], { allowAdmins: false });
}
