"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const organization_model_1 = __importDefault(require("../../models/organization.model"));
class OrganizationService {
    constructor() {
        this.organizationModel = organization_model_1.default;
    }
    async create(data) {
        return this.organizationModel.create(data);
    }
    async findAll(filter = {}, limit = 10, page = 0) {
        const totalDocs = await this.organizationModel.countDocuments(filter);
        const docs = await this.organizationModel
            .find(filter)
            .limit(limit)
            .skip(limit * page)
            .sort({ createdAt: -1 })
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
    async getById(id) {
        return this.organizationModel.findById(id);
    }
    async update(id, data) {
        return this.organizationModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return this.organizationModel.findByIdAndDelete(id);
    }
}
exports.OrganizationService = OrganizationService;
//# sourceMappingURL=organization.service.js.map