"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const form_auth_middleware_1 = __importDefault(require("./form.auth.middleware"));
const form_model_1 = __importDefault(require("../models/form.model"));
const users_model_1 = __importDefault(require("../models/users.model"));
const conditionalAuth = (compareField = 'id') => {
    return async (req, res, next) => {
        const id = req.params[compareField];
        const objectId = mongoose_1.Types.ObjectId.isValid(id) ? new mongoose_1.Types.ObjectId(id) : null;
        if (!objectId) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        // Fetch form with only needed fields
        const form = await form_model_1.default.findById(objectId, {
            settings: 1,
            allowedEmails: 1,
            allowedDomains: 1,
        }).lean();
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        // PUBLIC: query check
        if (await form_model_1.default.exists({ _id: objectId, 'settings.visibility': 'public' })) {
            return next();
        }
        // Require auth for private/domain_restricted
        return (0, form_auth_middleware_1.default)()(req, res, async (err) => {
            var _a;
            if (err)
                return next(err);
            const authHeader = req.headers.authorization;
            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                return res.status(401).json({ error: 'Missing Authorization header' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!(decoded === null || decoded === void 0 ? void 0 : decoded.sub) || !mongoose_1.Types.ObjectId.isValid(decoded.sub)) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            const user = await users_model_1.default.findById(decoded.sub).lean();
            if (!(user === null || user === void 0 ? void 0 : user.email)) {
                return res.status(401).json({ error: 'User not found or no email' });
            }
            const userEmail = user.email;
            const userDomain = (_a = userEmail.split('@')[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            // PRIVATE: use query with $in
            const privateAllowed = await form_model_1.default.exists({
                _id: objectId,
                'settings.visibility': 'private',
                allowedEmails: userEmail,
            });
            if (privateAllowed)
                return next();
            // DOMAIN_RESTRICTED: use query with $in
            const domainAllowed = await form_model_1.default.exists({
                _id: objectId,
                'settings.visibility': 'domain_restricted',
                allowedDomains: { $in: [userDomain] },
            });
            if (domainAllowed)
                return next();
            return res.status(403).json({ error: 'Access denied' });
        });
    };
};
exports.default = conditionalAuth;
//# sourceMappingURL=conditional.auth.js.map