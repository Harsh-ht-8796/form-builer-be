"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const _decorators_1 = require("@decorators");
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const roles_1 = require("@common/types/roles");
const auth_middleware_1 = __importDefault(require("@middlewares/auth.middleware"));
const users_model_1 = require("@models/users.model");
const v1_1 = require("@services/v1");
let UserController = class UserController {
    constructor() {
        this.userService = new v1_1.UserService();
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userService.findAll();
            return { users };
        });
    }
    getCurrentUser(user) {
        return { user };
    }
    getAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield this.userService.findByRoles([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]);
            return { admins };
        });
    }
    getTeamMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMembers = yield this.userService.findByRoles([roles_1.UserRole.TEAM_MEMBER]);
            return { teamMembers };
        });
    }
    getRegularUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const regularUsers = yield this.userService.findByRoles([roles_1.UserRole.USER]);
            return { users: regularUsers };
        });
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
    __metadata("design:paramtypes", [users_model_1.IUser]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getCurrentUser", null);
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
exports.UserController = UserController = __decorate([
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.JsonController)('/v1/users', { transformResponse: false })
], UserController);
