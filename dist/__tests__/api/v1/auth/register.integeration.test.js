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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const db_1 = require("@__tests__/jest/db");
const factories_1 = require("@__tests__/jest/factories");
const factories_2 = require("@__tests__/jest/factories");
const _app_1 = __importDefault(require("@app"));
const index_1 = require("@v1/index");
let server;
const baseUrl = '/api/v1/auth';
describe('register test suit', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_1.clearDB)();
        const app = new _app_1.default([index_1.AuthControllerV1]);
        yield _app_1.default.initDB();
        server = (0, supertest_1.default)(app.getServer());
    }));
    test('email is not valid', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            email: 'notemail',
            username: 'abcabc',
            password: '123123',
        };
        const { body } = yield server.post(`${baseUrl}/register`).send(newUser).expect(400);
        expect(body.message).toBe('email must be an email');
    }));
    test('username should at least 4 character', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            email: factories_1.fakerData.internet.email(),
            username: 'abc',
            password: '123123',
        };
        const { body } = yield server.post(`${baseUrl}/register`).send(newUser).expect(400);
        expect(body.message).toBe('username must be longer than or equal to 4 characters');
    }));
    test('password should at least 6 character', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            email: factories_1.fakerData.internet.email(),
            username: 'abcd',
            password: '1231',
        };
        const { body } = yield server.post(`${baseUrl}/register`).send(newUser).expect(400);
        expect(body.message).toBe('password must be longer than or equal to 6 characters');
    }));
    test('email should be unique', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = factories_1.fakerData.internet.email();
        yield (0, factories_2.userFactory)({ email });
        const newUser2 = {
            email: email,
            username: 'abcd',
            password: '123123',
        };
        const { body } = yield server.post(`${baseUrl}/register`).send(newUser2).expect(500);
        expect(body.message).toBe('Email already Taken');
    }));
    test('email should be unique', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            email: factories_1.fakerData.internet.email(),
            username: factories_1.fakerData.internet.userName(),
            password: factories_1.fakerData.internet.password(),
        };
        const { body } = yield server.post(`${baseUrl}/register`).send(newUser).expect(201);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password } = newUser, userResult = __rest(newUser, ["password"]);
        expect(body.user).toMatchObject(userResult);
        expect(body.tokens).toBeDefined();
        expect(body.tokens.access.token).toBeDefined();
        expect(body.tokens.refresh.token).toBeDefined();
    }));
});
