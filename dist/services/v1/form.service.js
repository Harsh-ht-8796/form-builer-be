"use strict";
// Form Service
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormService = void 0;
const form_model_1 = __importDefault(require("../../models/form.model"));
const dayjs_1 = __importDefault(require("dayjs"));
class FormService {
    constructor() {
        this.formModel = form_model_1.default;
    }
    async create(data) {
        return this.formModel.create(data);
    }
    async findAll(filter = {}, limit = 10, page = 0) {
        if (typeof (filter === null || filter === void 0 ? void 0 : filter.title) === 'string') {
            if (filter === null || filter === void 0 ? void 0 : filter.title) {
                filter.title = { $regex: filter.title, $options: 'i' };
            }
            else {
                delete filter.title;
            }
        }
        if ((filter === null || filter === void 0 ? void 0 : filter.isActive) && typeof (filter === null || filter === void 0 ? void 0 : filter.isActive) === 'string') {
            filter.isActive = filter.isActive === 'true' ? true : false;
        }
        if ((filter === null || filter === void 0 ? void 0 : filter.fromDate) && typeof (filter === null || filter === void 0 ? void 0 : filter.fromDate) === 'string' && (filter === null || filter === void 0 ? void 0 : filter.toDate) && typeof (filter === null || filter === void 0 ? void 0 : filter.toDate) === 'string') {
            const fromParts = filter.fromDate.trim().split('-'); // ['31', '07', '2025']
            const toParts = filter.toDate.trim().split('-');
            if (fromParts.length === 3 && toParts.length === 3) {
                const fromDate = (0, dayjs_1.default)(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
                const toDate = (0, dayjs_1.default)(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');
                if (fromDate.isValid() && toDate.isValid()) {
                    filter.createdAt = { $gte: new Date(fromDate.toDate()), $lte: new Date(toDate.toDate()) };
                    delete filter.fromDate;
                    delete filter.toDate;
                }
            }
        }
        const totalDocs = await this.formModel.countDocuments(filter);
        const docs = await this.formModel
            .find(filter)
            .limit(limit)
            .skip(limit * page)
            .select({ allowedDomains: 0, allowedEmails: 0 }) // Exclude sensitive fields
            .sort({ createdAt: -1 })
            .lean();
        const modifedData = JSON.parse(JSON.stringify(docs)).map((doc) => {
            return Object.assign(Object.assign({}, doc), { createdAt: (0, dayjs_1.default)(doc.createdAt).format('DD-MM-YYYY').toString(), updatedAt: (0, dayjs_1.default)(doc.createdAt).format('DD-MM-YYYY').toString() });
        });
        return {
            docs: modifedData,
            meta: {
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit) || 0,
                page,
            },
        };
    }
    async getById(id) {
        return this.formModel.findById(id, {
            allowedDomains: 0,
            alowedEmails: 0,
        });
    }
    async update(id, data) {
        return this.formModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return this.formModel.findByIdAndDelete(id);
    }
    async publish(id) {
        return this.formModel.findByIdAndUpdate(id, { status: 'published' }, { new: true });
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map