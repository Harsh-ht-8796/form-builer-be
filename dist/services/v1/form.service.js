"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormService = void 0;
const form_model_1 = __importDefault(require("../../models/form.model"));
const dayjs_1 = __importDefault(require("dayjs"));
const constants_1 = require("../../common/constants");
class FormService {
    constructor() {
        this.formModel = form_model_1.default;
    }
    async create(data) {
        return this.formModel.create(data);
    }
    async findAll(findParams) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const mode = (_a = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _a === void 0 ? void 0 : _a.mode;
        // Title search
        if (typeof ((_b = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _b === void 0 ? void 0 : _b.title) === 'string') {
            if (findParams.filter.title) {
                findParams.filter.title = { $regex: findParams.filter.title, $options: 'i' };
            }
            else {
                delete findParams.filter.title;
            }
        }
        // Boolean conversion
        if (((_c = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _c === void 0 ? void 0 : _c.isActive) && typeof ((_d = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _d === void 0 ? void 0 : _d.isActive) === 'string') {
            findParams.filter.isActive = findParams.filter.isActive === 'true';
        }
        // Date range filter
        if (typeof ((_e = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _e === void 0 ? void 0 : _e.fromDate) === 'string' &&
            typeof ((_f = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _f === void 0 ? void 0 : _f.toDate) === 'string') {
            const fromParts = findParams.filter.fromDate.trim().split('-');
            const toParts = findParams.filter.toDate.trim().split('-');
            if (fromParts.length === 3 && toParts.length === 3) {
                const fromDate = (0, dayjs_1.default)(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
                const toDate = (0, dayjs_1.default)(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');
                if (fromDate.isValid() && toDate.isValid()) {
                    findParams.filter.createdAt = { $gte: fromDate.toDate(), $lte: toDate.toDate() };
                    delete findParams.filter.fromDate;
                    delete findParams.filter.toDate;
                }
            }
        }
        // Org restriction
        if ((((_g = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _g === void 0 ? void 0 : _g.mode) && typeof ((_h = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _h === void 0 ? void 0 : _h.mode) === 'string') ||
            (((_j = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _j === void 0 ? void 0 : _j.status) && typeof ((_k = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _k === void 0 ? void 0 : _k.status) === 'string')) {
            findParams.filter.orgId = findParams.user.orgId;
        }
        // Mode to status conversion
        if (mode && typeof mode === 'string') {
            if (mode === 'sent') {
                findParams.filter.status = 'published';
            }
            delete findParams.filter.mode;
        }
        // Projection setup
        let projection = {};
        if (((_l = findParams.filter) === null || _l === void 0 ? void 0 : _l.status) === 'draft') {
            projection = { allowedDomains: 0, allowedEmails: 0 }; // hide completely
        }
        else if (mode === 'sent') {
            projection = {
                allowedDomains: { $slice: 2 },
                allowedEmails: { $slice: 2 },
            }; // only first two elements
        }
        const totalDocs = await this.formModel.countDocuments(findParams.filter);
        const docs = await this.formModel
            .find(findParams.filter)
            .limit(findParams.limit)
            .skip(findParams.limit * findParams.page)
            .select(projection)
            .sort({ createdAt: -1 })
            .lean();
        const modifiedData = docs.map((doc) => (Object.assign(Object.assign({}, doc), { createdAt: (0, dayjs_1.default)(doc.createdAt).format('DD-MM-YYYY'), updatedAt: (0, dayjs_1.default)(doc.updatedAt).format('DD-MM-YYYY') })));
        return {
            docs: modifiedData,
            meta: {
                totalDocs,
                totalPages: Math.ceil(totalDocs / findParams.limit) || 0,
                page: findParams.page,
            },
        };
    }
    async getById(id) {
        return this.formModel.findOne({ _id: id, isActive: true }, {
            allowedDomains: 0,
            allowedEmails: 0,
        });
    }
    async getByIdFilter(id, filter) {
        console.log(Object.assign({ _id: id }, filter));
        return this.formModel.findOne(Object.assign({ _id: id }, filter), {
            allowedDomains: 0,
            allowedEmails: 0,
        });
    }
    async getByIdForStatus(id) {
        return this.formModel.findOne({ _id: id }, {
            allowedDomains: 0,
            allowedEmails: 0,
        });
    }
    async getVisibilityAndEmails(id) {
        var _a;
        const form = await this.formModel
            .findById(id)
            .select('settings.visibility allowedEmails')
            .lean();
        if (!form) {
            return null;
        }
        return {
            visibility: ((_a = form.settings) === null || _a === void 0 ? void 0 : _a.visibility) || [],
            allowedEmails: form.allowedEmails || [],
        };
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
    async findAllReceivedForm(findParams) {
        var _a, _b, _c, _d, _e;
        // Title search
        if (typeof ((_a = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _a === void 0 ? void 0 : _a.title) === 'string') {
            if (findParams.filter.title) {
                findParams.filter.title = { $regex: findParams.filter.title, $options: 'i' };
            }
            else {
                delete findParams.filter.title;
            }
        }
        // Boolean conversion
        if (((_b = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _b === void 0 ? void 0 : _b.isActive) && typeof ((_c = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _c === void 0 ? void 0 : _c.isActive) === 'string') {
            findParams.filter.isActive = findParams.filter.isActive === 'true';
        }
        // Date range filter
        if (typeof ((_d = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _d === void 0 ? void 0 : _d.fromDate) === 'string' &&
            typeof ((_e = findParams === null || findParams === void 0 ? void 0 : findParams.filter) === null || _e === void 0 ? void 0 : _e.toDate) === 'string') {
            const fromParts = findParams.filter.fromDate.trim().split('-');
            const toParts = findParams.filter.toDate.trim().split('-');
            if (fromParts.length === 3 && toParts.length === 3) {
                const fromDate = (0, dayjs_1.default)(`${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`, 'YYYY-MM-DD').startOf('day');
                const toDate = (0, dayjs_1.default)(`${toParts[2]}-${toParts[1]}-${toParts[0]}`, 'YYYY-MM-DD').endOf('day');
                if (fromDate.isValid() && toDate.isValid()) {
                    findParams.filter.createdAt = { $gte: fromDate.toDate(), $lte: toDate.toDate() };
                    delete findParams.filter.fromDate;
                    delete findParams.filter.toDate;
                }
            }
        }
        // Org restriction
        const visibilityQuery = {
            $or: [
                {
                    'settings.visibility': { $in: ['domain_restricted'] },
                    orgId: findParams.user.orgId
                },
                {
                    'settings.visibility': { $in: ['public'] },
                    status: 'published',
                },
                {
                    'settings.visibility': { $in: ['private'] },
                    status: 'published',
                    allowedEmails: { $in: [findParams.user.email] },
                },
            ],
        };
        findParams.filter = Object.assign(Object.assign({}, findParams.filter), visibilityQuery);
        // Projection setup 
        let projection = {};
        projection = {
            allowedDomains: { $slice: 2 },
            allowedEmails: { $slice: 2 },
            title: 1,
            createdBy: 1,
            status: 1,
            createdAt: 1,
            isActive: 1
        }; // only first two elements
        const totalDocs = await this.formModel.countDocuments(findParams.filter);
        const docs = await this.formModel
            .find(findParams.filter)
            .limit(findParams.limit)
            .skip(findParams.limit * findParams.page)
            .select(projection)
            .sort({ createdAt: -1 })
            .populate({
            path: "createdBy",
            select: "username email orgId",
            populate: {
                path: "orgId",
                select: "name",
                model: constants_1.MODELS.ORGANIZATIONS,
            },
        })
            .lean();
        const modifiedData = docs.map((doc) => (Object.assign(Object.assign({}, doc), { createdAt: (0, dayjs_1.default)(doc.createdAt).format('DD-MM-YYYY'), updatedAt: (0, dayjs_1.default)(doc.updatedAt).format('DD-MM-YYYY') })));
        return {
            docs: modifiedData,
            meta: {
                totalDocs,
                totalPages: Math.ceil(totalDocs / findParams.limit) || 0,
                page: findParams.page,
            },
        };
    }
    async getFormStatusById(id) {
        return this.formModel.findById(id, {
            isActive: 1,
            fields: 1
        });
    }
    async deleteCoverOrLogo(id, selectImage) {
        const { image } = selectImage;
        const key = image === "cover" ? "coverImage" : "logoImage";
        return this.formModel.findByIdAndUpdate(id, {
            [key]: ''
        }, {
            new: true
        });
    }
}
exports.FormService = FormService;
//# sourceMappingURL=form.service.js.map