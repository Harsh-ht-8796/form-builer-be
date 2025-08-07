"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormController = void 0;
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const crypto_1 = __importDefault(require("crypto"));
const roles_1 = require("../../../common/types/roles");
const index_1 = require("../../../middlewares/index");
const form_model_1 = __importStar(require("../../../models/form.model"));
const v1_1 = require("../../../services/v1");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const form_dto_1 = __importStar(require("./dtos/form.dto"));
const form_search_dto_1 = __importDefault(require("./dtos/form-search.dto"));
const multer_1 = __importDefault(require("./multer"));
const is_form_exists_1 = __importDefault(require("../../../middlewares/is.form.exists"));
const file_type_1 = require("file-type");
let FormController = class FormController {
    constructor() {
        this.formService = new v1_1.FormService();
    }
    async create(formData, user) {
        var _a;
        const createdBy = (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(); // Assuming user is attached to the request
        const orgId = user === null || user === void 0 ? void 0 : user.orgId; // Assuming user is attached to the request
        console.log(orgId);
        const form = await this.formService.create(Object.assign(Object.assign(Object.assign({}, formData), { createdBy }), (orgId && orgId ? { orgId: orgId } : {})));
        return form;
    }
    async getAll(limit = 10, page = 0) {
        const { docs, meta } = await this.formService.findAll({}, limit, page);
        return { docs, meta };
    }
    async search(query) {
        const { limit = 10, page = 0 } = query, rest = __rest(query, ["limit", "page"]);
        console.log('Search query:', rest);
        const { docs, meta } = await this.formService.findAll(rest, limit, page);
        return { docs, meta };
    }
    async get(id, next) {
        try {
            const form = await this.formService.getById(id);
            if (!form) {
                throw new Error('Form not found');
            }
            return form;
        }
        catch (err) {
            next(err);
        }
    }
    async update(id, formData) {
        const form = await this.formService.update(id, formData);
        if (!form) {
            throw new Error('Form not found');
        }
        return form;
    }
    async delete(id) {
        const form = await this.formService.delete(id);
        if (!form) {
            throw new Error('Form not found');
        }
        return form;
    }
    async uploadImages(user, id, req) {
        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            throw new routing_controllers_1.BadRequestError('No images uploaded');
        }
        const result = {};
        for (const key of Object.keys(files)) {
            const arr = files[key];
            if (!arr || arr.length === 0)
                continue;
            const file = arr[0];
            const fullPath = path_1.default.join(file.destination, file.filename);
            const buffer = fs_1.default.readFileSync(fullPath);
            const type = await (0, file_type_1.fileTypeFromBuffer)(buffer);
            if (!type || !['image/jpeg', 'image/png', 'image/gif'].includes(type.mime)) {
                fs_1.default.unlinkSync(fullPath);
                throw new routing_controllers_1.BadRequestError(`${key} has invalid content`);
            }
            const hash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
            result[`${key}Url`] = `/uploads/${file.filename}`;
            const updatedForm = await form_model_1.default.updateOne({ _id: id }, { [`${key}`]: `/uploads/${file.filename}` });
            console.log({ updatedForm });
            result[`${key}Hash`] = hash;
        }
        return result;
    }
    async publish(id) {
        const form = await this.formService.publish(id);
        if (!form) {
            throw new Error('Form not found');
        }
        return form;
    }
};
exports.FormController = FormController;
__decorate([
    (0, routing_controllers_1.Post)('/'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Create a new form', responses: form_dto_1.FormResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IForm),
    (0, routing_controllers_1.UseBefore)((0, index_1.validationMiddleware)(form_dto_1.default, 'body')),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_dto_1.default, Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "create", null);
__decorate([
    (0, routing_controllers_1.Get)('/'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get all forms', responses: form_dto_1.FormResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IForm),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole]),
    __param(0, (0, routing_controllers_1.QueryParam)('limit')),
    __param(1, (0, routing_controllers_1.QueryParam)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "getAll", null);
__decorate([
    (0, routing_controllers_1.Get)('/search'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Search forms by title', responses: form_dto_1.FormResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IForm),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_search_dto_1.default]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "search", null);
__decorate([
    (0, routing_controllers_1.Get)('/:id'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Get a form by ID', responses: form_dto_1.FormResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IForm),
    (0, routing_controllers_1.UseBefore)((0, index_1.conditionalAuth)()),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "get", null);
__decorate([
    (0, routing_controllers_1.Put)('/:id'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Update an existing form', responses: form_dto_1.FormResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IForm),
    (0, routing_controllers_1.UseBefore)((0, index_1.validationMiddleware)(form_dto_1.default, 'body')),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __param(1, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "update", null);
__decorate([
    (0, routing_controllers_1.Delete)('/:id'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Delete a form by ID', responses: form_dto_1.FormResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IForm),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "delete", null);
__decorate([
    (0, routing_controllers_1.Post)('/upload-images/:id'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Upload cover and logo images (multipart/form-data)' }),
    (0, routing_controllers_1.UseBefore)(multer_1.default.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'logoImage', maxCount: 1 }
    ])),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.UseBefore)((0, is_form_exists_1.default)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Param)('id')),
    __param(2, (0, routing_controllers_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "uploadImages", null);
__decorate([
    (0, routing_controllers_1.Post)('/:id/publish'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'Publish a form by ID', responses: form_dto_1.FormResponseSchema }),
    (0, routing_controllers_openapi_1.ResponseSchema)(form_model_1.IForm),
    (0, routing_controllers_1.UseBefore)((0, index_1.auth)()),
    (0, routing_controllers_1.Authorized)([roles_1.UserRole.SUPER_ADMIN, roles_1.UserRole.ORG_ADMIN, roles_1.UserRole.TEAM_MEMBER]),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FormController.prototype, "publish", null);
exports.FormController = FormController = __decorate([
    (0, routing_controllers_1.JsonController)('/v1/forms', { transformResponse: false })
], FormController);
//# sourceMappingURL=form.controller.js.map