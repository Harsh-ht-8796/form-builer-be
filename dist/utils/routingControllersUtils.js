"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizationChecker = authorizationChecker;
exports.currentUserChecker = currentUserChecker;
/**
 * Checks if the user has the required roles for a route.
 * @param action - The routing-controllers action containing the request.
 * @param roles - Array of required roles for the route.
 * @returns True if the user is authorized, false otherwise.
 */
function authorizationChecker(action, roles) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
/**
 * Retrieves the current user from the request.
 * @param action - The routing-controllers action containing the request.
 * @returns The current user or undefined if not authenticated.
 */
function currentUserChecker(action) {
    return __awaiter(this, void 0, void 0, function* () {
        // Return the current user from the request (set by passport-jwt)
        return action.request.user;
    });
}
