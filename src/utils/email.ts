import Mustache from "mustache";
import fs from "fs";
import path from "path";
import { TemplateType } from "@common/types/template-type.enum";
import { NODERED_URL } from "@config";


export const template = `
  <html>
    <body>
      <h1>Hello {{name}}</h1>
      <p>Your order ID is {{orderId}}</p>
    </body>
  </html>
`;

export const data = {
  name: "Harsh",
  orderId: "ORD-12345"
};


// const NODERED_URL = process.env.NODERED_URL || "http://localhost:1880";

export async function sendEmail(
  templateType: TemplateType,
  userData: Record<string, any>,
  to: string = ""
): Promise<any> {
  let templateFile = "";

  switch (templateType) {
    case TemplateType.OrderConfirmation:
      templateFile = "order-confirmation.html";
      break;
    case TemplateType.AdminEmailVerification:
      templateFile = "admin-email-verification.html";
      break;
    case TemplateType.AdminSuccessfulSignup:
      templateFile = "admin-successful-signup.html";
      break;
    case TemplateType.FormSubmissionConfirmation:
      templateFile = "form-submission-confirmation.html";
      break;
    case TemplateType.UserForgotPassword:
      templateFile = "user-forgot-password.html";
      break;
    case TemplateType.UserInvitation:
      templateFile = "user-invitation.html";
      break;
    case TemplateType.PasswordResetSuccess:
      templateFile = "password-reset-success-email.html";
      break;
    case TemplateType.formResponseNotificationForAdmin:
      templateFile = "form-response-notification-email.html";
      break;
    case TemplateType.privateFormInvitation:
      templateFile = "private-form-invitation-email.html";
      break;
    case TemplateType.formEditNotificationForUser:
      templateFile = "form-submission-confirmation-email.html";
      break;
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }

  // ✅ Read and render template
  const templatePath = path.resolve(__dirname, "../../templates", templateFile);
  const templateHtml = fs.readFileSync(templatePath, "utf8");
  const renderedHtml = Mustache.render(templateHtml, userData);
  // console.log("Node-RED URL:", NODERED_URL);
  // console.log("Sending email to:", to);
  // console.log("Email subject:", "Test Email - " + templateType);
  return fetch(NODERED_URL + "/send-email", {
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