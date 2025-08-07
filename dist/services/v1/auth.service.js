"use strict";
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
exports.AuthService = void 0;
const routing_controllers_1 = require("routing-controllers");
const constants_1 = require("@common/constants");
const tokens_model_1 = __importDefault(require("@models/tokens.model"));
const v1_1 = require("@services/v1");
class AuthService {
    constructor() {
        this.tokenModel = tokens_model_1.default;
        this.userService = new v1_1.UserService();
        this.tokenService = new v1_1.TokenService();
    }
    loginUserWithEmailAndPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.getUserByEmail(email);
            if (!user || !(yield this.userService.comparePassword(password, user.password))) {
                throw new routing_controllers_1.UnauthorizedError('Invalid credentials');
            }
            return user;
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.tokenModel.findOne({ token: refreshToken, type: constants_1.TokenTypes.REFRESH, blacklisted: false });
            if (!token) {
                throw new routing_controllers_1.NotFoundError('Not Found');
            }
            yield token.deleteOne();
        });
    }
    refreshAuth(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshTokenDoc = yield this.tokenService.verifyToken(refreshToken, constants_1.TokenTypes.REFRESH);
                const user = yield this.userService.getById(refreshTokenDoc.userId);
                if (!user) {
                    throw new Error();
                }
                yield refreshTokenDoc.deleteOne();
                const tokens = yield this.tokenService.generateAuthTokens(user);
                return { user, tokens };
            }
            catch (error) {
                if (error.message === 'Token not found' || error.message === 'jwt expired') {
                    throw new routing_controllers_1.UnauthorizedError('Token not found');
                }
                throw new routing_controllers_1.UnauthorizedError('Please authenticate');
            }
        });
    }
    resetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenDoc = yield this.tokenService.verifyToken(token, constants_1.TokenTypes.RESET_PASSWORD);
                const user = yield this.userService.getById(tokenDoc.userId);
                if (!user) {
                    throw new routing_controllers_1.NotFoundError('User not found');
                }
                yield this.userService.updateById(user.id, { password });
                yield this.tokenModel.deleteMany({ userId: user.id });
            }
            catch (error) {
                if (error.message === 'Token not found' || error.message === 'jwt expired') {
                    throw new routing_controllers_1.UnauthorizedError('Token not found');
                }
                throw error;
            }
        });
    }
}
exports.AuthService = AuthService;
