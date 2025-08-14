"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const auth_middleware_1 = __importDefault(require("@middlewares/auth.middleware"));
const form_model_1 = __importDefault(require("@models/form.model"));
const conditionalAuth = (compareField = 'id') => {
    return async (req, res, next) => {
        var _a;
        const id = req.params[compareField];
        const objectId = mongoose_1.Types.ObjectId.isValid(id) ? new mongoose_1.Types.ObjectId(id) : null;
        if (!objectId || !mongoose_1.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const form = await form_model_1.default.findById(objectId).lean();
        console.log('Conditional :', objectId);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        if (!((_a = form.settings) === null || _a === void 0 ? void 0 : _a.visibility.includes('private'))) {
            return next();
        }
        return (0, auth_middleware_1.default)()(req, res, next);
    };
};
exports.default = conditionalAuth;
//# sourceMappingURL=conditional.auth.js.map