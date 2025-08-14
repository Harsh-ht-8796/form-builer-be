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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOrganizationResponseSchema = exports.UserOrganizationWithOrgIdDto = void 0;
const class_validator_1 = require("class-validator");
const invite_user_register_dto_1 = __importDefault(require("./invite-user-register.dto"));
class UserOrganizationWithOrgIdDto extends invite_user_register_dto_1.default {
}
exports.UserOrganizationWithOrgIdDto = UserOrganizationWithOrgIdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UserOrganizationWithOrgIdDto.prototype, "orgId", void 0);
exports.UserOrganizationResponseSchema = {
    '201': {
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        user_organization_details: {
                            type: 'object',
                            properties: {
                                _id: {
                                    type: 'string',
                                },
                                email: {
                                    type: 'string',
                                },
                                roles: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                    required: ['organization'],
                },
            },
        },
        description: 'Organization created successfully',
    },
};
//# sourceMappingURL=invite-organization.dto.js.map