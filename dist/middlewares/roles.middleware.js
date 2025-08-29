"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = exports.requireTeamMember = exports.requireOrgAdmin = exports.requireSuperAdmin = exports.checkRole = void 0;
const routing_controllers_1 = require("routing-controllers");
const roles_1 = require("../common/types/roles");
const checkRole = (requiredRoles, options = { requireAll: false, allowAdmins: true }) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            throw new routing_controllers_1.ForbiddenError('Authentication required');
        }
        // If allowAdmins is true and user is a super admin or org admin, allow access
        if (options.allowAdmins) {
            if (user.roles.includes(roles_1.UserRole.SUPER_ADMIN)) {
                return next();
            }
            // If user is an org admin and we're not explicitly requiring all roles
            if (user.roles.includes(roles_1.UserRole.ORG_ADMIN) && !options.requireAll) {
                return next();
            }
        }
        // Check if user has all required roles when requireAll is true
        if (options.requireAll) {
            const hasAllRoles = requiredRoles.every(role => user.roles.includes(role));
            if (!hasAllRoles) {
                throw new routing_controllers_1.ForbiddenError('Insufficient permissions');
            }
        }
        // Check if user has any of the required roles when requireAll is false
        else {
            const hasAnyRole = requiredRoles.some(role => user.roles.includes(role));
            if (!hasAnyRole) {
                throw new routing_controllers_1.ForbiddenError('Insufficient permissions');
            }
        }
        next();
    };
};
exports.checkRole = checkRole;
// Helper middleware for common role checks
exports.requireSuperAdmin = (0, exports.checkRole)([roles_1.UserRole.SUPER_ADMIN], { allowAdmins: false });
exports.requireOrgAdmin = (0, exports.checkRole)([roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.SUPER_ADMIN], { allowAdmins: false });
exports.requireTeamMember = (0, exports.checkRole)([roles_1.UserRole.TEAM_MEMBER, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.SUPER_ADMIN], { allowAdmins: false });
exports.requireUser = (0, exports.checkRole)([roles_1.UserRole.USER, roles_1.UserRole.TEAM_MEMBER, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.SUPER_ADMIN], { allowAdmins: false });
//# sourceMappingURL=roles.middleware.js.map