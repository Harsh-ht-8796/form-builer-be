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
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
class SetPasswordDto {
}
exports.default = SetPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Invalid email address" }),
    __metadata("design:type", String)
], SetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "OTP must be a string" }),
    __metadata("design:type", String)
], SetPasswordDto.prototype, "otp", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "New password must be a string" }),
    (0, class_validator_1.Length)(8, 50, { message: "New password must be between 8 and 50 characters" }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/, {
        message: "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
    __metadata("design:type", String)
], SetPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Access Token string" }),
    __metadata("design:type", String)
], SetPasswordDto.prototype, "accessToken", void 0);
//# sourceMappingURL=setPassword.dto.js.map