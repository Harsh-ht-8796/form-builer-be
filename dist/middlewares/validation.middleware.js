"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const HttpException_1 = __importDefault(require("@exceptions/HttpException"));
const getAllNestedErrors = (error) => {
    if (error.constraints) {
        return Object.values(error.constraints).join(', ');
    }
    if (error.children && error.children.length > 0) {
        return error.children.map(getAllNestedErrors).join(', ');
    }
    return '';
};
const validationMiddleware = (type, value = 'body', skipMissingProperties = false, whitelist = true, forbidNonWhitelisted = true) => {
    console.log("type======>", type);
    console.log("value======>", value);
    return (req, res, next) => {
        const dataToValidate = value === 'body' ? req.body :
            value === 'query' ? req.query :
                value === 'params' ? req.params :
                    undefined;
        console.log("dataToValidate======>", dataToValidate);
        if (!dataToValidate) {
            return next(new HttpException_1.default(400, 'Invalid request target'));
        }
        const obj = (0, class_transformer_1.plainToInstance)(type, dataToValidate);
        (0, class_validator_1.validate)(obj, {
            skipMissingProperties,
            whitelist,
            forbidNonWhitelisted,
        }).then((errors) => {
            if (errors.length > 0) {
                const message = errors.map(getAllNestedErrors).join(', ');
                next(new HttpException_1.default(400, message));
            }
            else {
                next();
            }
        });
    };
};
exports.default = validationMiddleware;
//# sourceMappingURL=validation.middleware.js.map