"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = exports.template = void 0;
exports.sendEmail = sendEmail;
const mustache_1 = __importDefault(require("mustache"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const template_type_enum_1 = require("../common/types/template-type.enum");
const _config_1 = require("../config");
exports.template = `
  <html>
    <body>
      <h1>Hello {{name}}</h1>
      <p>Your order ID is {{orderId}}</p>
    </body>
  </html>
`;
exports.data = {
    name: "Harsh",
    orderId: "ORD-12345"
};
// const NODERED_URL = process.env.NODERED_URL || "http://localhost:1880";
async function sendEmail(templateType, userData, to = "") {
    let templateFile = "";
    switch (templateType) {
        case template_type_enum_1.TemplateType.OrderConfirmation:
            templateFile = "order-confirmation.html";
            break;
        case template_type_enum_1.TemplateType.AdminEmailVerification:
            templateFile = "admin-email-verification.html";
            break;
        case template_type_enum_1.TemplateType.AdminSuccessfulSignup:
            templateFile = "admin-successful-signup.html";
            break;
        case template_type_enum_1.TemplateType.FormSubmissionConfirmation:
            templateFile = "form-submission-confirmation.html";
            break;
        case template_type_enum_1.TemplateType.UserForgotPassword:
            templateFile = "user-forgot-password.html";
            break;
        case template_type_enum_1.TemplateType.UserInvitation:
            templateFile = "user-invitation.html";
            break;
        case template_type_enum_1.TemplateType.PasswordResetSuccess:
            templateFile = "password-reset-success-email.html";
            break;
        case template_type_enum_1.TemplateType.formResponseNotificationForAdmin:
            templateFile = "form-response-notification-email.html";
            break;
        case template_type_enum_1.TemplateType.privateFormInvitation:
            templateFile = "private-form-invitation-email.html";
            break;
        case template_type_enum_1.TemplateType.formEditNotificationForUser:
            templateFile = "form-submission-confirmation-email.html";
            break;
        default:
            throw new Error(`Unknown template type: ${templateType}`);
    }
    // ✅ Read and render template
    const templatePath = path_1.default.resolve(__dirname, "../../templates", templateFile);
    const templateHtml = fs_1.default.readFileSync(templatePath, "utf8");
    const renderedHtml = mustache_1.default.render(templateHtml, userData);
    return fetch(_config_1.NODERED_URL + "/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            to,
            subject: "Test Email - " + templateType,
            html: renderedHtml,
        }),
    });
    // return {
    //   success: true,
    //   message: `Test email (${templateType}) sent to ${to} successfully.`,
    // };
}
//# sourceMappingURL=email.js.map