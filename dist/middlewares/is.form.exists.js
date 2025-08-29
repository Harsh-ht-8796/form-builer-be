"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const form_model_1 = __importDefault(require("../models/form.model"));
const isFormExists = (compareField = 'id') => {
    return async (req, res, next) => {
        const id = req.params[compareField];
        const objectId = mongoose_1.Types.ObjectId.isValid(id) ? new mongoose_1.Types.ObjectId(id) : null;
        if (!objectId || !mongoose_1.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const form = await form_model_1.default.findById(objectId).lean();
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        return next();
    };
};
exports.default = isFormExists;
//# sourceMappingURL=is.form.exists.js.map