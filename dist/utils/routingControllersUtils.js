"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizationChecker = authorizationChecker;
exports.currentUserChecker = currentUserChecker;
/**
 * Checks if the user has the required roles for a route.
 * @param action - The routing-controllers action containing the request.
 * @param roles - Array of required roles for the route.
 * @returns True if the user is authorized, false otherwise.
 */
async function authorizationChecker(action, roles) {
    // Extract user from the request (set by passport-jwt)
    const user = action.request.user;
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
async function currentUserChecker(action) {
    // Return the current user from the request (set by passport-jwt)
    return action.request.user;
}
//# sourceMappingURL=routingControllersUtils.js.map