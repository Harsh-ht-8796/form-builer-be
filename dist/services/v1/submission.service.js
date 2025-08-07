"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionService = void 0;
const submission_model_1 = __importDefault(require("../../models/submission.model"));
class SubmissionService {
    constructor() {
        this.submissionModel = submission_model_1.default;
    }
    async create(data) {
        console.log('Creating submission with data:', data);
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
            },
        };
    }
    async findSubmissionsByFormId(formId, { limit = 10, page = 0 }) {
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
    async getSubmissionSummary(accessibility) {
        const pipeline = [
            ...(accessibility ? [{ $match: { accessibility } }] : []),
            {
                $group: {
                    _id: '$formId',
                    responseCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'forms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'form',
                },
            },
            {
                $unwind: {
                    path: '$form',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    formId: '$_id',
                    responseCount: 1,
                    formName: '$form.title',
                },
            },
        ];
        const summary = this.submissionModel.aggregate(pipeline).exec();
        return summary;
    }
}
exports.SubmissionService = SubmissionService;
//# sourceMappingURL=submission.service.js.map