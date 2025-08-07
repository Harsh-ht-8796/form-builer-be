// eslint-disable-next-line simple-import-sort/imports
import 'reflect-metadata';
import { CORS_ORIGINS, CREDENTIALS, MONGO_URI, DATABASE, isProduction, PORT, SENTRY_DSN, jwtStrategy } from './config';

// import * as Sentry from '@sentry/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, ErrorRequestHandler, RequestHandler } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import mongoose from 'mongoose';
import passport from 'passport';
import { useExpressServer } from 'routing-controllers';
import { xss } from 'express-xss-sanitizer';
import handlingErrorsMiddleware from './middlewares/handlingErrors.middleware';
import { authorizationChecker, currentUserChecker } from './utils/routingControllersUtils';
import logger from '@utils/logger';
import morgan from 'morgan';
import path from 'path';

export default class App {
  private app: Application;
  private port: string | number;
  private controllers: Function[] = [];
  private serverConnection: http.Server | undefined;
  constructor(controllers: Function[]) {
    this.app = express();
    logger.info(`✅  Ready on port http://localhost:${PORT}`);
    this.port = PORT || 8080;
    console.log({ PORT })
    this.controllers = controllers;
    this.initSentry();
    this.initMiddlewares();
    this.initRoutes(controllers);
    this.initHandlingErrors();
  }

  private initSentry() {
    // if (isProduction) {
    //   Sentry.init({ dsn: SENTRY_DSN });
    //   this.app.use(Sentry.Handlers.requestHandler() as RequestHandler);
    // }
  }

  private initMiddlewares() {
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    this.app.use(helmet());
    this.app.use(cors({ origin: CORS_ORIGINS, credentials: CREDENTIALS }));
    // this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(hpp());
    this.app.use(xss());
    this.app.use(
      morgan('combined', {
        stream: {
          write: message => logger.info(message.trim()),
        },
      }),
    );
    this.app.use(cookieParser());

    // JWT authentication
    this.app.use(passport.initialize());
    passport.use('jwt', jwtStrategy);
  }

  private initRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: CORS_ORIGINS,
        credentials: CREDENTIALS,
      },
      routePrefix: '/api',
      controllers: controllers,
      defaultErrorHandler: false,
      authorizationChecker,
      currentUserChecker,
    });
  }

  private initHandlingErrors() {
    // if (isProduction) {
    //   this.app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);
    // }
    this.app.use(handlingErrorsMiddleware as ErrorRequestHandler);
  }

  static async initDB() {
    await mongoose.connect(`${MONGO_URI}/${DATABASE}`);
  }

  static async closeDB() {
    await mongoose.disconnect();
  }

  public initWebServer = async () => {
    return new Promise(resolve => {
      console.log(`✅ http://localhost:${this.port}`);
      this.serverConnection = this.app.listen(this.port, () => {
        console.log(`✅  Ready on port http://localhost:${this.port}`);
        resolve(this.serverConnection?.address());
      });
    });
  };

  public initServerWithDB = async () => {
    console.log("Called initServerDB")
    await Promise.all([App.initDB(), this.initWebServer()]);
  };

  public stopWebServer = async () => {
    console.log("Called stopWebServer")
    return new Promise(resolve => {
      this.serverConnection?.close(() => {
        resolve(void 0);
      });
    });
  };

  public getServer = () => {
    return this.app;
  };

  public get getControllers() {
    return this.controllers;
  }
}
