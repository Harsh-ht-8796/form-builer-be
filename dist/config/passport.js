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
exports.jwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const constants_1 = require("@common/constants");
const users_model_1 = __importDefault(require("@models/users.model"));
const index_1 = require("./index");
const jwtOptions = {
    secretOrKey: index_1.jwt.secret,
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    passReqToCallback: false,
};
const jwtVerify = (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (payload.type !== constants_1.TokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const user = yield users_model_1.default.findById(payload.sub);
        if (!user) {
            return done(null, false);
        }
        // If the token has roles, update the user object with them
        if (payload.roles) {
            user.roles = payload.roles;
        }
        done(null, user);
    }
    catch (error) {
        done(error, false);
    }
});
exports.jwtStrategy = new passport_jwt_1.Strategy(jwtOptions, jwtVerify);
