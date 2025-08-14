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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationController = void 0;
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const roles_1 = require("@common/types/roles");
const index_1 = require("@middlewares/index");
const organization_model_1 = require("@models/organization.model");
const users_model_1 = require("@models/users.model");
const v1_1 = require("@services/v1");
const organization_dto_1 = require("./dtos/organization.dto");
const invite_user_register_dto_1 = require("./dtos/invite-user-register.dto");
let OrganizationController = class OrganizationController {
    constructor() {
        this.organizationService = new v1_1.OrganizationService();
    }
    async create(organizationData, user) {
        var _a;
        const createdBy = (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString();
        const organization = await this.organizationService.create(Object.assign(Object.assign({}, organizationData), { createdBy }));
        return organization;
    }
    //@UseBefore(validationMiddleware(RegisterDto, 'body'))
    async userInvite(userData, userDetails) {
        const modified = userData.users.map(user => {
            return Object.assign(Object.assign({}, user), { orgId: userDetails.orgId });
        });
        await this.organizationService.userInvitation(modified);
        return { message: "User successfully inviated" };
    }
    async mapTouser(organizationData, user) {
        var _a;
        const createdBy = (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString();
        const mappedOrgWithUser = await this.organizationService.mapToUser(Object.assign(Object.assign({}, organizationData), { createdBy }));
        console.log({ mappedOrgWithUser });
        return mappedOrgWithUser;
    }
    async get(userDetails, next) {
        try {
            const organization = await this.organizationService.getById(userDetails.orgId);
            if (!organization) {
                throw new Error('Organization not found');
            }
            return organization;
        }
        catch (err) {
            next(err);
        }
    }
    async update(userDetails, organizationData) {
        const organization = await this.organizationService.update(userDetails.orgId, organizationData);
        if (!organization) {
            throw new Error('Organization not found');
        }
        return organization;
    }
    async delete(id) {
        const organization = await this.organizationService.delete(id);
        if (!organization) {
            throw new Error('Organization not found');
        }
        return organization;
    }
    async getAll() {
        const organizations = await this.organizationService.findAll();
        return organizations;
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, routing_controllers_1.Post)('/'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Create a new organization', responses: organization_dto_1.OrganizationResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(organization_model_1.IOrganization)
    //@UseBefore(validationMiddleware(OrganizationDto, 'body'))
    ,
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN]),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [organization_dto_1.OrganizationDto, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "create", null);
__decorate([
    (0, routing_controllers_1.Post)('/user-invite'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'register new user' }),
    (0, routing_controllers_openapi_1.ResponseSchema)(organization_model_1.IOrganization),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN])
    //@UseBefore(validationMiddleware(RegisterDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_user_register_dto_1.InviteRegisterArrayDto, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "userInvite", null);
__decorate([
    (0, routing_controllers_1.Post)('/map-to-user'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Create a new organization and mapp to user', responses: organization_dto_1.OrganizationResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(organization_model_1.IOrganization)
    //@UseBefore(validationMiddleware(OrganizationDto, 'body'))
    ,
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN]),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [organization_dto_1.OrganizationDto, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "mapTouser", null);
__decorate([
    (0, routing_controllers_1.Get)('/me'),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get an organization by ID', responses: organization_dto_1.OrganizationResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(organization_model_1.IOrganization),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "get", null);
__decorate([
    (0, routing_controllers_1.Put)('/'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Update an existing organization', responses: organization_dto_1.OrganizationResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(organization_model_1.IOrganization)
    //@UseBefore(validationMiddleware(OrganizationDto, 'body'))
    ,
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_model_1.IUser, Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "update", null);
__decorate([
    (0, routing_controllers_1.Delete)('/:id'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Delete an organization by ID', responses: organization_dto_1.OrganizationResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(organization_model_1.IOrganization),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN]),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "delete", null);
__decorate([
    (0, routing_controllers_1.Get)('/'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get all organizations', responses: organization_dto_1.OrganizationResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(organization_model_1.IOrganization),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "getAll", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, routing_controllers_1.JsonController)('/v1/organizations', { transformResponse: false })
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map