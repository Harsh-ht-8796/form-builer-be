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
exports.OrganizationService = void 0;
const organization_model_1 = __importDefault(require("@models/organization.model"));
class OrganizationService {
    constructor() {
        this.organizationModel = organization_model_1.default;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.organizationModel.create(data);
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (filter = {}, limit = 10, page = 0) {
            const totalDocs = yield this.organizationModel.countDocuments(filter);
            const docs = yield this.organizationModel
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
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.organizationModel.findById(id);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.organizationModel.findByIdAndUpdate(id, data, { new: true });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.organizationModel.findByIdAndDelete(id);
        });
    }
}
exports.OrganizationService = OrganizationService;
