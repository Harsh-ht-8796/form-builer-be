"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
beforeAll(async () => {
    await (0, db_1.connect)();
});
afterAll(async () => {
    await (0, db_1.disconnect)();
});
//# sourceMappingURL=setupFile.js.map