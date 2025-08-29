"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionControllerV1 = exports.OrganizationControllerV1 = exports.FormControllerV1 = exports.UserControllerV1 = exports.AuthControllerV1 = void 0;
var auth_controller_1 = require("./auth/auth.controller");
Object.defineProperty(exports, "AuthControllerV1", { enumerable: true, get: function () { return auth_controller_1.AuthController; } });
var user_controller_1 = require("./user/user.controller");
Object.defineProperty(exports, "UserControllerV1", { enumerable: true, get: function () { return user_controller_1.UserController; } });
var form_controller_1 = require("./form/form.controller");
Object.defineProperty(exports, "FormControllerV1", { enumerable: true, get: function () { return form_controller_1.FormController; } });
var organization_controller_1 = require("./organizations/organization.controller");
Object.defineProperty(exports, "OrganizationControllerV1", { enumerable: true, get: function () { return organization_controller_1.OrganizationController; } });
var submissions_controller_1 = require("./submissions/submissions.controller");
Object.defineProperty(exports, "SubmissionControllerV1", { enumerable: true, get: function () { return submissions_controller_1.SubmissionController; } });
//# sourceMappingURL=index.js.map