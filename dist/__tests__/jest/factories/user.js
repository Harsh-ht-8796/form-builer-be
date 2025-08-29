"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFactory = userFactory;
const users_model_1 = __importDefault(require("../../../models/users.model"));
const faker_1 = require("./faker");
async function userFactory(user = {}) {
    return users_model_1.default.create(Object.assign({ email: faker_1.fakerData.internet.email(), username: faker_1.fakerData.internet.userName(), password: faker_1.fakerData.internet.password() }, user));
}
//# sourceMappingURL=user.js.map