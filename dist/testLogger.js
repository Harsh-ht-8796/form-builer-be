"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./utils/logger"));
logger_1.default.info('✅ This is an info log');
logger_1.default.warn('⚠️ This is a warning log');
logger_1.default.error('❌ This is an error log');
