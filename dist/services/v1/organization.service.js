"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const organization_model_1 = __importDefault(require("@models/organization.model"));
const users_model_1 = __importDefault(require("@models/users.model"));
const user_service_1 = require("./user.service");
class OrganizationService {
    constructor() {
        this.organizationModel = organization_model_1.default;
        this.userModel = users_model_1.default;
        this.userService = new user_service_1.UserService();
    }
    async create(data) {
        return this.organizationModel.create(data);
    }
    async mapToUser(data) {
        const org = await this.organizationModel.create(data);
        const updatedUser = this.userModel.updateOne({ _id: data.createdBy }, { $set: { orgId: org._id } }).exec();
        return updatedUser;
    }
    async userInvitation(data) {
        return this.userService.createUserWayInvitation(data);
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