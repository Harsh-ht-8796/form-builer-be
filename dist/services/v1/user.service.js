"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const routing_controllers_1 = require("routing-controllers");
const users_model_1 = __importDefault(require("@models/users.model"));
const dayjs_1 = __importDefault(require("dayjs"));
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
    async createUserWayInvitation(userData) {
        const emails = userData.map(user => user.email);
        // Check if any of these emails are already taken
        const existing = await this.userModel.findOne({ email: { $in: emails } });
        if (existing) {
            throw new routing_controllers_1.BadRequestError(`Email already taken: ${existing.email}`);
        }
        // Add default password for each user
        const inviteUsers = userData.map(user => (Object.assign(Object.assign({}, user), { password: "Test@123" })));
        const users = await this.userModel.insertMany(inviteUsers);
        return users;
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
        const { username } = updateBody;
        const user = await this.getById(id);
        if (!user) {
            throw new routing_controllers_1.BadRequestError('User not found');
        }
        Object.assign(user, Object.assign(Object.assign({}, user), { username }));
        await user.save();
        return user;
    }
    async getAllRoles() {
        return new Promise((resolve) => {
            resolve([
                { value: "super_admin", label: "Admin" },
                { value: "member", label: "Member" }
            ]);
        });
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
    async findAllByOrg(findParams = {}) {
        const { filter = {}, limit = 10, page = 0, user } = findParams;
        console.log({ findParams });
        // Title (name) search
        if (typeof (filter === null || filter === void 0 ? void 0 : filter.name) === 'string') {
            if (filter.name) {
                filter.name = { $regex: filter.name, $options: 'i' };
            }
            else {
                delete filter.name;
            }
        }
        // Email search
        if (typeof (filter === null || filter === void 0 ? void 0 : filter.email) === 'string') {
            if (filter.email) {
                filter.email = { $regex: filter.email, $options: 'i' };
            }
            else {
                delete filter.email;
            }
        }
        // Boolean conversion for isActive
        if ((filter === null || filter === void 0 ? void 0 : filter.isActive) && typeof filter.isActive === 'string') {
            filter.isActive = filter.isActive === 'true';
        }
        // Date range filter
        if (typeof (filter === null || filter === void 0 ? void 0 : filter.fromDate) === 'string' && typeof (filter === null || filter === void 0 ? void 0 : filter.toDate) === 'string') {
            const fromParts = filter.fromDate.trim().split('-');
            const toParts = filter.toDate.trim().split('-');
            if (fromParts.length === 3 && toParts.length === 3) {
                const fromDate = (0, dayjs_1.default)(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
                const toDate = (0, dayjs_1.default)(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');
                if (fromDate.isValid() && toDate.isValid()) {
                    filter.createdAt = { $gte: fromDate.toDate(), $lte: toDate.toDate() };
                    delete filter.fromDate;
                    delete filter.toDate;
                }
            }
        }
        // Always restrict to current org
        if (user === null || user === void 0 ? void 0 : user.orgId) {
            filter.orgId = user.orgId;
        }
        // Projection setup (optional: hide sensitive fields like password)
        const projection = { password: 0 };
        console.log({ filter, projection });
        const totalDocs = await this.userModel.countDocuments(filter);
        const docs = await this.userModel
            .find(filter)
            .limit(limit)
            .skip(limit * page)
            .select(projection)
            .sort({ createdAt: -1 })
            .lean();
        const modifiedData = docs.map((doc) => (Object.assign(Object.assign({}, doc), { createdAt: (0, dayjs_1.default)(doc.createdAt).format('DD-MM-YYYY'), updatedAt: (0, dayjs_1.default)(doc.updatedAt).format('DD-MM-YYYY') })));
        return {
            docs: modifiedData,
            meta: {
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit) || 0,
                page,
            },
        };
    }
    async delete(id) {
        return this.userModel.findByIdAndDelete(id);
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.getById(userId);
        if (!user) {
            throw new routing_controllers_1.BadRequestError('User not found');
        }
        const isMatch = await this.comparePassword(oldPassword, user.password);
        if (!isMatch) {
            throw new routing_controllers_1.BadRequestError('Old password is incorrect');
        }
        user.password = newPassword; // will be hashed by pre-save hook
        await user.save();
        return { message: 'Password updated successfully' };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map