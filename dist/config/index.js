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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt = exports.SENTRY_DSN = exports.isTest = exports.isProduction = exports.CREDENTIALS = exports.CORS_ORIGINS = exports.DATABASE = exports.MONGO_URI = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
const checkEnv = (envVar, defaultValue) => {
    if (!process.env[envVar]) {
        if (defaultValue) {
            return defaultValue;
        }
        throw new Error(`Please define the Enviroment variable"${envVar}"`);
    }
    else {
        return process.env[envVar];
    }
};
exports.PORT = parseInt(process.env.PORT || '3000', 10);
exports.MONGO_URI = checkEnv('MONGO_URI');
exports.DATABASE = checkEnv('DATABASE');
exports.CORS_ORIGINS = JSON.parse(checkEnv('CORS_ORIGINS'));
exports.CREDENTIALS = checkEnv('CREDENTIALS') === 'true';
exports.isProduction = checkEnv('NODE_ENV') === 'production';
exports.isTest = checkEnv('NODE_ENV') === 'test';
exports.SENTRY_DSN = checkEnv('SENTRY_DSN');
exports.jwt = {
    secret: checkEnv('JWT_SECRET'),
    accessExpireIn: checkEnv('JWT_ACCESS_EXPIRE_IN'),
    accessExpireFormat: checkEnv('JWT_ACCESS_EXPIRE_FORMAT'),
    refreshExpireIn: checkEnv('JWT_REFRESH_EXPIRE_IN'),
    refreshExpireFormat: checkEnv('JWT_REFRESH_EXPIRE_FORMAT'),
    resetPasswordExpireIn: checkEnv('JWT_RESET_PASSWORD_EXPIRE_IN'),
    resetPasswordExpireFormat: checkEnv('JWT_RESET_PASSWORD_EXPIRE_FORMAT'),
};
__exportStar(require("./passport"), exports);
//# sourceMappingURL=index.js.map