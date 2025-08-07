"use strict";
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
exports.SubmissionService = void 0;
const submission_model_1 = __importDefault(require("@models/submission.model"));
class SubmissionService {
    constructor() {
        this.submissionModel = submission_model_1.default;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Creating submission with data:', data);
            return this.submissionModel.create(data);
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (filter = {}, limit = 10, page = 0) {
            const totalDocs = yield this.submissionModel.countDocuments(filter);
            const docs = yield this.submissionModel
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
        });
    }
    findSubmissionsByFormId(formId_1, _a) {
        return __awaiter(this, arguments, void 0, function* (formId, { limit = 10, page = 0 }) {
            const query = { formId, };
            const submissions = yield this.submissionModel
                .find(query)
                .limit(Math.min(limit, 100))
                .skip(limit * page)
                .lean();
            return { submissions };
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.submissionModel.findById(id);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.submissionModel.findByIdAndUpdate(id, data, { new: true });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.submissionModel.findByIdAndDelete(id);
        });
    }
    getSubmissionSummary(accessibility) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.SubmissionService = SubmissionService;
