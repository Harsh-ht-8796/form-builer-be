"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenTypes = exports.MODELS = void 0;
var MODELS;
(function (MODELS) {
    MODELS["USERS"] = "USERS";
    MODELS["TOKENS"] = "TOKENS";
    MODELS["FORMS"] = "FORMS";
    MODELS["ORGANIZATIONS"] = "ORGANIZATIONS";
    MODELS["SUBMISSIONS"] = "SUBMISSIONS";
})(MODELS || (exports.MODELS = MODELS = {}));
var TokenTypes;
(function (TokenTypes) {
    TokenTypes["ACCESS"] = "access";
    TokenTypes["REFRESH"] = "refresh";
    TokenTypes["RESET_PASSWORD"] = "resetPassword";
})(TokenTypes || (exports.TokenTypes = TokenTypes = {}));
