"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const routing_controllers_1 = require("routing-controllers");
const constants_1 = require("../../common/constants");
const tokens_model_1 = __importDefault(require("../../models/tokens.model"));
const v1_1 = require("../v1");
class AuthService {
    constructor() {
        this.tokenModel = tokens_model_1.default;
        this.userService = new v1_1.UserService();
        this.tokenService = new v1_1.TokenService();
    }
    async loginUserWithEmailAndPassword(email, password) {
        const user = await this.userService.getUserByEmail(email);
        if (!user || !(await this.userService.comparePassword(password, user.password))) {
            throw new routing_controllers_1.UnauthorizedError('Invalid credentials');
        }
        return user;
    }
    async logout(refreshToken) {
        const token = await this.tokenModel.findOne({ token: refreshToken, type: constants_1.TokenTypes.REFRESH, blacklisted: false });
        if (!token) {
            throw new routing_controllers_1.NotFoundError('Not Found');
        }
        await token.deleteOne();
    }
    async refreshAuth(refreshToken) {
        try {
            const refreshTokenDoc = await this.tokenService.verifyToken(refreshToken, constants_1.TokenTypes.REFRESH);
            const user = await this.userService.getById(refreshTokenDoc.userId);
            if (!user) {
                throw new Error();
            }
            await refreshTokenDoc.deleteOne();
            const tokens = await this.tokenService.generateAuthTokens(user);
            return { user, tokens };
        }
        catch (error) {
            if (error.message === 'Token not found' || error.message === 'jwt expired') {
                throw new routing_controllers_1.UnauthorizedError('Token not found');
            }
            throw new routing_controllers_1.UnauthorizedError('Please authenticate');
        }
    }
    async resetPassword(token, password) {
        try {
            const tokenDoc = await this.tokenService.verifyToken(token, constants_1.TokenTypes.RESET_PASSWORD);
            const user = await this.userService.getById(tokenDoc.userId);
            if (!user) {
                throw new routing_controllers_1.NotFoundError('User not found');
            }
            await this.userService.updateById(user.id, { password });
            await this.tokenModel.deleteMany({ userId: user.id });
        }
        catch (error) {
            if (error.message === 'Token not found' || error.message === 'jwt expired') {
                throw new routing_controllers_1.UnauthorizedError('Token not found');
            }
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map