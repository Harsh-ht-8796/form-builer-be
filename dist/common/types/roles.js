"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.ROLES = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ORG_ADMIN"] = "org_admin";
    UserRole["TEAM_MEMBER"] = "team_member";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ROLES = Object.values(UserRole);
const hasPermission = (userRole, requiredRole) => {
    const roleHierarchy = {
        [UserRole.SUPER_ADMIN]: 4,
        [UserRole.ORG_ADMIN]: 3,
        [UserRole.TEAM_MEMBER]: 2,
        [UserRole.USER]: 1,
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
exports.hasPermission = hasPermission;
