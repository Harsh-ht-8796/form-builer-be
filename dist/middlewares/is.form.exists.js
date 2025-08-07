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
const mongoose_1 = require("mongoose");
const form_model_1 = __importDefault(require("@models/form.model"));
const isFormExists = (compareField = 'id') => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params[compareField];
        const objectId = mongoose_1.Types.ObjectId.isValid(id) ? new mongoose_1.Types.ObjectId(id) : null;
        if (!objectId || !mongoose_1.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const form = yield form_model_1.default.findById(objectId).lean();
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        return next();
    });
};
exports.default = isFormExists;
