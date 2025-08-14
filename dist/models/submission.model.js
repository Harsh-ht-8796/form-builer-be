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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISubmission = void 0;
const mongoose_1 = require("mongoose");
const class_validator_1 = require("class-validator");
const constants_1 = require("@common/constants");
const timestamp_interface_1 = __importDefault(require("@common/interfaces/timestamp.interface"));
const form_model_1 = __importDefault(require("./form.model"));
// Class with validation decorators
class ISubmission extends timestamp_interface_1.default {
}
exports.ISubmission = ISubmission;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ISubmission.prototype, "formId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ISubmission.prototype, "submittedAt", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ISubmission.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ISubmission.prototype, "accessibility", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ISubmission.prototype, "submittedBy", void 0);
// Mongoose schema
const submissionSchema = new mongoose_1.Schema({
    formId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Form', required: true },
    submittedAt: { type: Date, default: Date.now },
    data: { type: mongoose_1.Schema.Types.Mixed, required: true },
    accessibility: { type: String, default: 'public' },
    submittedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});
// Pre-save hook to validate formId
submissionSchema.pre('save', async function (next) {
    try {
        if (this.formId) {
            const formExists = await form_model_1.default.exists({ _id: this.formId });
            if (!formExists) {
                throw new Error('Invalid formId: Form does not exist');
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
// Pre-update hooks to validate formId when updating
submissionSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
    try {
        const update = this.getUpdate();
        if (update.formId) {
            const formExists = await form_model_1.default.exists({ _id: update.formId });
            if (!formExists) {
                throw new Error('Invalid formId: Form does not exist');
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
// Export Mongoose model
exports.default = (0, mongoose_1.model)(constants_1.MODELS.SUBMISSIONS, submissionSchema);
//# sourceMappingURL=submission.model.js.map