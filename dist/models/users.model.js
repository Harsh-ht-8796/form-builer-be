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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRoles = exports.IUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const class_validator_1 = require("class-validator");
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("@common/constants");
const timestamp_interface_1 = __importDefault(require("@common/interfaces/timestamp.interface"));
const roles_1 = require("@common/types/roles");
const toJSON_plugin_1 = __importDefault(require("@utils/toJSON.plugin"));
class IUser extends timestamp_interface_1.default {
}
exports.IUser = IUser;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IUser.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], IUser.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IUser.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IUser.prototype, "isEmailVerified", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", Object)
], IUser.prototype, "orgId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(roles_1.UserRole, { each: true }),
    __metadata("design:type", Array)
], IUser.prototype, "roles", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IUser.prototype, "profileImage", void 0);
class IRoles {
}
exports.IRoles = IRoles;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(roles_1.UserRole, { each: true }),
    __metadata("design:type", Array)
], IRoles.prototype, "roles", void 0);
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        maxlength: 20,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        private: true,
    },
    orgId: {
        type: mongoose_1.Types.ObjectId,
        default: null,
        required: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    roles: {
        type: [String],
        enum: Object.values(roles_1.UserRole),
        default: [roles_1.UserRole.USER],
        required: true,
    },
    profileImage: {
        type: String,
        required: false,
        default: null
    },
}, {
    timestamps: true,
});
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password') && typeof user.password === 'string') {
        user.password = await bcrypt_1.default.hash(user.password, 8);
    }
    next();
});
userSchema.pre('insertMany', async function (next, docs) {
    for (const doc of docs) {
        if (typeof doc.password === 'string') {
            doc.password = await bcrypt_1.default.hash(doc.password, 8);
        }
    }
    next();
});
userSchema.plugin(toJSON_plugin_1.default);
exports.default = mongoose_1.default.model(constants_1.MODELS.USERS, userSchema);
//# sourceMappingURL=users.model.js.map