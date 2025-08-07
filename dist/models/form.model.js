"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.IForm = exports.IFormField = exports.IFormSettings = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@common/constants");
const organization_model_1 = __importDefault(require("./organization.model"));
const timestamp_interface_1 = __importDefault(require("@common/interfaces/timestamp.interface"));
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class IFormSettings {
}
exports.IFormSettings = IFormSettings;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IFormSettings.prototype, "backgroundColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IFormSettings.prototype, "headerImage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IFormSettings.prototype, "emailNotifications", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['public', 'private', 'domain_restricted']),
    __metadata("design:type", String)
], IFormSettings.prototype, "visibility", void 0);
class IFormField {
}
exports.IFormField = IFormField;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IFormField.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsIn)([
        "short-text",
        "long-text",
        "multiple-choice",
        "dropdown",
        "checkbox"
    ]),
    __metadata("design:type", String)
], IFormField.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IFormField.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IFormField.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsIn)([
        "text",
        "textarea",
        "radio",
        "select",
        "checkbox"
    ]),
    __metadata("design:type", String)
], IFormField.prototype, "fieldType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IFormField.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IFormField.prototype, "required", void 0);
class IForm extends timestamp_interface_1.default {
}
exports.IForm = IForm;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", Object)
], IForm.prototype, "orgId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", Object)
], IForm.prototype, "createdBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IForm.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IForm.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IFormField),
    __metadata("design:type", Array)
], IForm.prototype, "fields", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IForm.prototype, "allowedDomains", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IForm.prototype, "coverImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IForm.prototype, "logoImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IForm.prototype, "coverImage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IForm.prototype, "logoImage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IForm.prototype, "alowedEmails", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => IFormSettings),
    __metadata("design:type", IFormSettings)
], IForm.prototype, "settings", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['draft', 'published']),
    __metadata("design:type", String)
], IForm.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IForm.prototype, "isActive", void 0);
const formSchema = new mongoose_1.Schema({
    orgId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { type: String, default: '' },
    logoImage: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    allowedDomains: { type: [String], default: [] },
    alowedEmails: { type: [String], default: [] },
    fields: [
        {
            id: { type: String, required: true },
            type: { type: String, required: true },
            fieldType: {
                type: String, enum: [
                    "checkbox",
                    "radio",
                    "select",
                    "textarea",
                    "text"
                ], default: 'text', required: true
            }, // Added fieldType for compatibility with FormFieldType
            title: { type: String, required: true },
            options: [String],
            order: { type: Number, default: 0 },
            required: { type: Boolean, default: false },
        },
    ],
    settings: {
        backgroundColor: { type: String, default: 'cyan' },
        headerImage: String,
        emailNotifications: { type: [String], default: [] },
        visibility: { type: String, enum: ['public', 'private', 'domain_restricted'], default: 'private' },
    },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
}, {
    timestamps: true,
});
// Pre-save hook to validate orgId
formSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (this.orgId) {
                const orgExists = yield organization_model_1.default.exists({ _id: this.orgId });
                if (!orgExists) {
                    throw new Error('Invalid orgId: Organization does not exist');
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Pre-update hook to validate orgId for update operations
formSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const update = this.getUpdate();
            if (update.orgId) {
                const orgExists = yield organization_model_1.default.exists({ _id: update.orgId });
                if (!orgExists) {
                    throw new Error('Invalid orgId: Organization does not exist');
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
exports.default = (0, mongoose_1.model)(constants_1.MODELS.FORMS, formSchema);
