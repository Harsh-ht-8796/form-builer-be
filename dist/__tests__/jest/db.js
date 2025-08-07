"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDB = exports.disconnect = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const connect = async () => {
    await mongoose_1.default.connect(`${process.env.MONGO_URI}/${config_1.default.Database}`);
};
exports.connect = connect;
const disconnect = async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
    await mongoose_1.default.disconnect();
};
exports.disconnect = disconnect;
const clearDB = async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};
exports.clearDB = clearDB;
//# sourceMappingURL=db.js.map