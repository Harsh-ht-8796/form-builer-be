"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const _decorators_1 = require("../../../decorators");
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const crypto_1 = __importDefault(require("crypto"));
const roles_1 = require("../../../common/types/roles");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const users_model_1 = __importStar(require("../../../models/users.model"));
const v1_1 = require("../../../services/v1");
const form_search_dto_1 = __importDefault(require("./form-search.dto"));
const invite_organization_dto_1 = require("../organizations/dtos/invite-organization.dto");
const multer_1 = __importDefault(require("../form/multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const file_type_1 = require("file-type");
const changePassword_dto_1 = __importDefault(require("./changePassword.dto"));
let UserController = class UserController {
    constructor() {
        this.userService = new v1_1.UserService();
    }
    async getAllUsers() {
        const users = await this.userService.findAll();
        return { users };
    }
    async getAllUsersRoles() {
        const roles = await this.userService.getAllRoles();
        return { roles };
    }
    async getCurrentUser(userDetaills) {
        const user = await this.userService.getById(userDetaills.id);
        return user;
    }
    async getUserByOrg(query, user) {
        const { limit = 10, page = 0, email } = query, rest = __rest(query, ["limit", "page", "email"]);
        const users = await this.userService.findAllByOrg({
            filter: Object.assign({ orgId: user.orgId }, (email ? { email } : {}))
        });
        return { users };
    }
    async getAdmins() {
        const admins = await this.userService.findByRoles([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]);
        return { admins };
    }
    async getTeamMembers() {
        const teamMembers = await this.userService.findByRoles([roles_1.UserRole.TEAM_MEMBER]);
        return { teamMembers };
    }
    async getRegularUsers() {
        const regularUsers = await this.userService.findByRoles([roles_1.UserRole.USER]);
        return { users: regularUsers };
    }
    async deleteProfileImage(user) {
        // 1. Find user in DB
        const userDoc = await users_model_1.default.findById(user.id);
        if (!userDoc || !userDoc.profileImage) {
            throw new routing_controllers_1.BadRequestError('No profile image found to delete');
        }
        // 2. Resolve file path
        const relativePath = userDoc.profileImage.startsWith('/uploads/')
            ? userDoc.profileImage
            : `/uploads/${userDoc.profileImage}`;
        const filePath = path_1.default.join(process.cwd(), relativePath);
        // 3. Delete file from disk (if exists)
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // 4. Update user doc to remove profileImage
        await users_model_1.default.updateOne({ _id: user.id }, { $unset: { profileImage: '' } });
        return {
            message: 'Profile image deleted successfully',
        };
    }
    async delete(id) {
        const user = await this.userService.delete(id);
        if (!user) {
            throw new Error('User not found');
        }
        return { message: "User deleted successfully" };
    }
    async updateUser(userDetaills, updateBody) {
        const user = await this.userService.updateById(userDetaills.id, updateBody);
        return { user };
    }
    async uploadImages(user, req) {
        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            throw new routing_controllers_1.BadRequestError('No images uploaded');
        }
        const result = {};
        for (const key of Object.keys(files)) {
            const arr = files[key];
            if (!arr || arr.length === 0)
                continue;
            const file = arr[0];
            const fullPath = path_1.default.join(file.destination, file.filename);
            const buffer = fs_1.default.readFileSync(fullPath);
            const type = await (0, file_type_1.fileTypeFromBuffer)(buffer);
            if (!type || !['image/jpeg', 'image/png', 'image/gif'].includes(type.mime)) {
                fs_1.default.unlinkSync(fullPath);
                throw new routing_controllers_1.BadRequestError(`${key} has invalid content`);
            }
            const hash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
            result[`${key}Url`] = `/uploads/${file.filename}`;
            const updatedForm = await users_model_1.default.updateOne({ _id: user.id }, { [`${key}`]: `/uploads/${file.filename}` });
            console.log({ updatedForm });
            result[`${key}Hash`] = hash;
        }
        return result;
    }
    //@UseBefore(validationMiddleware(ChangePasswordDto, 'body'))
    async changePassword(userData, currentUser) {
        return await this.userService.changePassword(currentUser.id, userData.oldPassword, userData.newPassword);
    }
};
exports.UserController = UserController;
__decorate([
    (0, routing_controllers_1.Get)('/'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Get all users',
        description: 'Retrieve all users. Requires super admin or org admin role.',
        security: [{ bearerAuth: [] }],
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser, { isArray: true }),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, routing_controllers_1.Get)('/roles'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Get all users roles',
        description: 'Retrieve all users. Requires super admin or org admin role.',
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IRoles, { isArray: true }),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsersRoles", null);
__decorate([
    (0, routing_controllers_1.Get)('/me'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Get current user profile',
        description: 'Retrieve the profile of the currently authenticated user.',
        security: [{ bearerAuth: [] }],
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN]),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getCurrentUser", null);
__decorate([
    (0, routing_controllers_1.Get)('/by-org'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Get current user profile',
        description: 'Retrieve the profile of the currently authenticated user.',
        security: [{ bearerAuth: [] }],
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN]),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_search_dto_1.default, users_model_1.IUser]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserByOrg", null);
__decorate([
    (0, routing_controllers_1.Get)('/admins'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Get all admin users',
        description: 'Retrieve all users with admin privileges. Requires super admin role.',
        security: [{ bearerAuth: [] }],
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, _decorators_1.SuperAdmin)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAdmins", null);
__decorate([
    (0, routing_controllers_1.Get)('/team-members'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Get all team members',
        description: 'Retrieve all team members. Requires org admin or super admin role.',
        security: [{ bearerAuth: [] }],
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, _decorators_1.OrgAdmin)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getTeamMembers", null);
__decorate([
    (0, routing_controllers_1.Get)('/regular-users'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Get all regular users',
        description: 'Retrieve all regular users. Requires team member or higher role.',
        security: [{ bearerAuth: [] }],
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, _decorators_1.TeamMember)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getRegularUsers", null);
__decorate([
    (0, routing_controllers_1.Delete)('/delete-profile-image'),
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteProfileImage", null);
__decorate([
    (0, routing_controllers_1.Delete)('/:id'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Delete a user by ID', responses: invite_organization_dto_1.UserOrganizationResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser),
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN,]),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
__decorate([
    (0, routing_controllers_1.Put)('/'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        summary: 'Update  users',
        description: 'Update  users.',
    }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, routing_controllers_1.Post)('/upload-images'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Upload cover and logo images (multipart/form-data)' }),
    (0, routing_controllers_1.UseBefore)(multer_1.default.fields([
        { name: 'profileImage', maxCount: 1 }
    ])),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadImages", null);
__decorate([
    (0, routing_controllers_1.Post)('/change-password'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Change current user password' })
    //@UseBefore(validationMiddleware(ChangePasswordDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [changePassword_dto_1.default, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
exports.UserController = UserController = __decorate([
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.JsonController)('/v1/users', { transformResponse: false })
], UserController);
//# sourceMappingURL=user.controller.js.map