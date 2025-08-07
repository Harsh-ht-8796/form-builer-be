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
exports.userFactory = userFactory;
const users_model_1 = __importDefault(require("@models/users.model"));
const faker_1 = require("./faker");
function userFactory() {
    return __awaiter(this, arguments, void 0, function* (user = {}) {
        return users_model_1.default.create(Object.assign({ email: faker_1.fakerData.internet.email(), username: faker_1.fakerData.internet.userName(), password: faker_1.fakerData.internet.password() }, user));
    });
}
