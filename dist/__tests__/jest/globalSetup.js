"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalSetup;
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
async function globalSetup() {
    var _a;
    if (config_1.default.Memory) {
        // Config to decided if an mongodb-memory-server instance should be used
        // it's needed in global space, because we don't want to create a new instance every test-suite
        const instance = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = instance.getUri();
        global.__MONGOINSTANCE = instance;
        process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
    }
    else {
        process.env.MONGO_URI = config_1.default.MongoURI;
    }
    // The following is to make sure the database is clean before an test starts
    await mongoose_1.default.connect(`${process.env.MONGO_URI}/${config_1.default.Database}`);
    await ((_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.dropDatabase());
    await mongoose_1.default.disconnect();
}
//# sourceMappingURL=globalSetup.js.map