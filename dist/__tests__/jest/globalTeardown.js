"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalTeardown;
const config_1 = __importDefault(require("./config"));
async function globalTeardown() {
    if (config_1.default.Memory) {
        // Config to decided if an mongodb-memory-server instance should be used
        const instance = global.__MONGOINSTANCE;
        await instance.stop();
    }
}
//# sourceMappingURL=globalTeardown.js.map