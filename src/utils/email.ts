import Mustache from "mustache";

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


