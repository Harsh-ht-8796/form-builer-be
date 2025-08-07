"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const routing_controllers_1 = require("routing-controllers");
const users_model_1 = __importDefault(require("../../models/users.model"));
class UserService {
    constructor() {
        this.userModel = users_model_1.default;
    }
    async isEmailTaken(email) {
        const user = await this.userModel.findOne({ email });
        return !!user;
    }
    async findByRoles(roles) {
        return await this.userModel.find({ roles: { $in: roles } });
    }
    async createUser(userData) {
        const { email } = userData;
        if (await this.isEmailTaken(email)) {
            throw new routing_controllers_1.BadRequestError('Email already Taken');
        }
        const user = await this.userModel.create(Object.assign({}, userData));
        return user;
    }
    async getUserByEmail(email) {
        return await this.userModel.findOne({ email });
    }
    async comparePassword(inputPass, userPass) {
        return await bcrypt_1.default.compare(inputPass, userPass);
    }
    async getById(id) {
        return await this.userModel.findById(id);
    }
    async updateById(id, updateBody) {
        // prevent user change his email
        if (updateBody.email) {
            delete updateBody.email;
        }
        const user = await this.getById(id);
        if (!user) {
            throw new routing_controllers_1.BadRequestError('User not found');
        }
        Object.assign(user, updateBody);
        await user.save();
        return user;
    }
    async findAll(filter = {}, limit = 10, page = 0) {
        const totalDocs = await this.userModel.countDocuments(filter);
        const docs = await this.userModel
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
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map