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
exports.SubmissionDto = exports.SubmissionBodyDto = exports.SubmissionParamsDto = exports.SubmissionBaseDto = exports.SubmissionSummaryResponseSchema = exports.SubmissionResponseSchema = void 0;
const class_validator_1 = require("class-validator");
// OpenAPI response schema for submission operations
exports.SubmissionResponseSchema = {
    '200': {
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        formId: { type: 'string' },
                        data: { type: 'object' },
                        submittedBy: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                    required: ['formId', 'data'],
                },
            },
        },
        description: 'Successful response',
    },
    '201': {
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        formId: { type: 'string' },
                        data: { type: 'object' },
                        submittedBy: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                    required: ['formId', 'data'],
                },
            },
        },
        description: 'Submission created successfully',
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
        description: 'Submission or form not found',
    },
    '500': {
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
        description: 'Internal server error',
    },
};
// OpenAPI response schema for submission summary
exports.SubmissionSummaryResponseSchema = {
    '200': {
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            formId: { type: 'string' },
                            responseCount: { type: 'number' },
                            formName: { type: 'string', nullable: true },
                        },
                        required: ['formId', 'responseCount'],
                    },
                },
            },
        },
        description: 'Submission summary retrieved successfully',
    },
    '500': {
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
        description: 'Error fetching submission summary',
    },
};
class SubmissionBaseDto {
}
exports.SubmissionBaseDto = SubmissionBaseDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], SubmissionBaseDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SubmissionBaseDto.prototype, "submittedBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmissionBaseDto.prototype, "accessibility", void 0);
class SubmissionParamsDto {
}
exports.SubmissionParamsDto = SubmissionParamsDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], SubmissionParamsDto.prototype, "formId", void 0);
class SubmissionBodyDto extends SubmissionBaseDto {
}
exports.SubmissionBodyDto = SubmissionBodyDto;
class SubmissionDto extends SubmissionBaseDto {
}
exports.SubmissionDto = SubmissionDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], SubmissionDto.prototype, "formId", void 0);
