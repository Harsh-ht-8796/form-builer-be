"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
const routing_controllers_1 = require("routing-controllers");
const constants_1 = require("../../common/constants");
const _config_1 = require("../../config");
const tokens_model_1 = __importDefault(require("../../models/tokens.model"));
const user_service_1 = require("./user.service");
class TokenService {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    async generateAuthTokens(user) {
        const accessTokenExpire = (0, moment_1.default)().add(_config_1.jwt.accessExpireIn, _config_1.jwt.accessExpireFormat);
        const accessToken = this.generateToken(user.id, accessTokenExpire.unix(), constants_1.TokenTypes.ACCESS);
        const refreshTokenExpire = (0, moment_1.default)().add(_config_1.jwt.refreshExpireIn, _config_1.jwt.refreshExpireFormat);
        const refreshToken = this.generateToken(user.id, refreshTokenExpire.unix(), constants_1.TokenTypes.REFRESH);
        await this.saveToken(refreshToken, user.id, refreshTokenExpire.toDate(), constants_1.TokenTypes.REFRESH);
        return {
            access: {
                token: accessToken,
                expires: accessTokenExpire.unix(),
            },
            refresh: {
                token: refreshToken,
                expire: refreshTokenExpire.unix(),
            },
        };
    }
    generateToken(userId, expires, type) {
        const payload = {
            sub: userId,
            iat: (0, moment_1.default)().unix(),
            exp: expires,
            type,
        };
        return jsonwebtoken_1.default.sign(payload, _config_1.jwt.secret);
    }
    async saveToken(token, userId, expires, type, blacklisted = false) {
        return await tokens_model_1.default.create({
            token,
            userId,
            expires,
            type,
            blacklisted,
        });
    }
    async verifyToken(token, type) {
        const payload = jsonwebtoken_1.default.verify(token, _config_1.jwt.secret);
        const tokenDoc = await tokens_model_1.default.findOne({ token, type, userId: payload.sub, blacklisted: false });
        if (!tokenDoc) {
            throw new Error('Token not found');
        }
        return tokenDoc;
    }
    async generateResetPasswordToken(email) {
        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            throw new routing_controllers_1.NotFoundError('User not exists with this email');
        }
        const expireIn = (0, moment_1.default)().add(_config_1.jwt.resetPasswordExpireIn, _config_1.jwt.resetPasswordExpireFormat);
        const resetPasswordToken = this.generateToken(user.id, expireIn.unix(), constants_1.TokenTypes.RESET_PASSWORD);
        await this.saveToken(resetPasswordToken, user.id, expireIn.toDate(), constants_1.TokenTypes.RESET_PASSWORD);
        return resetPasswordToken;
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=token.service.js.map