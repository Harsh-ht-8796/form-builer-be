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
exports.IOrganization = void 0;
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
const constants_1 = require("@common/constants");
const timestamp_interface_1 = __importDefault(require("@common/interfaces/timestamp.interface"));
const toJSON_plugin_1 = __importDefault(require("@utils/toJSON.plugin"));
class IOrganization extends timestamp_interface_1.default {
}
exports.IOrganization = IOrganization;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IOrganization.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IOrganization.prototype, "locality", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], IOrganization.prototype, "createdBy", void 0);
const organizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    locality: { type: String, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: constants_1.MODELS.USERS, required: true },
}, {
    timestamps: true,
});
organizationSchema.plugin(toJSON_plugin_1.default);
exports.default = (0, mongoose_1.model)(constants_1.MODELS.ORGANIZATIONS, organizationSchema);
