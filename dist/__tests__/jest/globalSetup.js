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
exports.default = globalSetup;
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
function globalSetup() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (config_1.default.Memory) {
            // Config to decided if an mongodb-memory-server instance should be used
            // it's needed in global space, because we don't want to create a new instance every test-suite
            const instance = yield mongodb_memory_server_1.MongoMemoryServer.create();
            const uri = instance.getUri();
            global.__MONGOINSTANCE = instance;
            process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
        }
        else {
            process.env.MONGO_URI = config_1.default.MongoURI;
        }
        // The following is to make sure the database is clean before an test starts
        yield mongoose_1.default.connect(`${process.env.MONGO_URI}/${config_1.default.Database}`);
        yield ((_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.dropDatabase());
        yield mongoose_1.default.disconnect();
    });
}
