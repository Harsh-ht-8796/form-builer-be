import { Action } from 'routing-controllers';

import { UserRole } from '@common/types/roles';
import { IUserSchema } from '@models/users.model';

/**
 * Checks if the user has the required roles for a route.
 * @param action - The routing-controllers action containing the request.
 * @param roles - Array of required roles for the route.
 * @returns True if the user is authorized, false otherwise.
 */
export async function authorizationChecker(action: Action, roles: UserRole[]) {
  // Extract user from the request (set by passport-jwt)
  const user = action.request.user as IUserSchema | undefined;
  // If no user is found, deny access
  if (!user) {
    return false;
  }

  // If no specific roles are required (e.g., @Authorized()), allow any authenticated user
  if (!roles || roles.length === 0) {
    return true;
  }

  // Check if the user's role is included in the required roles
  const isAccesss = roles.some(role => user.get('roles').includes(role));
  return isAccesss;
}

/**
 * Retrieves the current user from the request.
 * @param action - The routing-controllers action containing the request.
 * @returns The current user or undefined if not authenticated.
 */
export async function currentUserChecker(action: Action): Promise<IUserSchema | undefined> {
  // Return the current user from the request (set by passport-jwt)
  return action.request.user as IUserSchema;
}
