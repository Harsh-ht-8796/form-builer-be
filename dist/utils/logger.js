"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/logger.ts
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: 'info', // default level
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    transports: [new winston_1.transports.File({ filename: 'logs/error.log', level: 'error' }), new winston_1.transports.File({ filename: 'logs/combined.log' })],
});
// Console output in dev
if (process.env.NODE_ENV !== 'production') {
    console.log('Logger initialized');
    console.log({ NODE_ENV1: process.env.NODE_ENV });
    logger.info('✅ This is an info log');
    console.log(winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()));
    logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
    }));
}
exports.default = logger;
