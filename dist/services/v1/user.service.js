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
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const routing_controllers_1 = require("routing-controllers");
const users_model_1 = __importDefault(require("@models/users.model"));
class UserService {
    constructor() {
        this.userModel = users_model_1.default;
    }
    isEmailTaken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel.findOne({ email });
            return !!user;
        });
    }
    findByRoles(roles) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.find({ roles: { $in: roles } });
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = userData;
            if (yield this.isEmailTaken(email)) {
                throw new routing_controllers_1.BadRequestError('Email already Taken');
            }
            const user = yield this.userModel.create(Object.assign({}, userData));
            return user;
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findOne({ email });
        });
    }
    comparePassword(inputPass, userPass) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(inputPass, userPass);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userModel.findById(id);
        });
    }
    updateById(id, updateBody) {
        return __awaiter(this, void 0, void 0, function* () {
            // prevent user change his email
            if (updateBody.email) {
                delete updateBody.email;
            }
            const user = yield this.getById(id);
            if (!user) {
                throw new routing_controllers_1.BadRequestError('User not found');
            }
            Object.assign(user, updateBody);
            yield user.save();
            return user;
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (filter = {}, limit = 10, page = 0) {
            const totalDocs = yield this.userModel.countDocuments(filter);
            const docs = yield this.userModel
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
        });
    }
}
exports.UserService = UserService;
