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
exports.SubmissionController = void 0;
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const index_1 = require("@middlewares/index");
const v1_1 = require("@services/v1");
const submission_service_1 = require("@services/v1/submission.service");
const submission_model_1 = require("@models/submission.model");
const sumission_dto_1 = require("./dto/sumission.dto");
let SubmissionController = class SubmissionController {
    constructor() {
        this.submissionService = new submission_service_1.SubmissionService();
        this.formService = new v1_1.FormService();
    }
    async submitForm(formId, submissionData, user, next) {
        var _a, _b, _c, _d;
        try {
            console.log('Submitting form with ID:', formId, 'and data:', submissionData);
            const submissionPayload = Object.assign(Object.assign(Object.assign({}, submissionData), { formId }), (user && user._id ? { submittedBy: user._id } : {}));
            const submission = await this.submissionService.create(submissionPayload);
            const form = await this.formService.getById(formId);
            if (!form) {
                throw new Error('Form not found');
            }
            if ((form === null || form === void 0 ? void 0 : form.settings) && ((_a = form === null || form === void 0 ? void 0 : form.settings) === null || _a === void 0 ? void 0 : _a.emailNotifications) && ((_c = (_b = form === null || form === void 0 ? void 0 : form.settings) === null || _b === void 0 ? void 0 : _b.emailNotifications) === null || _c === void 0 ? void 0 : _c.length) > 0) {
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
    async getSubmissionSummary(accessibility) {
        try {
            const summary = await this.submissionService.getSubmissionSummary(accessibility);
            return { summary };
        }
        catch (err) {
            throw new Error('Error fetching submission summary');
        }
    }
    async getSubmissions(formId, limit, skip) {
        return this.submissionService.findSubmissionsByFormId(formId, { limit, page: skip });
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
    (0, routing_controllers_1.UseBefore)((0, index_1.conditionalAuth)('formId')),
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
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission),
    __param(0, (0, routing_controllers_1.QueryParam)('accessibility')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissionSummary", null);
__decorate([
    (0, routing_controllers_1.Get)('/form/:formId'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get submissions by form ID', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission, { isArray: true }),
    (0, routing_controllers_1.UseBefore)((0, index_1.conditionalAuth)()),
    __param(0, (0, routing_controllers_1.Param)('formId')),
    __param(1, (0, routing_controllers_1.QueryParam)('limit')),
    __param(2, (0, routing_controllers_1.QueryParam)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmissions", null);
__decorate([
    (0, routing_controllers_1.Get)('/:id'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get a submission by ID', responses: sumission_dto_1.SubmissionResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(submission_model_1.ISubmission),
    (0, routing_controllers_1.UseBefore)((0, index_1.conditionalAuth)()),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], SubmissionController.prototype, "getSubmission", null);
exports.SubmissionController = SubmissionController = __decorate([
    (0, routing_controllers_1.JsonController)('/v1/submissions', { transformResponse: false })
], SubmissionController);
//# sourceMappingURL=submissions.controller.js.map