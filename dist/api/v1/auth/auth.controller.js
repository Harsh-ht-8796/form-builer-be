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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const users_model_1 = require("../../../models/users.model");
const v1_1 = require("../../../services/v1");
const forgotPassword_dto_1 = __importDefault(require("./dtos/forgotPassword.dto"));
const login_dto_1 = __importStar(require("./dtos/login.dto"));
const logout_dto_1 = __importDefault(require("./dtos/logout.dto"));
const refreshToken_dto_1 = __importDefault(require("./dtos/refreshToken.dto"));
const register_dto_1 = __importDefault(require("./dtos/register.dto"));
const resetPassword_dto_1 = __importDefault(require("./dtos/resetPassword.dto"));
const email_1 = require("../../../utils/email");
const template_type_enum_1 = require("../../../common/types/template-type.enum");
const verifyOtp_dto_1 = __importDefault(require("./dtos/verifyOtp.dto"));
const setPassword_dto_1 = __importDefault(require("./dtos/setPassword.dto"));
let AuthController = class AuthController {
    constructor() {
        this.tokenService = new v1_1.TokenService();
        this.userService = new v1_1.UserService();
        this.authService = new v1_1.AuthService();
    }
    //@UseBefore(validationMiddleware(RegisterDto, 'body'))
    async register(userData) {
        const user = await this.userService.createUser(userData);
        const tokens = await this.tokenService.generateAuthTokens(user);
        await (0, email_1.sendEmail)(template_type_enum_1.TemplateType.AdminSuccessfulSignup, { adminName: user.username, email: user.email }, user.email);
        return { user, tokens };
    }
    //@UseBefore(validationMiddleware(LoginDto, 'body'))
    async login(userData) {
        const user = await this.authService.loginUserWithEmailAndPassword(userData.email, userData.password);
        const tokens = await this.tokenService.generateAuthTokens(user);
        return { user, tokens };
    }
    //@UseBefore(validationMiddleware(LogoutDto, 'body'))
    async logout(userData) {
        await this.authService.logout(userData.refreshToken);
        return { message: 'logout success' };
    }
    //@UseBefore(validationMiddleware(RefreshTokenDto, 'body'))
    async refreshToken(userData) {
        const result = await this.authService.refreshAuth(userData.refreshToken);
        return Object.assign({}, result);
    }
    //@UseBefore(validationMiddleware(ForgotPasswordDto, 'body'))
    async forgotPassword(userData) {
        const token = await this.tokenService.generateResetPasswordToken(userData.email);
        // should use email service to send the token to email owner, not return it!
        return { token };
    }
    //@UseBefore(validationMiddleware(ResetPasswordDto, 'body'))
    async resetPassword(userData) {
        await this.authService.resetPassword(userData.token, userData.password);
        return { message: 'password successfully updated' };
    }
    // @ResponseSchema(VerifyOtpResponse)
    // @UseBefore(validationMiddleware(VerifyOtpDto, 'query'))
    async verifyOtp(data) {
        console.log("Verifying OTP for email:", data.email);
        console.log("OTP provided:", data.otp);
        const user = await this.authService.loginUserWithEmailAndPassword(data.email, data.otp);
        const saveToken = await this.tokenService.generateAndSaveAccessToken(data.email);
        if (!user) {
            throw new Error("User not found");
        }
        return { accessToken: saveToken };
    }
    // @UseBefore(validationMiddleware(SetPasswordDto, 'body'))
    async setPassword(data) {
        const user = await this.authService.setPassword(data);
        if (!user) {
            throw new Error("User not found");
        }
        return { message: "Password set successfully" };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, routing_controllers_1.Post)('/register'),
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'register new user' }),
    (0, routing_controllers_openapi_1.ResponseSchema)(users_model_1.IUser)
    //@UseBefore(validationMiddleware(RegisterDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, routing_controllers_1.Post)('/login'),
    (0, routing_controllers_openapi_1.OpenAPI)({
        description: 'user data and tokens',
        responses: login_dto_1.LoginResponseSchema,
    })
    //@UseBefore(validationMiddleware(LoginDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, routing_controllers_1.Post)('/logout'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'logout the user' })
    //@UseBefore(validationMiddleware(LogoutDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logout_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, routing_controllers_1.Post)('/refresh-tokens'),
    (0, routing_controllers_openapi_1.OpenAPI)({ description: 'renew user token and refresh token', responses: login_dto_1.LoginResponseSchema })
    //@UseBefore(validationMiddleware(RefreshTokenDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refreshToken_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, routing_controllers_1.Post)('/forgot-password'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'send reset token to reset the password' })
    //@UseBefore(validationMiddleware(ForgotPasswordDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgotPassword_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, routing_controllers_1.Post)('/reset-password'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'reset user password' })
    //@UseBefore(validationMiddleware(ResetPasswordDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resetPassword_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, routing_controllers_1.Get)('/verify-otp'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'verify OTP and return access token' })
    // @ResponseSchema(VerifyOtpResponse)
    // @UseBefore(validationMiddleware(VerifyOtpDto, 'query'))
    ,
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verifyOtp_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, routing_controllers_1.Post)('/set-password'),
    (0, routing_controllers_openapi_1.OpenAPI)({ summary: 'set user password with OTP verification and update isInitialPasswordUpdated' })
    // @UseBefore(validationMiddleware(SetPasswordDto, 'body'))
    ,
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [setPassword_dto_1.default]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, routing_controllers_1.JsonController)('/v1/auth', { transformResponse: false })
], AuthController);
//# sourceMappingURL=auth.controller.js.map