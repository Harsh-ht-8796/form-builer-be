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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionController = void 0;
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const v1_1 = require("../../../services/v1");
const submission_service_1 = require("../../../services/v1/submission.service");
const submission_model_1 = require("../../../models/submission.model");
const sumission_dto_1 = require("./dto/sumission.dto");
const conditional_auth_1 = __importDefault(require("../../../middlewares/conditional.auth"));
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const roles_1 = require("../../../common/types/roles");
const form_model_1 = require("../../../models/form.model");
let SubmissionController = class SubmissionController {
    constructor() {
        this.submissionService = new submission_service_1.SubmissionService();
        this.formService = new v1_1.FormService();
    }
    async submitForm(formId, submissionData, user, next) {
        var _a, _b, _c, _d;
        try {
            console.log('Submitting form withID:', formId, 'and data:', submissionData);
            const submissionPayload = Object.assign(Object.assign(Object.assign({}, submissionData), { formId }), (user && user._id ? { submittedBy: user._id, orgId: user.orgId } : {}));
            const form = await this.formService.getById(formId);
            if (!form) {
                throw new Error('Form not found');
            }
            const submission = await this.submissionService.create(submissionPayload);
            if ((form === null || form === void 0 ? void 0 : form.settings) &&
                ((_a = form === null || form === void 0 ? void 0 : form.settings) === null || _a === void 0 ? void 0 : _a.emailNotifications) &&
                ((_c = (_b = form === null || form === void 0 ? void 0 : form.settings) === null || _b === void 0 ? void 0 : _b.emailNotifications) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                const emailData = {
                    to: (_d = form === null || form === void 0 ? void 0 : form.settings) === null || _d === void 0 ? void 0 : _d.emailNotifications,
                    subject: `New submission for form ${form._id}`,
                    body: JSON.stringify(submission.data),
                };
                try {
                    await fetch(process.env.NODE_RED_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(emailData),
                    });
                }
                catch (error) {
                    console.error('Error sending email notification:', error);
                }
            }
            return submission;
        }
        catch (err) {
            next(err);
        }
    }
    async getSubmissionSummary(userDetails, query) {
        try {
            const summary = await this.submissionService.getSubmissionSummary(userDetails, query);
            return { summary };
        }
        catch (err) {
            console.error(err);
            throw new Error('Error fetching submission summary');
        }
    }
    async getOverViewCard(userDetails) {
        const overviewCards = await this.submissionService.getOverViewCard(userDetails);
        return { overviewCards };
    }
    async getSubmissionByFormId(id, query) {
        const { limit, page } = query;
        try {
            const submission = await this.submissionService.findAll({
                formId: id
            }, Number(limit), Number(page));
            if (!submission) {
                throw new Error('Submission not found');
            }
            return submission;
        }
        catch (err) {
            throw new Error('Submission something goes wrong');
        }
    }
    async getSubmissionByQuestion(id, query) {
        const { limit, page } = query;
        try {
            const submission = await this.submissionService.findAll({
                formId: id
            }, Number(limit), Number(page));
            if (!submission) {
                throw new Error('Submission not found');
            }
            return submission;
        }
        catch (err) {
            throw new Error('Submission something goes wrong');
        }
    }
    async getSubmissions(formId, limit, skip) {
        return this.submissionService.findSubmissionsByFormId(formId, { limit, page: skip });
    }
    async getSubmissionsByFormId(formId) {
        const count = await this.submissionService.getSubmisstionCountByFormIdForUser(formId);
        return { count };
    }
    async getSubmission(id, next) {
        try {
            const submission = await this.submissionService.getById(id);
            if (!submission) {
                throw new Error('Submission not found');
            }
            return submission;
        }
        catch (err) {
            next(err);
        }
    }
    async getFormFields(formId, query, next) {
        try {
            const { fieldIds, page, limit } = query;
            const result = await this.submissionService.getFieldAnswers(formId, {
                fieldIds: fieldIds || [], // Default to empty array if fieldIds is undefined
                page,
                limit
            });
            return result;
        }
        catch (err) {
            next(err);
        }
    }
    async getResponseAnswerWisewithUser(formId, query) {
        try {
            const { fieldIds, page, limit } = query;
            const result = await this.submissionService.getFieldAnswersWithUsers(formId, {
                fieldIds: fieldIds || [], // Default to empty array if fieldIds is undefined
                page,
                limit
            });
            return result;
        }
        catch (err) {
            return { messge: "Some thing goees worng" };
        }
    }
    async getFieldAnswersByFieldId(formId, fieldId, query) {
        try {
            const result = await this.submissionService.getFieldAnswersByFieldId(formId, fieldId, query);
            return result;
        }
        catch (err) {
            return { message: 'Something went wrong' };
        }
    }
};
exports.SubmissionController = SubmissionController;
__decorate([
    (0, routing_controllers_1.Post)('/form/:formId'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Submit a form', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission)
    //@UseBefore(validationMiddleware(SubmissionBodyDto, 'body'))
    //@UseBefore(validationMiddleware(SubmissionParamsDto, 'params'))
    ,
    (0, routing_controllers_1.UseBefore)((0, conditional_auth_1.default)('formId')),
    __param(0, (0, routing_controllers_1.Param)('formId')),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sumission_dto_1.SubmissionBodyDto, Object, Function]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "submitForm", null);
__decorate([
    (0, routing_controllers_1.Get)('/summary'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get submission summary', responses: sumission_dto_1.SubmissionSummaryResponseSchema }),
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sumission_dto_1.SubmissionSummaryQueryDto]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissionSummary", null);
__decorate([
    (0, routing_controllers_1.Get)("/overview-cards"),
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getOverViewCard", null);
__decorate([
    (0, routing_controllers_1.Get)('/:id/individual'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get a submission by ID', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sumission_dto_1.SubmissionSummaryQueryIndivialDto]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissionByFormId", null);
__decorate([
    (0, routing_controllers_1.Get)('/:id/submitted-by/question'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get a submission by ID', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sumission_dto_1.SubmissionSummaryQueryIndivialDto]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissionByQuestion", null);
__decorate([
    (0, routing_controllers_1.Get)('/form/:formId'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get submissions by form ID', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, conditional_auth_1.default)()),
    __param(0, (0, routing_controllers_1.Param)('formId')),
    __param(1, (0, routing_controllers_1.QueryParam)('limit')),
    __param(2, (0, routing_controllers_1.QueryParam)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissions", null);
__decorate([
    (0, routing_controllers_1.Get)('/submission-response-by/:formId'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get submissions by form ID', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissionsByFormId", null);
__decorate([
    (0, routing_controllers_1.Get)('/:id'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get a submission by ID', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission),
    (0, routing_controllers_1.UseBefore)((0, conditional_auth_1.default)()),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmission", null);
__decorate([
    (0, routing_controllers_1.Get)('/form/:formId/fields/summary/short-answer'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get specific form fields by IDs with pagination', responses: sumission_dto_1.FieldResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IFormField, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    __param(0, (0, routing_controllers_1.Param)('formId')),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sumission_dto_1.FieldQueryDto, Function]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getFormFields", null);
__decorate([
    (0, routing_controllers_1.Get)('/form/:formId/fields/question'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get specific form fields by IDs with pagination', responses: sumission_dto_1.FieldResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IFormField, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    __param(0, (0, routing_controllers_1.Param)('formId')),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sumission_dto_1.FieldQueryDto]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getResponseAnswerWisewithUser", null);
__decorate([
    (0, routing_controllers_1.Get)('/form/:formId/field/:fieldId/answers'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get answers for a specific form field by formId and fieldId', responses: sumission_dto_1.FieldResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IFormField, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, auth_middleware_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN]),
    __param(0, (0, routing_controllers_1.Param)('formId')),
    __param(1, (0, routing_controllers_1.Param)('fieldId')),
    __param(2, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, sumission_dto_1.FieldQueryDto]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getFieldAnswersByFieldId", null);
exports.SubmissionController = SubmissionController = __decorate([
    (0, routing_controllers_1.JsonController)('/v1/submissions', { transformResponse: false })
], SubmissionController);
//# sourceMappingURL=submissions.controller.js.map