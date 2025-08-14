"use strict";
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
const jwtVerify = async (payload, done) => {
    try {
        if (payload.type !== constants_1.TokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const user = await users_model_1.default.findById(payload.sub);
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
};
exports.jwtStrategy = new passport_jwt_1.Strategy(jwtOptions, jwtVerify);
//# sourceMappingURL=passport.js.map