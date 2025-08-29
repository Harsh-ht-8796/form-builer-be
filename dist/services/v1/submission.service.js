"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionService = void 0;
const submission_model_1 = __importDefault(require("../../models/submission.model"));
const moment_1 = __importDefault(require("moment"));
const form_model_1 = __importDefault(require("../../models/form.model"));
const lodash_1 = require("lodash");
class SubmissionService {
    constructor() {
        this.submissionModel = submission_model_1.default;
        this.formModel = form_model_1.default;
    }
    async create(data) {
        return this.submissionModel.create(data);
    }
    async findAll(filter = {}, limit = 10, page = 0) {
        const totalDocs = await this.submissionModel.countDocuments(filter);
        const docs = await this.submissionModel
            .find(filter)
            .limit(limit)
            .skip(limit * page)
            .sort({ submittedAt: -1 })
            .lean();
        return {
            docs: JSON.parse(JSON.stringify(docs)),
            meta: {
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit) || 0,
                page,
                limit
            },
        };
    }
    async findSubmissionsByFormId(formId, { limit = 10, page = 0, fieldIds }) {
        const query = { formId, };
        const submissions = await this.submissionModel
            .find(query)
            .limit(Math.min(limit, 100))
            .skip(limit * page)
            .lean();
        return { submissions };
    }
    async getById(id) {
        return this.submissionModel.findById(id);
    }
    async update(id, data) {
        return this.submissionModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return this.submissionModel.findByIdAndDelete(id);
    }
    async getSubmissionSummary(userDetails, query) {
        const { accessibility, fromDate, title, toDate } = query;
        const match = {};
        // accessibility filter
        if (accessibility) {
            match.accessibility = accessibility;
        }
        // date filter only if both present
        if (fromDate && toDate) {
            match.submittedAt = {
                $gte: (0, moment_1.default)(fromDate, "DD-MM-YYYY").startOf("day").toDate(),
                $lte: (0, moment_1.default)(toDate, "DD-MM-YYYY").endOf("day").toDate(),
            };
        }
        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: {
                        formId: "$formId",
                        accessibility: "$accessibility",
                    },
                    responseCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "forms",
                    let: { formId: "$_id.formId" },
                    pipeline: [
                        {
                            $match: Object.assign({ $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$formId"] },
                                        { $eq: ["$orgId", userDetails.orgId] },
                                    ],
                                } }, (title
                                ? { title: { $regex: title, $options: "i" } }
                                : {})),
                        },
                        { $project: { title: 1 } },
                    ],
                    as: "form",
                },
            },
            { $unwind: { path: "$form", preserveNullAndEmptyArrays: false } },
            {
                $project: {
                    formId: "$_id.formId",
                    accessibility: "$_id.accessibility",
                    responseCount: 1,
                    formName: "$form.title",
                },
            },
        ];
        // console.log(JSON.stringify(pipeline, null, 2));
        return this.submissionModel.aggregate(pipeline).exec();
    }
    async getOverViewCard(userDetails) {
        // Fetch total number of forms for the user's organization
        const allFormCount = await this.formModel.countDocuments({
            orgId: userDetails.orgId,
        });
        // Fetch total number of submissions for the user's organization
        const totalResponse = await this.submissionModel.countDocuments({
            orgId: userDetails.orgId,
        });
        // Calculate average completion rate for private forms
        let avgCompletionRate = "0%";
        const privateForms = await this.formModel.countDocuments({
            orgId: userDetails.orgId,
            'settings.visibility': { $in: ['private'] },
            status: 'published', // Only consider published forms
        });
        if (privateForms > 0) {
            const privateFormSubmissions = await this.submissionModel.countDocuments({
                orgId: userDetails.orgId,
                accessibility: 'private',
            });
            // Calculate completion rate: (submissions for private forms / private forms)
            // Assuming each form expects at least one submission for completion
            const completionRate = (privateFormSubmissions / privateForms) * 100;
            avgCompletionRate = `${Math.round(completionRate)}%`;
        }
        // Optional: Calculate percentage change (e.g., week-over-week) for forms and responses
        // For simplicity, let's assume we compare with the previous week's data
        const oneWeekAgo = (0, moment_1.default)().subtract(7, 'days').toDate();
        const recentForms = await this.formModel.countDocuments({
            orgId: userDetails.orgId,
            createdAt: { $gte: oneWeekAgo },
        });
        const previousForms = await this.formModel.countDocuments({
            orgId: userDetails.orgId,
            createdAt: { $lt: oneWeekAgo },
        });
        const formGrowth = previousForms > 0 ? ((recentForms / previousForms) * 100).toFixed(1) : "0.0";
        const recentResponses = await this.submissionModel.countDocuments({
            orgId: userDetails.orgId,
            submittedAt: { $gte: oneWeekAgo },
        });
        const previousResponses = await this.submissionModel.countDocuments({
            orgId: userDetails.orgId,
            submittedAt: { $lt: oneWeekAgo },
        });
        const responseGrowth = previousResponses > 0 ? ((recentResponses / previousResponses) * 100).toFixed(1) : "0.0";
        return [
            {
                label: "Total Forms",
                value: allFormCount,
                percentage: `${formGrowth}%`, // Week-over-week growth
                id: "total_form",
            },
            {
                label: "Total Responses",
                value: totalResponse,
                percentage: `${responseGrowth}%`, // Week-over-week growth
                id: "total_response",
            },
            {
                label: "Avg. Completion Rate (Private)",
                value: avgCompletionRate,
                percentage: "N/A", // No growth metric for completion rate
                id: "avg_completion_rate_private",
            },
        ];
    }
    async getFieldAnswers(formId, query) {
        const { page = 0, limit = 10 } = query;
        // Validate formId
        const form = await this.formModel.findById(formId).lean();
        if (!form) {
            throw new Error('Form not found');
        }
        // Ensure page index is within bounds of form.fields
        if (!form.fields || page < 0 || page >= form.fields.length) {
            throw new Error('Invalid field index (page)');
        }
        console.log({ form });
        // Pick field based on page index
        const field = form.fields[page];
        const fieldId = field.id;
        const fieldTitle = field.title;
        console.log({ field });
        // Fetch submissions with pagination for this field
        const totalSubmissions = await this.submissionModel.countDocuments({
            formId,
            [`data.${fieldId}`]: { $exists: true },
        });
        const submissions = await this.submissionModel
            .find({
            formId,
            [`data.${fieldId}`]: { $exists: true },
        })
            .populate({
            path: "submittedBy",
            select: "email",
        })
            .sort({ submittedAt: -1 })
            .lean();
        // Format answers
        const formattedSubmissions = submissions.map(submission => ({
            submissionId: submission._id,
            submittedAt: submission.submittedAt,
            submittedBy: submission.submittedBy,
            answer: (0, lodash_1.isArray)(submission.data[fieldId]) ? submission.data[fieldId] : [submission.data[fieldId]],
        }));
        return {
            submissions: formattedSubmissions,
            field,
            meta: {
                fieldIndex: page, // tells which field you’re looking at
                fieldId,
                totalSubmissions,
                totalPages: Math.ceil(totalSubmissions / limit) || 0,
                page: page !== null && page !== void 0 ? page : 0,
                limit: Math.min(limit, 100),
            },
        };
    }
    async getFieldAnswersWithUsers(formId, query) {
        const { page = 0, limit = 10 } = query;
        // Validate formId
        const form = await this.formModel.findById(formId).lean();
        if (!form) {
            throw new Error("Form not found");
        }
        if (!form.fields || page < 0 || page >= form.fields.length) {
            throw new Error("Invalid field index (page)");
        }
        // Pick field based on page index
        const field = form.fields[page];
        const fieldId = field.id;
        const fieldTitle = field.title;
        // If field type is short-text or long-text, use getFieldAnswers logic
        if (field.type === "short-text" || field.type === "long-text") {
            // Fetch submissions with pagination for this field
            const totalSubmissions = await this.submissionModel.countDocuments({
                formId,
                [`data.${fieldId}`]: { $exists: true },
            });
            const submissions = await this.submissionModel
                .find({
                formId,
                [`data.${fieldId}`]: { $exists: true },
            })
                .populate({
                path: "submittedBy",
                select: "email _id",
            })
                .sort({ submittedAt: -1 })
                .lean();
            // Format answers
            console.log(JSON.stringify(submissions));
            const formattedSubmissions = submissions.map(submission => ({
                submissionId: submission._id,
                submittedAt: submission.submittedAt,
                answer: submission.data[fieldId]
            }));
            return {
                results: formattedSubmissions,
                field: {
                    id: fieldId,
                    title: fieldTitle,
                    type: field.type,
                    options: field.options,
                },
                meta: {
                    totalSubmissions,
                    totalPages: Math.ceil(form.fields.length / limit) || 0,
                    page: page !== null && page !== void 0 ? page : 0,
                    limit: Math.min(limit, 100),
                },
            };
        }
        // Original logic for fields with options (e.g., multiple-choice)
        if (!field.options || !Array.isArray(field.options)) {
            throw new Error("Field does not have options (not multiple-choice type)");
        }
        // Get all submissions where this field has an answer
        const submissions = await this.submissionModel
            .find({
            formId,
            [`data.${fieldId}`]: { $exists: true },
        })
            .populate({
            path: "submittedBy",
            select: "_id email",
        })
            .sort({ submittedAt: -1 })
            .lean();
        // Map option -> array of users
        const optionMap = {};
        // Initialize map with all options (even if no one selected them)
        field.options.forEach((opt) => {
            optionMap[opt] = { option: opt, users: [] };
        });
        // Iterate over submissions and fill users
        submissions === null || submissions === void 0 ? void 0 : submissions.forEach((submission) => {
            const submittedUser = submission.submittedBy;
            const answer = submission.data[fieldId];
            const answers = Array.isArray(answer) ? answer : [answer];
            answers.forEach((ans) => {
                if (optionMap[ans] && submittedUser) {
                    optionMap[ans].users.push({
                        _id: submittedUser._id.toString(),
                        email: submittedUser.email,
                    });
                }
                else {
                    optionMap[ans].users.push({
                        _id: "unknwon id",
                        email: "unknwon email",
                    });
                }
            });
        });
        return {
            field: {
                id: fieldId,
                title: fieldTitle,
                type: field.type,
                options: field.options,
            },
            results: Object.values(optionMap),
            meta: {
                totalSubmissions: submissions.length,
                totalPages: Math.ceil(form.fields.length / limit) || 0,
                page: page !== null && page !== void 0 ? page : 0,
                limit: limit
            },
        };
    }
    async getFieldAnswersByFieldId(formId, fieldId, query) {
        // Validate formId
        const form = await this.formModel.findById(formId).lean();
        if (!form) {
            throw new Error('Form not found');
        }
        // Find the specific field by fieldId
        const field = form.fields.find((f) => f.id === fieldId);
        if (!field) {
            throw new Error('Field not found');
        }
        const fieldTitle = field.title;
        // If field type is short-text or long-text, fetch submissions with pagination
        if (field.type === 'short-text' || field.type === 'long-text') {
            const totalSubmissions = await this.submissionModel.countDocuments({
                formId,
                [`data.${fieldId}`]: { $exists: true },
            });
            const submissions = await this.submissionModel
                .find({
                formId,
                [`data.${fieldId}`]: { $exists: true },
            })
                .populate({
                path: 'submittedBy',
                select: 'email _id',
            })
                .sort({ submittedAt: -1 })
                .lean();
            const formattedSubmissions = submissions.map(submission => ({
                submissionId: submission._id,
                submittedAt: submission.submittedAt,
                answer: submission.data[fieldId],
            }));
            return {
                results: formattedSubmissions,
                field: {
                    id: fieldId,
                    title: fieldTitle,
                    type: field.type,
                    options: field.options,
                },
                meta: {
                    totalSubmissions
                },
            };
        }
        // Logic for fields with options (e.g., multiple-choice)
        if (!field.options || !Array.isArray(field.options)) {
            throw new Error('Field does not have options (not multiple-choice type)');
        }
        const submissions = await this.submissionModel
            .find({
            formId,
            [`data.${fieldId}`]: { $exists: true },
        })
            .populate({
            path: 'submittedBy',
            select: '_id email',
        })
            .sort({ submittedAt: -1 })
            .lean();
        const optionMap = {};
        field.options.forEach((opt) => {
            optionMap[opt] = { option: opt, users: [] };
        });
        submissions === null || submissions === void 0 ? void 0 : submissions.forEach((submission) => {
            const submittedUser = submission.submittedBy;
            const answer = submission.data[fieldId];
            const answers = Array.isArray(answer) ? answer : [answer];
            answers.forEach((ans) => {
                if (optionMap[ans] && submittedUser) {
                    optionMap[ans].users.push({
                        _id: submittedUser._id.toString(),
                        email: submittedUser.email,
                    });
                }
                else {
                    optionMap[ans] = optionMap[ans] || { option: ans, users: [] };
                    optionMap[ans].users.push({
                        _id: 'unknown id',
                        email: 'unknown email',
                    });
                }
            });
        });
        return {
            field: {
                id: fieldId,
                title: fieldTitle,
                type: field.type,
                options: field.options,
            },
            results: Object.values(optionMap),
            meta: {
                totalSubmissions: submissions.length
            },
        };
    }
    async getSubmisstionCountByFormIdForUser(formId) {
        return this.submissionModel.countDocuments({
            formId
        });
    }
}
exports.SubmissionService = SubmissionService;
//# sourceMappingURL=submission.service.js.map