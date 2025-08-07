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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormResponseSchema = void 0;
const class_validator_1 = require("class-validator");
// OpenAPI response schema for form operations
exports.FormResponseSchema = {
    '200': {
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        orgId: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        createdBy: { type: 'string' },
                        fields: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string' },
                                    label: { type: 'string' },
                                    options: { type: 'array', items: { type: 'string' } },
                                    position: { type: 'number' },
                                    required: { type: 'boolean' },
                                },
                                required: ['type', 'label', 'required'],
                            },
                        },
                        settings: {
                            type: 'object',
                            properties: {
                                backgroundColor: { type: 'string' },
                                headerImage: { type: 'string', nullable: true },
                                emailNotifications: { type: 'array', items: { type: 'string' } },
                                visibility: { type: 'string', enum: ['public', 'private'] },
                            },
                            required: ['backgroundColor', 'emailNotifications', 'visibility'],
                        },
                        status: { type: 'string', enum: ['draft', 'published'] },
                    },
                    required: ['orgId', 'createdBy', 'fields', 'settings', 'status'],
                },
            },
        },
        description: 'Successful response',
    },
    '404': {
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
        description: 'Form not found',
    },
};
class FieldDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FieldDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FieldDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FieldDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FieldDto.prototype, "required", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FieldDto.prototype, "position", void 0);
class SettingsDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SettingsDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SettingsDto.prototype, "headerImage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SettingsDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['public', 'private']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SettingsDto.prototype, "visibility", void 0);
class FormDto {
    constructor() {
        this.status = "draft";
    }
}
exports.default = FormDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FormDto.prototype, "fields", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", SettingsDto)
], FormDto.prototype, "settings", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['draft', 'published']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDto.prototype, "coverImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDto.prototype, "logoImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FormDto.prototype, "allowedDomains", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], FormDto.prototype, "alowedEmails", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormDto.prototype, "createdBy", void 0);
