"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakerData = void 0;
function getRandomInt(min = 1, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
class faker {
    get internet() {
        return {
            email: () => `test${getRandomInt()}@gmail.com`,
            userName: () => `test${getRandomInt()}`,
            password: () => `12345${getRandomInt()}`,
        };
    }
}
exports.fakerData = new faker();
