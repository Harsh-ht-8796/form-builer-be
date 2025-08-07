"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const handlingErrors = (error, req, res, next) => {
    try {
        const statusCode = error.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error.message || (0, http_status_codes_1.getReasonPhrase)(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        res.status(statusCode).json({ message });
    }
    catch (err) {
        next(err);
    }
};
exports.default = handlingErrors;
//# sourceMappingURL=handlingErrors.middleware.js.map