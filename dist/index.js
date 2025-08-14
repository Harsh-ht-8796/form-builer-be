"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@v1/index");
const app_1 = __importDefault(require("./app"));
const _config_1 = require("@config");
// function initSwagger(server: App) {
//   const schemas = validationMetadatasToSchemas({
//     classValidatorMetadataStorage: getMetadataStorage(),
//     refPointerPrefix: '#/components/schemas/',
//   });
//   const routingControllersOptions = {
//     controllers: server.getControllers,
//   };
//   const storage = getMetadataArgsStorage();
//   const spec = routingControllersToSpec(storage, routingControllersOptions, {
//     components: {
//       schemas,
//       securitySchemes: {
//         basicAuth: {
//           scheme: 'basic',
//           type: 'http',
//         },
//       },
//     },
//     info: {
//       description: 'API Generated with `routing-controllers-openapi` package',
//       title: 'API',
//       version: '1.0.0',
//     },
//   });
//   server.getServer().use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
// }
const server = new app_1.default([index_1.AuthControllerV1, index_1.UserControllerV1, index_1.SubmissionControllerV1, index_1.FormControllerV1, index_1.OrganizationControllerV1]);
// initSwagger(server);
(async () => {
    console.log(`✅  Ready on port http://localhost:${_config_1.PORT}`);
    await server.initServerWithDB();
})();
const gracefulShutdown = async () => {
    try {
        await server.stopWebServer();
        await app_1.default.closeDB();
        console.log(`Process ${process.pid} received a graceful shutdown signal`);
        process.exit(0);
    }
    catch (error) {
        console.log(`graceful shutdown Process ${process.pid} got failed!`);
        process.exit(1);
    }
};
process.on('SIGTERM', gracefulShutdown).on('SIGINT', gracefulShutdown);
//# sourceMappingURL=index.js.map