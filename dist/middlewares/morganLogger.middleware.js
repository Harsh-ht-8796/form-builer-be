"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/middlewares/morganLogger.middleware.ts
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("@utils/logger"));
// Define stream for morgan to write into winston at HTTP level
const stream = {
    write: (message) => logger_1.default.http(message.trim()),
};
// Skip logging in test env if you want
const skip = () => process.env.NODE_ENV === 'test';
// Use 'combined' format or customize
const morganMiddleware = (0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms', { stream, skip });
exports.default = morganMiddleware;
