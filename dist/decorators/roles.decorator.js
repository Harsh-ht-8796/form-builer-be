"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = Roles;
exports.SuperAdmin = SuperAdmin;
exports.OrgAdmin = OrgAdmin;
exports.TeamMember = TeamMember;
exports.User = User;
const routing_controllers_1 = require("routing-controllers");
const roles_1 = require("@common/types/roles");
function Roles(roles, options = {}) {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return (0, routing_controllers_1.createParamDecorator)({
        required: true,
        value: (action) => {
            const request = action.request;
            const user = request.user;
            if (!user) {
                throw new Error('User not found in request');
            }
            const userRoles = user.roles || [];
            // If allowAdmins is true and user is a super admin or org admin, allow access
            if (options.allowAdmins !== false) {
                if (userRoles.includes(roles_1.UserRole.SUPER_ADMIN)) {
                    return true;
                }
                // If user is an org admin and we're not explicitly requiring all roles
                if (userRoles.includes(roles_1.UserRole.ORG_ADMIN) && !options.requireAll) {
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
function SuperAdmin() {
    return Roles(roles_1.UserRole.SUPER_ADMIN, { allowAdmins: false });
}
function OrgAdmin() {
    return Roles([roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.SUPER_ADMIN], { allowAdmins: false });
}
function TeamMember() {
    return Roles([roles_1.UserRole.TEAM_MEMBER, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.SUPER_ADMIN], { allowAdmins: false });
}
function User() {
    return Roles([roles_1.UserRole.USER, roles_1.UserRole.TEAM_MEMBER, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.SUPER_ADMIN], { allowAdmins: false });
}
//# sourceMappingURL=roles.decorator.js.map