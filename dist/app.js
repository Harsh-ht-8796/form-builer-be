"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line simple-import-sort/imports
require("reflect-metadata");
const config_1 = require("./config");
// import * as Sentry from '@sentry/node';
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const routing_controllers_1 = require("routing-controllers");
const express_xss_sanitizer_1 = require("express-xss-sanitizer");
const handlingErrors_middleware_1 = __importDefault(require("./middlewares/handlingErrors.middleware"));
const routingControllersUtils_1 = require("./utils/routingControllersUtils");
const logger_1 = __importDefault(require("./utils/logger"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
class App {
    constructor(controllers) {
        this.controllers = [];
        this.initWebServer = async () => {
            return new Promise(resolve => {
                console.log(`✅ http://localhost:${this.port}`);
                this.serverConnection = this.app.listen(this.port, () => {
                    var _a;
                    console.log(`✅  Ready on port http://localhost:${this.port}`);
                    resolve((_a = this.serverConnection) === null || _a === void 0 ? void 0 : _a.address());
                });
            });
        };
        this.initServerWithDB = async () => {
            console.log("Called initServerDB");
            await Promise.all([App.initDB(), this.initWebServer()]);
        };
        this.stopWebServer = async () => {
            console.log("Called stopWebServer");
            return new Promise(resolve => {
                var _a;
                (_a = this.serverConnection) === null || _a === void 0 ? void 0 : _a.close(() => {
                    resolve(void 0);
                });
            });
        };
        this.getServer = () => {
            return this.app;
        };
        this.app = (0, express_1.default)();
        logger_1.default.info(`✅  Ready on port http://localhost:${config_1.PORT}`);
        this.port = config_1.PORT || 8080;
        console.log({ PORT: config_1.PORT });
        this.controllers = controllers;
        this.initSentry();
        this.initMiddlewares();
        this.initRoutes(controllers);
        this.initHandlingErrors();
    }
    initSentry() {
        // if (isProduction) {
        //   Sentry.init({ dsn: SENTRY_DSN });
        //   this.app.use(Sentry.Handlers.requestHandler() as RequestHandler);
        // }
    }
    initMiddlewares() {
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({ origin: config_1.CORS_ORIGINS, credentials: config_1.CREDENTIALS }));
        // this.app.use(express.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, hpp_1.default)());
        this.app.use((0, express_xss_sanitizer_1.xss)());
        this.app.use((0, morgan_1.default)('combined', {
            stream: {
                write: message => logger_1.default.info(message.trim()),
            },
        }));
        this.app.use((0, cookie_parser_1.default)());
        // JWT authentication
        this.app.use(passport_1.default.initialize());
        passport_1.default.use('jwt', config_1.jwtStrategy);
    }
    initRoutes(controllers) {
        (0, routing_controllers_1.useExpressServer)(this.app, {
            cors: {
                origin: config_1.CORS_ORIGINS,
                credentials: config_1.CREDENTIALS,
            },
            routePrefix: '/api',
            controllers: controllers,
            defaultErrorHandler: false,
            authorizationChecker: routingControllersUtils_1.authorizationChecker,
            currentUserChecker: routingControllersUtils_1.currentUserChecker,
        });
    }
    initHandlingErrors() {
        // if (isProduction) {
        //   this.app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);
        // }
        this.app.use(handlingErrors_middleware_1.default);
    }
    static async initDB() {
        await mongoose_1.default.connect(`${config_1.MONGO_URI}/${config_1.DATABASE}`);
    }
    static async closeDB() {
        await mongoose_1.default.disconnect();
    }
    get getControllers() {
        return this.controllers;
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map