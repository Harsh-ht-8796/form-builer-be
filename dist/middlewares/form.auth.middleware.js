"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const routing_controllers_1 = require("routing-controllers");
const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
    if (err || info || !user) {
        const unauthorizedError = new routing_controllers_1.UnauthorizedError("Please authenticate");
        unauthorizedError.httpCode = 401; // Explicitly set httpCode
        return reject(unauthorizedError);
    }
    req.user = user;
    resolve();
};
const auth = () => async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport_1.default.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
    })
        .then(() => next())
        .catch(err => next(err));
};
exports.default = auth;
//# sourceMappingURL=form.auth.middleware.js.map