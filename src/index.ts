import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';
import {
  getMetadataStorage,
} from 'class-validator'

import { AuthControllerV1, FormControllerV1, OrganizationControllerV1, SubmissionControllerV1, UserControllerV1 } from '@v1/index';

import App from './app';

function initSwagger(server: App) {
  const schemas = validationMetadatasToSchemas({
    classValidatorMetadataStorage: getMetadataStorage(),
    refPointerPrefix: '#/components/schemas/',
  });
  const routingControllersOptions = {
    controllers: server.getControllers,
  };
  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
      schemas,
      securitySchemes: {
        basicAuth: {
          scheme: 'basic',
          type: 'http',
        },
      },
    },
    info: {
      description: 'API Generated with `routing-controllers-openapi` package',
      title: 'API',
      version: '1.0.0',
    },
  });
  server.getServer().use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}

const server = new App([AuthControllerV1, UserControllerV1, SubmissionControllerV1, FormControllerV1, OrganizationControllerV1]);
initSwagger(server);

(async () => {
  await server.initServerWithDB();
})();

const gracefulShutdown = async () => {
  try {
    await server.stopWebServer();
    await App.closeDB();

    console.log(`Process ${process.pid} received a graceful shutdown signal`);
    process.exit(0);
  } catch (error) {
    console.log(`graceful shutdown Process ${process.pid} got failed!`);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown).on('SIGINT', gracefulShutdown);
